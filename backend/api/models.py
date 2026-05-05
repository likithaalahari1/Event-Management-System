import mongoengine as me
from datetime import datetime
from bson import ObjectId


class AppUser(me.Document):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("user", "User"),
    ]

    first_name = me.StringField(required=True, max_length=80)
    last_name = me.StringField(max_length=80, default="")
    email = me.EmailField(unique=True, required=True)
    password = me.StringField(required=True, max_length=128)
    role = me.StringField(choices=ROLE_CHOICES, default="admin")
    date_of_birth = me.DateTimeField()
    mobile_number = me.StringField(max_length=24, default="")
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "app_user",
        "ordering": ["-created_at"]
    }

    def __str__(self):
        return self.email


class Event(me.Document):
    name = me.StringField(required=True, max_length=160)
    date = me.DateTimeField(required=True)
    venue = me.StringField(required=True, max_length=180)
    category = me.StringField(max_length=80, default="Private Event")
    capacity = me.IntField(required=True)
    price = me.IntField(required=True)

    tiers = me.EmbeddedDocumentListField("TicketTier", default=[])

    checked_in = me.IntField(default=0)
    vip_guests = me.IntField(default=0)
    waitlist = me.IntField(default=0)
    rating = me.FloatField(default=0)
    accent = me.StringField(max_length=24, default="#b8894f")
    status = me.StringField(max_length=80, default="Draft live")
    image = me.StringField(
        default="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85"
    )
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "event",
        "ordering": ["-created_at"]
    }

    @property
    def tickets_sold(self):
        return sum(tier.sold for tier in self.tiers)

    def __str__(self):
        return self.name


class TicketTier(me.EmbeddedDocument):
    id = me.ObjectIdField(default=ObjectId)
    name = me.StringField(required=True, max_length=80)
    price = me.IntField(required=True)
    capacity = me.IntField(required=True)
    sold = me.IntField(default=0)

    def __str__(self):
        return f"{self.name}"


class Ticket(me.Document):
    ticket_id = me.StringField(unique=True, required=True, max_length=40)
    event = me.ReferenceField(Event, required=True)
    tier_name = me.StringField(required=True, max_length=80)
    attendee_name = me.StringField(required=True, max_length=120)
    quantity = me.IntField(default=1)
    amount = me.IntField(required=True)
    qr_code = me.StringField(required=True, max_length=40)
    checked_in = me.BooleanField(default=False)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "ticket",
        "ordering": ["-created_at"]
    }

    def __str__(self):
        return self.ticket_id
