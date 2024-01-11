import json

from django.db.utils import DataError, IntegrityError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from storage.models import Group, IconChoices

from .common import GroupTestCaseBase


class GroupCreationUnitTest(GroupTestCaseBase):
    def test_group_without_required_fields(self):
        self.assertRaises(ValueError, self._create_group)

    def test_group_name_over_max_length(self):
        name = "LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliquaUtencimadveniamquisnostrudexercitationullamcolaborisnisiutaliquipexeacommodoconsequatDuisauteiruredolorinreprehenderitinvoluptatevelitessecillumdoloreeufugiatnullapariaturExcepteursintoccaecatcupidatatnonproidentsuntinculpaquiofficiadeseruntmollitanimidestlaborum"  # noqa
        self.assertTrue(len(name) > 128)
        self.assertRaises(DataError, self._create_group, name=name)

    def test_group_description_over_max_length(self):
        description = (
            "LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliquaUtencimadveniamquisnostrudexercitationullamcolaborisnisiutaliquipexeacommodoconsequatDuisauteiruredolorinreprehenderitinvoluptatevelitessecillumdoloreeufugiatnullapariaturExcepteursintoccaecatcupidatatnonproidentsuntinculpaquiofficiadeseruntmollitanimidestlaborum"  # noqa
            * 2
        )
        self.assertTrue(len(description) > 512)
        self.assertRaises(
            DataError,
            self._create_group,
            name="TestGroup",
            description=description,
        )

    def test_group_icon_choices(self):
        icon_choices = [choice for choice in IconChoices.values]
        for icon in icon_choices:
            _group = self._create_group(name="TestGroup", icon=icon)
            self.assertTrue(type(_group) is Group)

        self.assertRaises(
            IntegrityError,
            self._create_group,
            name="TestGroup",
            icon="NonExistentIcon",
        )


class GroupCreateViewTest(GroupTestCaseBase):
    def test_create_group_success(self):
        data = {
            "name": "TestGroup",
            "description": "group for testing purposes",
            "icon": "music",
        }
        response = self.client.post(
            reverse("groups"),
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response_data = response.json()
        self.assertDefaults(response_data["id"], data)

    def test_create_group_missing_required_fields(self):
        data = {
            "description": "group for testing purposes",
            "icon": "music",
        }
        response = self.client.post(
            reverse("groups"),
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_group_missing_icon(self):
        data = {
            "name": "TestGroup",
            "description": "group for testing purposes",
        }
        response = self.client.post(
            reverse("groups"),
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response_data = response.json()
        self.assertDefaults(response_data["id"], data)
        self.assertEqual(response_data["icon"], "default")


class CreateGroupUnauthorizedTest(APITestCase):
    def test_create_group_success(self):
        data = {
            "name": "TestGroup",
            "description": "group for testing purposes",
            "icon": "music",
        }
        response = self.client.post(
            reverse("groups"),
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
