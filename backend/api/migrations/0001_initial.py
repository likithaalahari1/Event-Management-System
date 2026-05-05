from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Event",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("date", models.DateField()),
                ("venue", models.CharField(max_length=180)),
                ("category", models.CharField(default="Private Event", max_length=80)),
                ("capacity", models.PositiveIntegerField()),
                ("price", models.PositiveIntegerField()),
                ("checked_in", models.PositiveIntegerField(default=0)),
                ("vip_guests", models.PositiveIntegerField(default=0)),
                ("waitlist", models.PositiveIntegerField(default=0)),
                ("rating", models.DecimalField(decimal_places=1, default=0, max_digits=3)),
                ("accent", models.CharField(default="#b8894f", max_length=24)),
                ("status", models.CharField(default="Draft live", max_length=80)),
                ("image", models.URLField(default="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="TicketTier",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=80)),
                ("price", models.PositiveIntegerField()),
                ("capacity", models.PositiveIntegerField()),
                ("sold", models.PositiveIntegerField(default=0)),
                ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tiers", to="api.event")),
            ],
        ),
        migrations.CreateModel(
            name="Ticket",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("ticket_id", models.CharField(max_length=40, unique=True)),
                ("attendee_name", models.CharField(max_length=120)),
                ("quantity", models.PositiveIntegerField(default=1)),
                ("amount", models.PositiveIntegerField()),
                ("qr_code", models.CharField(max_length=40)),
                ("checked_in", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tickets", to="api.event")),
                ("tier", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="tickets", to="api.tickettier")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
