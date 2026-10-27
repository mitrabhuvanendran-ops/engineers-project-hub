import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'engineers_hub.settings')

application = get_wsgi_application()

# Ensure migrations and initial seeding are performed automatically
try:
    from django.core.management import call_command
    from hub.assistant import seed_faqs_and_errors
    call_command('migrate', interactive=False)
    seed_faqs_and_errors()
except Exception as e:
    print(f"WSGI startup auto-migration: {e}")

app = application
