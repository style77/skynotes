from authorization.tests.common import force_authenticate
from django.contrib.auth import get_user_model
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
