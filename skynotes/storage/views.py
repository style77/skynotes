import uuid

from authorization.authentication import JWTCookiesAuthentication
from django.core.exceptions import ValidationError
from django.http import Http404, HttpResponseBadRequest, HttpResponseForbidden
from django.http.response import FileResponse
from django.db import models
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.views import View
from drf_spectacular.utils import extend_schema
from rest_framework import parsers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from storage.services import FileService
from storage.models import FileShare
from storage.models import File, Group
from storage.serializers import FileSerializer, GroupDetailsSerializer, GroupSerializer, FileShareSerializer


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
class FileShareCreateView(CreateAPIView):
    queryset = FileShare.objects.all()
    serializer_class = FileShareSerializer

    @extend_schema(description="Share file", request=FileShareSerializer)
    def post(self, request, id, *args, **kwargs):
        file = get_object_or_404(File, id=id)
        if file.owner != request.user:
            return Response(
                {"error": "You are not authorized to share this file"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = FileShareSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(file=file)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



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

        file = request.data["file"]

        total_sum = File.objects.filter(owner=request.user).aggregate(models.Sum("size"))
        total_sum = total_sum["size__sum"] if total_sum["size__sum"] else 0

        if total_sum + file.size > request.user.storage_limit:
            return Response(
                {"error": "Storage limit exceeded"}, status=status.HTTP_400_BAD_REQUEST
            )

        request.data["size"] = file.size

        serializer = FileSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(owner=request.user, size=file.size)
            FileService.upload_file(serializer.data["id"], file.read(), file.content_type)

            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
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

    def _check_token_access(self, file_id, token, *, password=None):
        """
        Checks the file access for the given token and file ID.

        Parameters:
            file_id (int): The ID of the file to check access for.
            token (str): The token to check access for.

        Returns:
            tuple: A tuple containing a boolean value indicating whether the token
            has access to the file, and the file object if access is granted,
            otherwise None.
        """
        try:
            token = uuid.UUID(token, version=4)
        except ValueError:
            return False, None

        file_object = get_object_or_404(File, id=file_id)
        file_share_object = get_object_or_404(FileShare, file=file_object, token=token, is_active=True)

        if file_share_object.shared_until and file_share_object.shared_until < timezone.now():
            return False, None

        if file_share_object.password and file_share_object.password != password:
            return False, None

        if file_share_object.token == token:
            return True, file_object.file

        return False, None

    def get(self, request, file_path, *args, **kwargs):
        try:
            file_id = self._get_file_id(file_path)
        except ValidationError as e:
            return HttpResponseBadRequest(e.message)

        token = request.GET.get("token")
        password = request.GET.get("password")

        if not token:
            jwt_auth = JWTCookiesAuthentication()
            try:
                user_auth_tuple = jwt_auth.authenticate(request)
                if user_auth_tuple is not None:
                    request.user, request.auth = user_auth_tuple
                else:
                    return HttpResponseForbidden(
                        "You are not authorized to access this media."
                    )
            except AuthenticationFailed:
                return HttpResponseForbidden("Invalid authentication.")

        get_thumbnail = "thumbnail" in request.GET

        if token:
            access, file = self._check_token_access(file_id, token, password=password)
        else:
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
            uuid.UUID(file_id, version=4)
        except ValueError:
            raise ValidationError("Invalid ID format")

        return file_id
