import uuid
from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    CATEGORY_CHOICES = [
        ('Robotics', 'Robotics'),
        ('Mechanical', 'Mechanical'),
        ('Electronics', 'Electronics'),
        ('Software', 'Software'),
        ('Civil', 'Civil'),
        ('Aerospace', 'Aerospace'),
        ('Chemical', 'Chemical'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Robotics')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Not Started')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title


class ProjectNote(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50, default='General')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.project.title} - {self.title}"


class Calculation(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='calculations', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calculations')
    title = models.CharField(max_length=255)
    formula = models.CharField(max_length=255)
    inputs = models.JSONField(default=list, blank=True)
    result = models.CharField(max_length=100)
    unit = models.CharField(max_length=50, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title}: {self.result} {self.unit}"


class ProjectFile(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='project_files/')
    file_type = models.CharField(max_length=100, blank=True, default='')
    file_size = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.project.title} - {self.name}"


class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=100, default='General')
    keywords = models.CharField(max_length=255, blank=True, default='')
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'id']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'

    def __str__(self):
        return self.question


class ErrorCode(models.Model):
    code = models.IntegerField(unique=True)
    title = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    description = models.TextField()
    cause = models.TextField()
    solution = models.TextField()
    is_site_specific = models.BooleanField(default=False)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.title}"


class SupportTicket(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]

    ticket_number = models.CharField(max_length=32, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='support_tickets')
    user_email = models.EmailField()
    subject = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, default='General')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = f"TICK-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_number}: {self.subject}"


class RequestLog(models.Model):
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=255)
    status_code = models.IntegerField()
    duration_ms = models.FloatField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.method} {self.path} ({self.status_code}) - {self.duration_ms:.1f}ms"
