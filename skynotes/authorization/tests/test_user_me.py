from django.test import TestCase
from django.urls import reverse
from rest_framework import status, test

from authorization.views import UserMeView
from authorization.tests.common import force_authenticate

from django.contrib.auth import get_user_model


User = get_user_model()


class UserMeViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@test.com", password="password")
        self.api_client = test.APIClient()

    def test_get_me_not_authenticated(self):
        response = self.api_client.get(reverse("user-me"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_me_authenticated(self):
        force_authenticate(self.user, client=self.api_client)

        response = self.api_client.get(reverse("user-me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
