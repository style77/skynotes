from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from storage.views import MediaView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("authorization.urls")),
    path("api/", include("storage.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "media/<file_path>", MediaView.as_view(), name="media"
    )
]
