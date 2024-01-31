import base64

from django.db import models
from rest_framework import serializers
from storage.models import File, Group
from storage.tasks import handle_file_upload


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "created_at", "updated_at", "name", "icon", "description"]
        read_only_fields = ["id", "created_at", "updated_at"]


class GroupDetailsSerializer(GroupSerializer):
    files = serializers.SerializerMethodField(method_name="get_files_count")
    size = serializers.SerializerMethodField(method_name="get_files_size")

    class Meta(GroupSerializer.Meta):
        fields = GroupSerializer.Meta.fields + ["files", "size"]
        read_only_fields = GroupSerializer.Meta.read_only_fields + ["files"]

    def get_files_count(self, obj: Group):
        """
        Get the number of files associated with a given group.

        Parameters:
            obj (Group): The group object for which to retrieve the file count.

        Returns:
            int: The total count of files associated with the group.
        """
        return File.objects.filter(group=obj.id).count()

    def get_files_size(self, obj: Group) -> int:
        """
        Get the total size of files associated with a given group.

        Parameters:
            obj (Group): The group object for which to retrieve the file size.

        Returns:
            int: The total size of files associated with the group, in bytes.
        """
        return File.objects.filter(group=obj.id).aggregate(models.Sum("size"))["size__sum"]


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = [
            "id",
            "created_at",
            "updated_at",
            "name",
            "group",
            "description",
            "tags",
            "status",
            "file",
            "size",
            "thumbnail",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "status",
            "size",
            "thumbnail",
        ]

    def _get_file_ext(self, name: str):
        return name.split(".")[-1]

    def _get_valid_filename(self, name: str, file_obj):
        ext_from_file = self._get_file_ext(file_obj.name)

        if not name.lower().endswith(ext_from_file.lower()):
            name = f"{name}.{ext_from_file}"

        return name

    def validate(self, attrs):
        for key in attrs:
            if attrs[key] == "":
                attrs[key] = None
            if attrs[key] == [""]:
                attrs[key] = []

        attrs["name"] = self._get_valid_filename(attrs["name"], attrs["file"])

        return super().validate(attrs)

    def save(self, **kwargs):
        file = self.validated_data.get("file")

        self.validated_data["size"] = file.size

        bytes = base64.b64encode(file.read())

        self.validated_data.pop("file")

        data = super().save(**kwargs)

        ext = self._get_file_ext(data.name)

        handle_file_upload.delay(file_id=data.id, ext=ext, content=bytes)

        return data
