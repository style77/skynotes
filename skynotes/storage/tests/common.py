import os
from authorization.tests.common import force_authenticate
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test.client import MULTIPART_CONTENT, encode_multipart, BOUNDARY
from django.core.files.base import ContentFile
from rest_framework.test import APITestCase
from storage.models import Group

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

    def _create_file(self, name: str, file_path: str, **kwargs):
        """
            Create a file with the given name and owner.
            It is required to call HTTP POST request to the endpoint
            to create the file, as the file is handled by the FileService.
        """

        # open test_media dir and check if the file exists in the directory otherwise raise an error

        if file_path not in os.listdir("test_media"):
            raise FileNotFoundError(f"File \"{file_path}\" not found in test_media directory.")

        with open(f"test_media/{file_path}", "rb") as f:
            file = ContentFile(f.read(), name=file_path)

        data = {
            "name": name,
            "file": file,
        }

        data.update(kwargs)

        response = self.client.post(
            reverse("files"),
            data=encode_multipart(data=data, boundary=BOUNDARY),
            content_type=MULTIPART_CONTENT,
        )

        return response.json()
