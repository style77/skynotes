import base64

from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from services.grpc_client import Client
from common.chain import AbstractHandler
from storage.models import File


def next_status(file: File):
    file.status += 1
    file.save()


def update_file_status(func):
    def wrapper(self, request):
        file_id, *args = request

        file_object = File.objects.get(id=file_id)

        next_status(file_object)
        return func(self, request)

    return wrapper


class UploadAbstractHandler(AbstractHandler):
    @staticmethod
    def get_file(file_id: str):
        return File.objects.get(id=file_id)

    @staticmethod
    def get_file_data(content: bytes, decode=False):
        if decode:
            content = base64.b64decode(content.decode(encoding="utf-8"))

        file_data = ContentFile(content)
        return file_data


class UploadHandler(UploadAbstractHandler):
    @staticmethod
    @shared_task
    def handle_file_upload(file_id: str, extension: str, content: bytes):
        file = UploadAbstractHandler.get_file(file_id)

        file_data = UploadAbstractHandler.get_file_data(content, decode=True)

        file.file.save(f"{file.id}.{extension}", file_data)

    @update_file_status
    def handle(self, request):
        file_id, extension, content = request

        self.handle_file_upload.delay(file_id, extension, content)
        return super().handle(request)


class ThumbnailHandler(UploadAbstractHandler):
    @staticmethod
    @shared_task
    def handle_thumbnail_generation(file_id: str, content: bytes):
        file = UploadAbstractHandler.get_file(file_id)
        file_data = UploadAbstractHandler.get_file_data(content, decode=True)

        try:
            value = Client(settings.GRPC_ADDR).generate_thumbnail(file_data.read())

            file_data = UploadAbstractHandler.get_file_data(value, decode=False)

            file.thumbnail.save(f"{file.id}_thumb.png", file_data)
        except Exception as e:
            print(e)

    @update_file_status
    def handle(self, request):
        file_id, _, content = request
        self.handle_thumbnail_generation.delay(file_id, content)
        return super().handle(request)
