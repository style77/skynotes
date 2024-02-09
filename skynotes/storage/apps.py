from django.apps import AppConfig


class StorageConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "storage"

    def ready(self) -> None:
        from common.bus import bus
        from storage.tasks import (
            handle_file_upload,
            handle_thumbnail_generation,
            wrap_celery_task,
        )

        bus.register_listener("file:created", wrap_celery_task(handle_file_upload))
        bus.register_listener(
            "file:uploaded", wrap_celery_task(handle_thumbnail_generation)
        )
        return super().ready()
