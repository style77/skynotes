import uuid


def generate_id():
    return uuid.uuid4().replace("-", "")
