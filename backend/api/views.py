import json
import random
from datetime import datetime, date
from bson import ObjectId

from django.contrib.auth.hashers import check_password, make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from mongoengine import NotUniqueError, DoesNotExist

from .models import AppUser, Event, Ticket, TicketTier


def cors_response(data, status=200):
    response = JsonResponse(data, status=status)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    return response


def parse_body(request):
    if not request.body:
        return {}
    return json.loads(request.body.decode("utf-8"))


def serialize_tier(tier):
    return {
        "id": str(tier.id),
        "name": tier.name,
        "price": tier.price,
        "capacity": tier.capacity,
        "sold": tier.sold,
    }


def serialize_event(event):
    tiers = event.tiers if event.tiers else []
    event_date = event.date.isoformat() if hasattr(event.date, "isoformat") else str(event.date)
    return {
        "id": str(event.id),
        "name": event.name,
        "date": event_date,
        "venue": event.venue,
        "category": event.category,
        "price": event.price,
        "capacity": event.capacity,
        "ticketsSold": sum(tier.sold for tier in tiers),
        "checkedIn": event.checked_in,
        "vipGuests": event.vip_guests,
        "waitlist": event.waitlist,
        "rating": float(event.rating),
        "accent": event.accent,
        "status": event.status,
        "image": event.image,
        "tiers": [serialize_tier(tier) for tier in tiers],
        "schedule": [
            {"time": "10:00", "title": "Guest entry", "location": event.venue},
            {"time": "12:00", "title": "Main session", "location": event.venue},
        ],
        "gates": [
            {"name": "Main Gate", "count": event.checked_in},
            {"name": "VIP Desk", "count": min(event.vip_guests, event.checked_in)},
        ],
    }


def serialize_ticket(ticket):
    return {
        "id": ticket.ticket_id,
        "userId": str(ticket.user.id) if ticket.user else "",
        "attendeeName": ticket.attendee_name,
        "eventName": ticket.event.name,
        "venue": ticket.event.venue,
        "date": ticket.event.date.isoformat(),
        "tierName": ticket.tier_name,
        "tickets": ticket.quantity,
        "amount": ticket.amount,
        "qrCode": ticket.qr_code,
    }


def event_code(event):
    words = [word for word in event.name.upper().replace("-", " ").split() if word]
    initials = "".join(word[0] for word in words[:3]) or "EVT"
    date_part = event.date.strftime("%d%m") if hasattr(event.date, "strftime") else "0000"
    return f"{initials[:4]}-{date_part}"


def unique_ticket_code(event, prefix):
    for _ in range(20):
        code = f"{prefix}-{random.randint(1000, 9999)}"
        if not Ticket.objects(ticket_id=code).first():
            return code
    return f"{prefix}-{random.randint(10000, 99999)}"


def unique_qr_code(event, prefix):
    for _ in range(20):
        code = f"QR-{prefix}-{random.randint(1000, 9999)}"
        if not Ticket.objects(qr_code=code).first():
            return code
    return f"QR-{prefix}-{random.randint(10000, 99999)}"


def serialize_user(user):
    date_of_birth = user.date_of_birth
    return {
        "id": str(user.id),
        "firstName": user.first_name,
        "lastName": user.last_name,
        "email": user.email,
        "role": user.role,
        "dateOfBirth": date_of_birth.isoformat() if hasattr(date_of_birth, "isoformat") else date_of_birth or "",
        "mobileNumber": user.mobile_number,
    }


def event_collection_payload(selected_event=None):
    event_items = list(Event.objects.all())
    payload = {
        "events": [serialize_event(item) for item in event_items],
        "recentBookings": recent_bookings(),
        "totals": event_totals(event_items),
    }
    if selected_event:
        payload["event"] = serialize_event(selected_event)
    return payload


def valid_ticket_levels(levels):
    return [
        level for level in levels
        if level.get("name") and int(level.get("price") or 0) > 0 and int(level.get("capacity") or 0) > 0
    ]


@csrf_exempt
def signup(request):
    if request.method == "OPTIONS":
        return cors_response({})
    if request.method != "POST":
        return cors_response({"error": "POST required"}, status=405)

    data = parse_body(request)
    first_name = (data.get("firstName") or "").strip()
    last_name = (data.get("lastName") or "").strip()
    email = (data.get("email") or "").strip().lower()
    role = data.get("role") if data.get("role") in ["admin", "user"] else "admin"
    password = data.get("password") or ""
    confirm_password = data.get("confirmPassword") or ""
    date_of_birth = data.get("dateOfBirth") or None
    mobile_number = (data.get("mobileNumber") or "").strip()

    if not first_name or not email or not password:
        return cors_response({"error": "First name, email, and password are required"}, status=400)
    if password != confirm_password:
        return cors_response({"error": "Passwords do not match"}, status=400)
    if len(password) < 6:
        return cors_response({"error": "Password must be at least 6 characters"}, status=400)
    
    try:
        AppUser.objects.get(email=email)
        return cors_response({"error": "An account with this email already exists"}, status=400)
    except DoesNotExist:
        pass
    
    if date_of_birth:
        try:
            date_of_birth = datetime.fromisoformat(date_of_birth)
        except (ValueError, TypeError):
            return cors_response({"error": "Enter a valid date of birth"}, status=400)

    try:
        user = AppUser.objects.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=make_password(password),
            role=role,
            date_of_birth=date_of_birth,
            mobile_number=mobile_number,
        )
    except NotUniqueError:
        return cors_response({"error": "An account with this email already exists"}, status=400)

    return cors_response({"user": serialize_user(user), "message": "Account created"}, status=201)


