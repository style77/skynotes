from authorization.views import CustomTokenRefreshView
from django.conf import settings
from django.http import JsonResponse
from rest_framework.status import HTTP_401_UNAUTHORIZED
from rest_framework_simplejwt.tokens import AccessToken


class JWTRefreshMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.user.is_authenticated:
            access_token = request.COOKIES.get(settings.AUTH_COOKIE)
            if access_token:
                try:
                    token = AccessToken(access_token)
                    if token.expired():
                        refresh_view = CustomTokenRefreshView.as_view()
                        refresh_request = request._request
                        refresh_response = refresh_view(refresh_request)

                        if refresh_response.status_code == 200:
                            new_access_token = refresh_response.data.get("access")
                            response.set_cookie(
                                settings.AUTH_COOKIE, new_access_token, httponly=True
                            )
                        else:
                            return JsonResponse(
                                {"error": "Token refresh failed"},
                                status=HTTP_401_UNAUTHORIZED,
                            )
                except Exception as e:
                    return JsonResponse({"error": str(e)}, status=HTTP_401_UNAUTHORIZED)

        return response
