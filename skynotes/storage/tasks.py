import base64

from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from services.client import Client
from storage.models import File


def next_status(file: File):
    file.status += 1
    file.save()


def get_file_data(content: bytes, decode=False):
    if decode:
        content = base64.b64decode(content.decode(encoding="utf-8"))

    file_data = ContentFile(content)
    return file_data


@shared_task
def handle_file_upload(file_id: str, ext: str, content: bytes):
    file_object = File.objects.get(id=file_id)

    next_status(file_object)  # Move status to "Processing"

    file_data = get_file_data(content, decode=True)
    file_object.file.save(f"{file_object.id}.{ext}", file_data)

    handle_thumbnail_generation.delay(file_id)


@shared_task
def handle_thumbnail_generation(file_id: str):
    file_object = File.objects.get(id=file_id)
    next_status(file_object)

    file_bytes = file_object.file.read()

    try:
        value = Client(settings.GRPC_ADDR).generate_thumbnail(file_bytes)

        file_data = get_file_data(value, decode=False)
        file_object.thumbnail.save(f"{file_object.id}_thumb.png", file_data)
    except Exception as e:
        print(e)
    finally:
        next_status(file_object)  # Completed/move to next service
