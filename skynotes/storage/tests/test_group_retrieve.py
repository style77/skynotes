from django.contrib.auth import get_user_model
from django.urls import reverse
from storage.tests.common import GroupTestCaseBase

User = get_user_model()


class GroupRetrieveViewTest(GroupTestCaseBase):
    def setUp(self):
        super().setUp()
        self.group = self._create_group(name="Test Group", owner=self.user)

        self.user2 = User.objects.create_user(email="test2@test.com")

    def test_retrieve_group_success(self):
        response = self.client.get(
            reverse("group-details", kwargs={"id": self.group.id}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Test Group")

    def test_retrieve_group_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(
            reverse("group-details", kwargs={"id": self.group.id}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_retrieve_group_not_owner(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(
            reverse("group-details", kwargs={"id": self.group.id}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)

    def test_retrieve_group_not_found(self):
        response = self.client.get(
            reverse("group-details", kwargs={"id": 999}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)

    def test_retrieve_group_invalid_id(self):
        response = self.client.get(
            reverse("group-details", kwargs={"id": "invalid_id"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
