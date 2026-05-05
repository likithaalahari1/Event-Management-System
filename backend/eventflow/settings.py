from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "eventflow-local-development-key"
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "eventflow.urls"

# MongoDB Connection via mongoengine
import mongoengine as me
me.connect(
    db="eventflow",
    host="mongodb+srv://likithaalahari03_db_user:likitha%40_@cluster0.bzw7hac.mongodb.net/?appName=Cluster0"
)

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
STATIC_URL = "static/"
WSGI_APPLICATION = "eventflow.wsgi.application"
