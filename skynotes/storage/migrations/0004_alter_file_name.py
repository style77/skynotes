# Generated by Django 5.0 on 2024-01-10 21:01

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("storage", "0003_alter_file_group"),
    ]

    operations = [
        migrations.AlterField(
            model_name="file",
            name="name",
            field=models.CharField(max_length=512),
        ),
    ]
