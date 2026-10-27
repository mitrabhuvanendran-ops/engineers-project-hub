import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'engineers_hub.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# When running in serverless environment (Vercel), ensure /tmp database is migrated and seeded
try:
    from django.core.management import call_command
    from hub.assistant import seed_faqs_and_errors
    call_command('migrate', interactive=False)
    seed_faqs_and_errors()
except Exception as e:
    print(f"Serverless startup migration: {e}")

app = application
