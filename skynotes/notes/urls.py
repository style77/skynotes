from django.urls import path

from notes.views import FilesListView, FilesGroupedListView


urlpatterns = [
    path("files/", FilesListView.as_view()),
    path("files/<group>/", FilesGroupedListView.as_view()),
]
