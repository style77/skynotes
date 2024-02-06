import base64
import mimetypes
import magic
from common.service import Service
from storage.tasks import UploadHandler, ThumbnailHandler


class FileService(Service):
    handlers = [UploadHandler, ThumbnailHandler]
    handler = handlers[0]()
    for next_handler in handlers[1:]:
        handler.set_next(next_handler())

    @staticmethod
    def get_file_extension(buffer: bytes):
        mimetype = magic.from_buffer(buffer, mime=True)
        return mimetypes.guess_extension(mimetype)

    @staticmethod
    def upload_file(file_id: str, file: bytes):
        file_bytes = base64.b64encode(file)
        extension = FileService.get_file_extension(file_bytes)

        FileService.handler.handle((file_id, extension, file_bytes))
