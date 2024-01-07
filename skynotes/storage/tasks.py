import base64
from celery import shared_task
from storage.models import File
from django.core.files.base import ContentFile


def next_status(file: File):
    file.status += 1
    file.save()


@shared_task
def handle_file_upload(file_id: str, ext: str, content: bytes):
    file_object = File.objects.get(id=file_id)

    next_status(file_object)  # Move status to "Processing"

    decoded_bytes = base64.b64decode(content.decode(encoding="utf-8"))

    file_data = ContentFile(decoded_bytes)
    file_object.file.save(f"{file_object.id}.{ext}", file_data)

    next_status(file_object)  # Completed/move to next service