@csrf_exempt
def login(request):
    if request.method == "OPTIONS":
        return cors_response({})
    if request.method != "POST":
        return cors_response({"error": "POST required"}, status=405)

    data = parse_body(request)
    email = (data.get("email") or "").strip().lower()
    role = data.get("role") if data.get("role") in ["admin", "user"] else "admin"
    password = data.get("password") or ""

    if not email or not password:
        return cors_response({"error": "Email and password are required"}, status=400)

    try:
        user = AppUser.objects.get(email=email, role=role)
        if not check_password(password, user.password):
            return cors_response({"error": f"Invalid {role} email or password"}, status=401)
    except DoesNotExist:
        return cors_response({"error": f"Invalid {role} email or password"}, status=401)

    return cors_response({"user": serialize_user(user), "message": "Login successful"})


def recent_bookings():
    tickets = Ticket.objects.order_by("-created_at")[:8]
    return [
        {
            "name": ticket.attendee_name,
            "type": ticket.tier_name,
            "time": "saved booking",
            "amount": ticket.amount,
        }
        for ticket in tickets
    ]


def event_totals(event_items):
    serialized_events = [serialize_event(event) for event in event_items]
    sold = sum(event["ticketsSold"] for event in serialized_events)
    checked_in = sum(event["checkedIn"] for event in serialized_events)
    revenue = sum(ticket.amount for ticket in Ticket.objects.all())
    return {
        "sold": sold,
        "checkedIn": checked_in,
        "capacity": sum(event["capacity"] for event in serialized_events),
        "revenue": revenue,
        "waitlist": sum(event["waitlist"] for event in serialized_events),
        "entryRate": round((checked_in / sold) * 100) if sold else 0,
    }


def events(request):
    if request.method == "OPTIONS":
        return cors_response({})

    event_items = list(Event.objects.all())
    serialized_events = [serialize_event(event) for event in event_items]
    return cors_response({
        "events": serialized_events,
        "recentBookings": recent_bookings(),
        "totals": event_totals(event_items),
    })


def booked_tickets(request):
    if request.method == "OPTIONS":
        return cors_response({})
    if request.method != "GET":
        return cors_response({"error": "GET required"}, status=405)

    user_id = request.GET.get("userId", "").strip()
    if not user_id:
        return cors_response({"tickets": []})

    try:
        user = AppUser.objects.get(id=ObjectId(user_id))
    except (DoesNotExist, ValueError):
        return cors_response({"tickets": []})

    tickets = Ticket.objects(user=user).order_by("-created_at")
    return cors_response({"tickets": [serialize_ticket(ticket) for ticket in tickets]})


@csrf_exempt
def create_event(request):
    if request.method == "OPTIONS":
        return cors_response({})
    if request.method != "POST":
        return cors_response({"error": "POST required"}, status=405)

    data = parse_body(request)
    capacity = int(data.get("capacity", 0))
    price = int(data.get("price", 0))
    levels = data.get("levels") or []
    valid_levels = valid_ticket_levels(levels)

    if not data.get("name") or not data.get("date") or not data.get("venue") or not capacity or not price:
        return cors_response({"error": "Missing event details"}, status=400)
    if not valid_levels:
        return cors_response({"error": "Add at least one booking level"}, status=400)

    try:
        event_date = datetime.fromisoformat(data["date"]) if isinstance(data["date"], str) else data["date"]
    except (ValueError, TypeError):
        return cors_response({"error": "Invalid event date"}, status=400)

    event = Event.objects.create(
        name=data["name"],
        date=event_date,
        venue=data["venue"],
        capacity=capacity,
        price=price,
        image=data.get("image") or "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85",
    )
    
    # Create ticket tiers as embedded documents
    tiers = []
    for level in valid_levels:
        tier = TicketTier(
            name=level["name"],
            price=int(level["price"]),
            capacity=int(level["capacity"]),
        )
        tiers.append(tier)
    
    event.tiers = tiers
    event.save()

    return cors_response(event_collection_payload(event), status=201)


