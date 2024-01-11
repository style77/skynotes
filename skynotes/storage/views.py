from drf_spectacular.utils import extend_schema
from rest_framework import parsers, status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from storage.models import File, Group
from storage.serializers import FileSerializer, GroupDetailsSerializer, GroupSerializer

from django.views import View
from django.http.response import FileResponse
from django.http import HttpResponseForbidden


class FileDetailsView(RetrieveUpdateDestroyAPIView):
    serializer_class = FileSerializer
    queryset = File.objects.all()


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

    def get_serializer_class(self):
        return GroupDetailsSerializer

    @extend_schema(
        description="Retrieve all user groups",
        responses={200: GroupDetailsSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
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

    def _check_file_access(self, request, file_id):
        """
        Checks the file access for the given user and file ID.

        Parameters:
            request (HttpRequest): The HTTP request object.
            file_id (int): The ID of the file to check access for.

        Returns:
            tuple: A tuple containing a boolean value indicating whether the user has access to the file, and the file object if access is granted, otherwise None.
        """
        user = request.user

        if not user or not user.is_authenticated:
            return False, None

        file = File.objects.get(id=file_id)

        if user.is_staff or user.is_superuser:
            return True, file

        if self.__user_permissions_to_file(user, file):
            return True, file

        return False, None

    def get(self, request, file_path, *args, **kwargs):
        file_id = file_path.split(".")[0]
        access, file = self._check_file_access(request, file_id)

        if access:
            response = FileResponse(file.file, filename=file.name)
            return response
        return HttpResponseForbidden("You are not authorized to access this media.")
