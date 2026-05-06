from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({
        "status": "healthy"
    })


urlpatterns = [
    path("", health_check),
    path("api/", include("api.urls")),
]