@csrf_exempt
def event_detail(request, event_id):
    if request.method == "OPTIONS":
        return cors_response({})

    try:
        event = Event.objects.get(id=ObjectId(event_id))
    except (DoesNotExist, ValueError):
        return cors_response({"error": "Event not found"}, status=404)

    if request.method == "DELETE":
        Ticket.objects.filter(event=event).delete()
        event.delete()
        return cors_response(event_collection_payload())

    if request.method != "PUT":
        return cors_response({"error": "PUT or DELETE required"}, status=405)

    data = parse_body(request)
    capacity = int(data.get("capacity", 0))
    price = int(data.get("price", 0))
    valid_levels = valid_ticket_levels(data.get("levels") or [])

    if not data.get("name") or not data.get("date") or not data.get("venue") or not capacity or not price:
        return cors_response({"error": "Missing event details"}, status=400)
    if not valid_levels:
        return cors_response({"error": "Add at least one booking level"}, status=400)

    try:
        event_date = datetime.fromisoformat(data["date"]) if isinstance(data["date"], str) else data["date"]
    except (ValueError, TypeError):
        return cors_response({"error": "Invalid event date"}, status=400)

    event.name = data["name"]
    event.date = event_date
    event.venue = data["venue"]
    event.capacity = capacity
    event.price = price
    event.image = data.get("image") or event.image

    # Update tiers
    tiers = []
    for level in valid_levels:
        tier = TicketTier(
            name=level["name"],
            price=int(level["price"]),
            capacity=max(int(level["capacity"]), 0),
        )
        tiers.append(tier)
    
    event.tiers = tiers
    event.save()

    return cors_response(event_collection_payload(event))


@csrf_exempt
def book_tickets(request, event_id):
    if request.method == "OPTIONS":
        return cors_response({})

    try:
        event = Event.objects.get(id=ObjectId(event_id))
    except (DoesNotExist, ValueError):
        return cors_response({"error": "Event not found"}, status=404)

    data = parse_body(request)
    tickets = max(1, int(data.get("tickets", 1)))
    tier_name = data.get("tierName")
    user = None
    user_id = (data.get("userId") or "").strip()
    if user_id:
        try:
            user = AppUser.objects.get(id=ObjectId(user_id))
        except (DoesNotExist, ValueError):
            user = None
    
    # Find the selected tier
    selected_tier = None
    if tier_name and event.tiers:
        for tier in event.tiers:
            if tier.name == tier_name:
                selected_tier = tier
                break
    
    if not selected_tier and event.tiers:
        selected_tier = event.tiers[0]
    
    if not selected_tier:
        return cors_response({"error": "No booking levels found for this event"}, status=400)

    available = max(selected_tier.capacity - selected_tier.sold, 0)
    booked = min(tickets, available)
    if booked == 0:
        return cors_response({"error": "Selected booking level is sold out"}, status=400)

    selected_tier.sold += booked
    event.save()

    code_prefix = event_code(event)
    ticket = Ticket.objects.create(
        ticket_id=unique_ticket_code(event, code_prefix),
        event=event,
        user=user,
        tier_name=selected_tier.name,
        attendee_name=data.get("name") or "Walk-in guest",
        quantity=booked,
        amount=booked * selected_tier.price,
        qr_code=unique_qr_code(event, code_prefix),
    )

    event_items = list(Event.objects.all())
    return cors_response({
        "event": serialize_event(event),
        "events": [serialize_event(item) for item in event_items],
        "recentBookings": recent_bookings(),
        "ticket": serialize_ticket(ticket),
        "totals": event_totals(event_items),
    })


@csrf_exempt
def check_in(request, event_id):
    if request.method == "OPTIONS":
        return cors_response({})

    try:
        event = Event.objects.get(id=ObjectId(event_id))
    except (DoesNotExist, ValueError):
        return cors_response({"error": "Event not found"}, status=404)

    if event.date.date() > date.today():
        return cors_response({"error": "QR scan opens only on the event date"}, status=400)

    data = parse_body(request)
    scan_code = (data.get("scanCode") or "").strip()
    
    ticket = None
    try:
        ticket = Ticket.objects.get(event=event, qr_code=scan_code)
    except DoesNotExist:
        try:
            ticket = Ticket.objects.get(event=event, ticket_id=scan_code)
        except DoesNotExist:
            return cors_response({"error": "Ticket QR code was not found for this event"}, status=404)

    if ticket.checked_in:
        return cors_response({"error": "This ticket is already checked in"}, status=400)

    ticket.checked_in = True
    ticket.save()
    event.checked_in = min(event.checked_in + ticket.quantity, sum(t.sold for t in event.tiers))
    event.save()

    event_items = list(Event.objects.all())
    return cors_response({
        "event": serialize_event(event),
        "events": [serialize_event(item) for item in event_items],
        "scanCode": "",
    })


def live_counts(request):
    event_items = list(Event.objects.all())
    return cors_response({
        "events": [serialize_event(event) for event in event_items],
        "totals": event_totals(event_items),
    })
