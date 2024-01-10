from django.urls import path
from storage.views import FilesGroupedListView, FilesListView, GroupListCreateView, GroupRetrieveUpdateDestroyView

urlpatterns = [
    path("files/", FilesListView.as_view()),
    path("files/<group>/", FilesGroupedListView.as_view()),
    path("groups/", GroupListCreateView.as_view()),
    path('groups/<id>/', GroupRetrieveUpdateDestroyView.as_view()),
]
