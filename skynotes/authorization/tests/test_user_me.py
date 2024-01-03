from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from authorization.tests.common import force_authenticate

from django.contrib.auth import get_user_model


User = get_user_model()


class UserMeViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@test.com", password="password")

    def test_get_me_not_authenticated(self):
        response = self.client.get(reverse("user-me"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_me_authenticated(self):
        force_authenticate(self.user, client=self.client)

        response = self.client.get(reverse("user-me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
