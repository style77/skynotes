from django.urls import path

from storage.views import FilesListView, FilesGroupedListView, GroupsListCreateView


urlpatterns = [
    path("files/", FilesListView.as_view()),
    path("files/<group>/", FilesGroupedListView.as_view()),
    path("groups/", GroupsListCreateView.as_view())
]
