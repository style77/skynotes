from collections import OrderedDict
from django.contrib.postgres.fields import ArrayField
from django.db import models
from storage.utils import generate_id

from django.contrib.auth import get_user_model


User = get_user_model()


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=generate_id)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"<{self.__class__.__name__} id={id}>"


class StatusField(models.IntegerField):
    statuses = OrderedDict({
        0: "REQUESTED",
        1: "PROCESSING",
        2: "COMPLETED"
    })

    def representation(self):
        # Custom logic to represent the integer field
        return self.statuses.get(self.value_from_object(self.model))


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

    owner = models.ForeignKey(User, on_delete=models.CASCADE)

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
        models.CharField(max_length=16, null=True, blank=True),
        size=6,
        blank=True,
        null=True,
    )

    status = StatusField(default=0)

    file = models.FileField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ["-created_at"]
