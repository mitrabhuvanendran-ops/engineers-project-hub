from django.urls import path
from . import views

urlpatterns = [
    # Initial Entry & Authentication
    path('', views.initial_entry, name='initial_entry'),
    path('login/', views.login_view, name='login'),
    path('demo-login/', views.demo_login_view, name='demo_login'),
    path('logout/', views.logout_view, name='logout'),

    # Dashboard & Projects Workspace
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('projects/', views.projects_list_view, name='projects_list'),
    path('projects/create/', views.project_create_view, name='project_create'),
    path('projects/<int:project_id>/', views.project_detail_view, name='project_detail'),
    path('projects/<int:project_id>/update/', views.project_update_view, name='project_update'),
    path('projects/<int:project_id>/delete/', views.project_delete_view, name='project_delete'),

    # Workspace Items (Notes, Files, Calculations)
    path('projects/<int:project_id>/notes/create/', views.note_create_view, name='note_create'),
    path('notes/<int:note_id>/delete/', views.note_delete_view, name='note_delete'),
    path('projects/<int:project_id>/files/upload/', views.file_upload_view, name='file_upload'),
    path('files/<int:file_id>/delete/', views.file_delete_view, name='file_delete'),
    path('calculations/create/', views.calc_create_view, name='calc_create'),
    path('calculations/<int:calc_id>/delete/', views.calc_delete_view, name='calc_delete'),
    path('calculator/', views.calculator_view, name='calculator'),

    # Assessment Required Pages
    path('faqs/', views.faqs_view, name='faqs'),
    path('error-codes/', views.error_codes_view, name='error_codes'),
    path('tickets/', views.tickets_view, name='tickets'),
    path('health/', views.health_view, name='health'),

    # AI Chat & Feedback APIs
    path('api/assistant/', views.assistant_api, name='assistant_api'),
    path('api/feedback/', views.feedback_api, name='feedback_api'),
]
