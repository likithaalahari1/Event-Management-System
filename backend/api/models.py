from django.db import models


class AppUser(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("user", "User"),
    ]

    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80, blank=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default="admin")
    date_of_birth = models.DateField(null=True, blank=True)
    mobile_number = models.CharField(max_length=24, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.email


class Event(models.Model):
    name = models.CharField(max_length=160)
    date = models.DateField()
    venue = models.CharField(max_length=180)
    category = models.CharField(max_length=80, default="Private Event")
    capacity = models.PositiveIntegerField()
    price = models.PositiveIntegerField()
    checked_in = models.PositiveIntegerField(default=0)
    vip_guests = models.PositiveIntegerField(default=0)
    waitlist = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    accent = models.CharField(max_length=24, default="#b8894f")
    status = models.CharField(max_length=80, default="Draft live")
    image = models.TextField(
        default="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def tickets_sold(self):
        return sum(tier.sold for tier in self.tiers.all())

    def __str__(self):
        return self.name


class TicketTier(models.Model):
    event = models.ForeignKey(Event, related_name="tiers", on_delete=models.CASCADE)
    name = models.CharField(max_length=80)
    price = models.PositiveIntegerField()
    capacity = models.PositiveIntegerField()
    sold = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.event.name} - {self.name}"


class Ticket(models.Model):
    ticket_id = models.CharField(max_length=40, unique=True)
    event = models.ForeignKey(Event, related_name="tickets", on_delete=models.CASCADE)
    tier = models.ForeignKey(TicketTier, related_name="tickets", on_delete=models.PROTECT)
    attendee_name = models.CharField(max_length=120)
    quantity = models.PositiveIntegerField(default=1)
    amount = models.PositiveIntegerField()
    qr_code = models.CharField(max_length=40)
    checked_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.ticket_id
