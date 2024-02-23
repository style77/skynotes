from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from storage.tests.common import FileTestCaseBase


class FileCreationUnitTest(FileTestCaseBase):
    def test_file_create(self):
        """
        Test if the file is created successfully with use of helper function.
        """
        file = self._create_file("test_file", simple_file=True)
        self.assertEqual(file.name, "test_file")


class FileCreateViewTest(FileTestCaseBase):
    def test_file_create_view(self):
        """
        Test if the file is created successfully with use of API endpoint.
        """
        url = reverse("files")
        data = {
            "name": "test_file",
            "file": SimpleUploadedFile(
                "TEST.txt",
                b"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",  # noqa: E501
            ),
        }
        response = self.client.post(url, data, format="multipart")

        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.data["name"], "test_file.txt")
        self.assertEqual(response.data["size"], 445)
