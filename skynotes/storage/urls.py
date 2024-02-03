from django.urls import path
from storage.views import (
    FileDetailsView,
    FilesGroupedListView,
    FilesListView,
    FileShareCreateView,
    GroupListCreateView,
    GroupRetrieveUpdateDestroyView,
)

urlpatterns = [
    path("file/<id>/", FileDetailsView.as_view(), name="file-detail"),
    path("files/", FilesListView.as_view(), name="files"),
    path("files/<group>/", FilesGroupedListView.as_view(), name="grouped-files"),
    path("file/<id>/share/", FileShareCreateView.as_view(), name="file-share"),
    path(
        "groups/<id>/", GroupRetrieveUpdateDestroyView.as_view(), name="group-details"
    ),
    path("groups/", GroupListCreateView.as_view(), name="groups"),
]
