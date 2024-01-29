from django.contrib.auth import get_user_model
from django.urls import reverse

from .common import GroupTestCaseBase

User = get_user_model()


class GroupListViewTest(GroupTestCaseBase):
    def setUp(self):
        super().setUp()
        self.group = self._create_group(name="Test Group", owner=self.user)

        self.user2 = User.objects.create_user(email="test2@test.com")

    def test_list_groups_success(self):
        response = self.client.get(
            reverse("groups"),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test Group")

    def test_list_groups_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(
            reverse("groups"),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_list_groups_not_owner(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(
            reverse("groups"),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)
