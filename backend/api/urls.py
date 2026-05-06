from django.urls import path

from . import views

urlpatterns = [
    path("auth/signup/", views.signup),
    path("auth/login/", views.login),
    path("events/", views.events),
    path("tickets/booked/", views.booked_tickets),
    path("events/create/", views.create_event),
    path("events/<str:event_id>/", views.event_detail),
    path("events/<str:event_id>/book/", views.book_tickets),
    path("events/<str:event_id>/checkin/", views.check_in),
    path("live-counts/", views.live_counts),
]
