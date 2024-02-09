import base64

from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from services.grpc_client import Client
from storage.models import File

from common.bus import bus


def get_file(file_id: str) -> File:
    return File.objects.get(id=file_id)


def get_file_data(content: bytes, decode=False) -> ContentFile:
    if decode:
        content = base64.b64decode(content.decode(encoding="utf-8"))

    file_data = ContentFile(content)
    return file_data


@shared_task
def handle_file_upload(file_id: str, extension: str, content: bytes):
    file = get_file(file_id)

    file_data = get_file_data(content, decode=True)
    file.save_file(extension, file_data)

    bus.emit("file:uploaded", file_id, extension, content)


@shared_task
def handle_thumbnail_generation(file_id: str, extension: str, content: bytes):
    file = get_file(file_id)
    file_data = get_file_data(content, decode=True)

    try:
        value = Client(settings.GRPC_ADDR).generate_thumbnail(file_data.read())

        file_data = get_file_data(value, decode=False)
        file.save_thumbnail(file_data)

        bus.emit("file:thumbnail_created", file_id, extension, content)
    except Exception as e:
        print(e)


def wrap_celery_task(task):
    def wrapper(*args, **kwargs):
        task.delay(*args, **kwargs)
    return wrapper
