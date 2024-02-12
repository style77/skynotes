from django.db import models
from rest_framework import serializers
from storage.models import File, FileShare, Group


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
        total_sum = File.objects.filter(group=obj.id).aggregate(models.Sum("size"))
        return total_sum["size__sum"]


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
            "file",
            "size",
            "thumbnail",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
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
        self.validated_data.pop("file")
        return super().save(**kwargs)


class FileShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileShare
        fields = [
            "id",
            "created_at",
            "updated_at",
            "file",
            "is_active",
            "shared_until",
            "password",
            "token",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "token",
            "file",
            "is_active",
        ]
