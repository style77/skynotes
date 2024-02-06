import base64
import mimetypes
from common.service import Service
from storage.tasks import UploadHandler, ThumbnailHandler


class FileService(Service):
    handlers = [UploadHandler, ThumbnailHandler]
    handler = handlers[0]()
    for next_handler in handlers[1:]:
        handler.set_next(next_handler())

    @staticmethod
    def get_file_extension(mimetype: str):
        return mimetypes.guess_extension(mimetype)

    @staticmethod
    def upload_file(file_id: str, file: bytes, mimetype: str):
        file_bytes = base64.b64encode(file)
        extension = FileService.get_file_extension(mimetype)

        FileService.handler.handle((file_id, extension, file_bytes))
