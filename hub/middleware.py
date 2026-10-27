import time
from .models import RequestLog

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration_ms = (time.time() - start_time) * 1000

        # Don't clutter logs with static files or favicon
        path = request.path
        if not path.startswith('/static/') and not path.startswith('/media/') and not path == '/favicon.ico':
            try:
                # Get client IP
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip = x_forwarded_for.split(',')[0].strip()
                else:
                    ip = request.META.get('REMOTE_ADDR')

                RequestLog.objects.create(
                    method=request.method,
                    path=path[:250],
                    status_code=response.status_code,
                    duration_ms=round(duration_ms, 2),
                    ip_address=ip if ip and len(ip) <= 45 else None
                )
            except Exception as e:
                # Never let logging break request processing
                pass

        return response

