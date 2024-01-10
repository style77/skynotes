import grpc
from thumbnailer import thumbnailer_pb2, thumbnailer_pb2_grpc


class Certs:
    root = None
    cert = None
    key = None

    def __init__(self, root, cert, key):
        self.root = open(root, "rb").read()
        self.cert = open(cert, "rb").read()
        self.key = open(key, "rb").read()


class Client:
    thumbnailer = None

    def __init__(self, addr: str):  # crt: Certs
        # creds = grpc.ssl_channel_credentials(crt.root, crt.key, crt.cert)
        channel = grpc.insecure_channel(addr)  # , creds
        self.thumbnailer = thumbnailer_pb2_grpc.ThumbnailServiceStub(channel)

    def generate_thumbnail(self, content: bytes) -> bytes:
        return self.thumbnailer.GenerateThumbnail(
            thumbnailer_pb2.ThumbnailRequest(content=content)
        ).thumbnail
