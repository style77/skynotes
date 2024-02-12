from django.urls import path
from storage.views import (
    FileDetailsView,
    FilesGroupedListView,
    FilesListView,
    GroupListCreateView,
    GroupRetrieveUpdateDestroyView,
)
from rest_framework.routers import DefaultRouter

file_details_router = DefaultRouter()
file_details_router.register(r"file", FileDetailsView, basename="file-detail")

urlpatterns = [
    path("files/", FilesListView.as_view(), name="files"),
    path("files/<group>/", FilesGroupedListView.as_view(), name="grouped-files"),
    path(
        "groups/<id>/", GroupRetrieveUpdateDestroyView.as_view(), name="group-details"
    ),
    path("groups/", GroupListCreateView.as_view(), name="groups"),
]

urlpatterns += file_details_router.urls
