from authorization.serializers import (
    CustomTokenObtainPairSerializer,
    InActiveUser,
    UserSerializer,
)
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import (
    AuthenticationFailed,
    InvalidToken,
    TokenError,
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
    TokenViewBase,
)

User = get_user_model()


class UserCreateView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = "id"
    permission_classes = [IsAuthenticated]


# Cookie JWT


class EmailTokenObtainPairView(TokenViewBase):
    """
    Takes a set of user credentials and returns an access and refresh JSON web
    token pair to prove the authentication of those credentials.
    """

    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed:
            raise InActiveUser()
        except TokenError:
            raise InvalidToken()

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        response.set_cookie(
            key=settings.AUTH_COOKIE,
            value=serializer.validated_data["access"],
            expires=settings.ACCESS_TOKEN_LIFETIME,
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )
        response.set_cookie(
            key=settings.REFRESH_COOKIE,
            value=serializer.validated_data["refresh"],
            expires=settings.ACCESS_TOKEN_LIFETIME,
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    Takes a refresh type JSON web token and returns an access type JSON web
    token if the refresh token is valid.
    """

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.REFRESH_COOKIE)

        if refresh_token:
            request.data["refresh"] = refresh_token

        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            response.set_cookie(
                key=settings.AUTH_COOKIE,
                value=response.data.get("access"),
                expires=settings.ACCESS_TOKEN_LIFETIME,
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )

            return response


class CustomTokenVerifyView(TokenVerifyView):
    """
    Takes a token and returns correct HTTP status if it is valid or not.
    """

    def post(self, request, *args, **kwargs):
        access_token = request.COOKIES.get(settings.AUTH_COOKIE)

        if access_token:
            request.data["token"] = access_token

        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    """
    Logout user by deleting cookies.
    """

    serializer_class = None

    def post(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(settings.AUTH_COOKIE)
        response.delete_cookie(settings.REFRESH_COOKIE)

        return response
