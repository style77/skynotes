import os

from authorization.tests.common import force_authenticate
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import (
    InMemoryUploadedFile,
    SimpleUploadedFile,
    TemporaryUploadedFile,
)
from django.test.client import BOUNDARY, MULTIPART_CONTENT, encode_multipart
from django.urls import reverse
from rest_framework.test import APITestCase
from storage.models import File, Group

User = get_user_model()


class GroupTestCaseBase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@test.com", password="password")
        force_authenticate(self.user, client=self.client)

    def _create_group(self, **kwargs):
        if not kwargs.get("name"):
            raise ValueError("Name is required argument for Group.")

        owner = kwargs.get("owner", self.user)
        kwargs.pop("owner", None)
        group = Group.objects.create(**kwargs, owner=owner)

        return group

    def assertDefaults(self, group_id: str, data: dict):
        group = Group.objects.get(pk=group_id)

        self.assertEqual(group.name, data["name"])
        self.assertEqual(group.description, data.get("description"))
        self.assertEqual(group.icon, data.get("icon", "default"))


class FileTestCaseBase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@test.com", password="password")
        force_authenticate(self.user, client=self.client)

    def _create_file(
        self, name: str, *, simple_file: bool = False, file_path: str = None, **kwargs
    ):
        if simple_file:
            file = SimpleUploadedFile(
                "TEST.txt",
                b"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",  # noqa: E501
            )
        else:
            if not file_path:
                raise ValueError("File path is required argument for File.")

            if file_path not in os.listdir("storage/tests/test_media"):
                raise FileNotFoundError(
                    f'File "{file_path}" not found in test_media directory.'
                )

            file_path = f"storage/tests/test_media/{file_path}"
            with open(f"storage/tests/test_media/{file_path}", "rb") as f:
                file = ContentFile(f.read(), name=file_path)

        file = File.objects.create(
            name=name, file=file, size=file.size, owner=self.user, **kwargs
        )
        return file
