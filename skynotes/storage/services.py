import base64
import mimetypes

from common.service import Service
from common.bus import bus


class FileService(Service):
    @staticmethod
    def get_file_extension(mimetype: str):
        return mimetypes.guess_extension(mimetype)

    @staticmethod
    def upload_file(file_id: str, file: bytes, mimetype: str):
        file_bytes = base64.b64encode(file)
        extension = FileService.get_file_extension(mimetype)

        bus.emit("file_created", file_id, extension, file_bytes)
