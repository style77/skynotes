from django.contrib.postgres.fields import ArrayField
from django.db import models
from notes.utils import generate_id


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=generate_id)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"<{self.__class__.__name__} id={id}>"


class Group(BaseModel):
    ICON_CHOICES = (
        ("default", "default"),
        ("music", "music"),
        ("video", "video"),
        ("photo", "photo"),
        ("document", "document"),
        ("archive", "archive"),
    )

    name = models.CharField(max_length=128)
    icon = models.CharField(choices=ICON_CHOICES, default="default")
    description = models.CharField(max_length=512)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class File(BaseModel):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(max_length=256)
    description = models.CharField(max_length=1024, blank=True, null=True)
    # thumbnail = models.ImageField()  # todo
    tags = ArrayField(
        models.CharField(max_length=16), size=6, blank=True, null=True  # Max tags count
    )

    class Meta:
        ordering = ["created_at"]
