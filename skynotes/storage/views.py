from rest_framework.views import APIView
from rest_framework import status, parsers
from rest_framework.response import Response
from storage.serializers import FileSerializer
from storage.models import File

from drf_spectacular.utils import extend_schema


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
        responses={200: FileSerializer},
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
