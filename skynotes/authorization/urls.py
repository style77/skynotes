from authorization.views import (
    CustomTokenRefreshView,
    CustomTokenVerifyView,
    EmailTokenObtainPairView,
    LogoutView,
    UserCreateView,
    UserMeView,
)
from django.urls import path

urlpatterns = [
    path(r"auth/jwt/create/", EmailTokenObtainPairView.as_view(), name="jwt-create"),
    path(r"auth/jwt/refresh/", CustomTokenRefreshView.as_view(), name="jwt-refresh"),
    path(r"auth/jwt/verify/", CustomTokenVerifyView.as_view(), name="jwt-verify"),
    path(r"auth/logout/", LogoutView.as_view(), name="logout"),
    path(r"users/", UserCreateView.as_view(), name="user-create"),
    path(r"users/me/", UserMeView.as_view(), name="user-me"),
]
