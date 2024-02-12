import base64
import mimetypes

from common.bus import bus
from common.service import Service
from django.db.models import Q
from storage.models import FileAnalytics, FileShare


class FileService(Service):
    @staticmethod
    def get_file_extension(mimetype: str):
        return mimetypes.guess_extension(mimetype)

    @staticmethod
    def upload_file(file_id: str, file: bytes, mimetype: str):
        file_bytes = base64.b64encode(file)
        extension = FileService.get_file_extension(mimetype)

        bus.emit("file:created", file_id, extension, file_bytes)


class FileAnalyticsService(Service):
    @staticmethod
    def create_file_analytics(token: str, ip: str, user_agent: str, referer: str):
        file_share = FileShare.objects.get(token=token)

        analytics = FileAnalytics.objects.create(
            file_share_id=file_share.id, ip=ip, user_agent=user_agent, referer=referer
        )

        return analytics

    @staticmethod
    def get_file_analytics(file_share_id_or_token: str):
        return FileAnalytics.objects.filter(
            Q(file_share__token=file_share_id_or_token) | Q(file_share__id=file_share_id_or_token)
        ).all()
