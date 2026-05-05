from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_appuser"),
    ]

    operations = [
        migrations.AddField(
            model_name="appuser",
            name="role",
            field=models.CharField(
                choices=[("admin", "Admin"), ("user", "User")],
                default="admin",
                max_length=16,
            ),
        ),
    ]
