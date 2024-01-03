import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from django.contrib.auth import get_user_model


User = get_user_model()


class UserCreateViewTests(APITestCase):
    def test_create_user_success(self):
        data = {
            "email": "test@test.com",
            "password": "VeryHardPassword123",
        }
        response = self.client.post(
            reverse("user-create"),
            data=json.dumps(data),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(pk=response.data["id"])
        self.assertEqual(user.email, data["email"])
        self.assertTrue(user.check_password(data["password"]))

    def test_create_user_missing_field(self):
        data = {
            "email": "test@test.com",
        }
        response = self.client.post(
            reverse("user-create"),
            data=json.dumps(data),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_create_user_invalid_password(self):
        data = {
            "email": "test@test.com",
            "password": "weak",
        }
        response = self.client.post(
            reverse("user-create"),
            data=json.dumps(data),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
