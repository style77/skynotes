from django.contrib.auth import get_user_model
from django.urls import reverse
from .common import GroupTestCaseBase

User = get_user_model()


class GroupDeleteViewTest(GroupTestCaseBase):
    def setUp(self):
        super().setUp()
        self.group = self._create_group(name="Test Group", owner=self.user)

        # Unauthenticated user
        self.user2 = User.objects.create_user(email="test2@test.com", password="password")
        self.group2 = self._create_group(name="Test Group 2", owner=self.user2)

    def test_delete_group_success(self):
        response = self.client.delete(
            reverse("group-details", kwargs={"id": self.group.id}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 204)

    def test_delete_group_unauthenticated(self):
        self.assertTrue(self.group2.owner is not self.user)

        response = self.client.delete(
            reverse("group-details", kwargs={"id": self.group2.id}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)

    def test_delete_group_nonexistent(self):
        response = self.client.delete(
            reverse("group-details", kwargs={"id": "NonExistentGroup"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)

    def test_delete_group_not_owner(self):
        self.assertTrue(self.group2.owner is not self.user)

        response = self.client.delete(
            reverse("group-details", kwargs={"id": self.group2.id}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)