from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.core.files.base import ContentFile
from django.db import models
from storage.utils import generate_id

User = get_user_model()


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=generate_id)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"<{self.__class__.__name__} id={id}>"


class IconChoices(models.TextChoices):
    DEFAULT = "default", "default"
    MUSIC = "music", "music"
    VIDEO = "video", "video"
    PHOTO = "photo", "photo"
    DOCUMENT = "document", "document"
    ARCHIVE = "archive", "archive"


class Group(BaseModel):
    name = models.CharField(max_length=128)
    icon = models.CharField(choices=IconChoices.choices, default="default")
    description = models.CharField(max_length=512, blank=True, null=True)

    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_icon_valid",
                check=models.Q(icon__in=IconChoices.values),
            )
        ]

    def __str__(self):
        return self.name


class File(BaseModel):
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, blank=True, null=True)
    name = models.CharField(max_length=512)
    description = models.CharField(max_length=1024, blank=True, null=True)
    thumbnail = models.ImageField(blank=True, null=True)  # todo
    tags = ArrayField(
        models.CharField(max_length=16, null=True, blank=True),
        size=6,
        blank=True,
        null=True,
    )

    file = models.FileField()
    size = models.PositiveBigIntegerField()  # in bytes
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_size_valid",
                check=models.Q(size__gt=0),
            )
        ]

    def save_file(self, extension: str, content: ContentFile):
        self.file.save(f"{self.id}{extension}", content)

    def save_thumbnail(self, content: ContentFile):
        self.thumbnail.save(f"{self.id}_thumb.png", content)


class FileShare(BaseModel):
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    shared_until = models.DateTimeField(blank=True, null=True, default=None)
    password = models.CharField(max_length=128, blank=True, null=True)
    token = models.UUIDField(default=generate_id, unique=True, editable=False)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_shared_until_valid",
                check=models.Q(shared_until__gt=models.F("created_at")),
            )
        ]


class FileAnalytics(BaseModel):
    file_share = models.ForeignKey(FileShare, on_delete=models.CASCADE)
    ip = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=512, blank=True, null=True)
    referer = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_ip_valid",
                check=models.Q(ip__isnull=False),
            ),
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_user_agent_valid",
                check=models.Q(user_agent__isnull=False),
            ),
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_referer_valid",
                check=models.Q(referer__isnull=False),
            ),
        ]
