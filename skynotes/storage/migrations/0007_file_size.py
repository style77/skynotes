# Generated by Django 5.0 on 2024-01-27 00:39

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("storage", "0006_group_storage_group_icon_valid"),
    ]

    operations = [
        migrations.AddField(
            model_name="file",
            name="size",
            field=models.PositiveBigIntegerField(default=0),
            preserve_default=False,
        ),
    ]