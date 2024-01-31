import uuid

from authorization.authentication import JWTCookiesAuthentication
from django.core.exceptions import ValidationError
from django.http import Http404, HttpResponseBadRequest, HttpResponseForbidden
from django.http.response import FileResponse
from django.shortcuts import get_object_or_404
from django.views import View
from drf_spectacular.utils import extend_schema
from rest_framework import parsers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from storage.models import File, Group
from storage.serializers import FileSerializer, GroupDetailsSerializer, GroupSerializer


@extend_schema(tags=["files"])
class FileDetailsView(RetrieveUpdateDestroyAPIView):
    serializer_class = FileSerializer
    queryset = File.objects.all()
    lookup_field = "id"

    def get_queryset(self):
        return File.objects.filter(owner=self.request.user)

    @extend_schema(description="Retrieve file details", responses={200: FileSerializer})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(description="Update file details", request=FileSerializer)
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(description="Partial update file details", request=FileSerializer)
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(description="Delete file")
    def delete(self, request, *args, **kwargs):
        # remove file from storage
        file = self.get_object()
        file.file.delete()
        if file.thumbnail:
            file.thumbnail.delete()
        return super().delete(request, *args, **kwargs)


@extend_schema(tags=["files"])
class FilesListView(APIView):
    parser_classes = (parsers.MultiPartParser,)

    @extend_schema(
        description="Retrieve files without any associated group",
        responses={200: FileSerializer(many=True)},
    )
    def get(self, request, group=None, *args, **kwargs):
        files = File.objects.filter(owner=request.user, group=group).all()
        serializer = FileSerializer(files, many=True)

        return Response(serializer.data)

    @extend_schema(
        description="Upload file",
        request=FileSerializer,
        responses={201: FileSerializer},
    )
    def post(self, request, *args, **kwargs):
        serializer = FileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FilesGroupedListView(APIView):
    @extend_schema(
        description="Retrieve files with associated groups",
        responses={200: FileSerializer(many=True)},
    )
    def get(self, request, group, *args, **kwargs):
        return FilesListView.as_view()(request._request, group, *args, **kwargs)


class GroupListCreateView(ListCreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupDetailsSerializer

    def get_queryset(self):
        return Group.objects.filter(owner=self.request.user)

    @extend_schema(
        description="Retrieve all user groups",
        responses={200: FileSerializer(many=True)},
    )
    def get(self, request, group=None, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(description="Create new group", request=GroupSerializer)
    def post(self, request, *args, **kwargs):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupDetailsSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Group.objects.filter(owner=self.request.user)


class MediaView(View):
    def __user_permissions_to_file(self, user, file):
        """
        A function that checks if the given user has permissions to access the file.

        Parameters:
            user (User): The user object representing the user.
            file (File): The file object representing the file.

        Returns:
            bool: True if the user has permissions to access the file, False otherwise.
        """
        return file.owner == user

    def _check_file_access(self, request, file_id, *, get_thumbnail=False):
        """
        Checks the file access for the given user and file ID.

        Parameters:
            request (HttpRequest): The HTTP request object.
            file_id (int): The ID of the file to check access for.

        Returns:
            tuple: A tuple containing a boolean value indicating whether the user
            has access to the file, and the file object if access is granted,
            otherwise None.
        """
        user = request.user

        if not user or not user.is_authenticated:
            return False, None

        file_object = get_object_or_404(File, id=file_id)
        if get_thumbnail:
            file = file_object.thumbnail
        else:
            file = file_object.file

        if user.is_staff or user.is_superuser:
            return True, file

        if self.__user_permissions_to_file(user, file_object):
            return True, file

        return False, None

    def get(self, request, file_path, *args, **kwargs):
        try:
            file_id = self._get_file_id(file_path)
        except ValidationError as e:
            return HttpResponseBadRequest(e.message)

        jwt_auth = JWTCookiesAuthentication()
        try:
            user_auth_tuple = jwt_auth.authenticate(request)
            print(user_auth_tuple)
            if user_auth_tuple is not None:
                request.user, request.auth = user_auth_tuple
            else:
                return HttpResponseForbidden(
                    "You are not authorized to access this media."
                )
        except AuthenticationFailed:
            return HttpResponseForbidden("Invalid authentication.")

        get_thumbnail = "thumbnail" in request.GET

        access, file = self._check_file_access(
            request, file_id, get_thumbnail=get_thumbnail
        )

        if access:
            if not file:
                return Http404("File not found.")
            response = FileResponse(file, filename=file.name)
            return response
        return HttpResponseForbidden("You are not authorized to access this media.")

    def _get_file_id(self, file_path):
        file_id = file_path.split(".")[0].rstrip("_thumb")

        try:
            uuid.UUID(file_id)
        except ValueError:
            raise ValidationError("Invalid UUID format")

        return file_id
