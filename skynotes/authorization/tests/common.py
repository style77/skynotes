from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def set_credentials(token: str, client: APIClient):
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")


def set_cookies(token: str, client: APIClient):
    client.cookies["access_token"] = token


def force_authenticate(user: User, *, client: APIClient = APIClient()):
    token = RefreshToken.for_user(user)
    set_credentials(token.access_token, client)
    set_cookies(token.access_token, client)
