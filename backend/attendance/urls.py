from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('', views.attendance_overview, name='overview'),
    path('leave/', views.create_leave_request, name='create_leave_request'),
    path('leave/my/', views.my_leave_requests, name='my_leave_requests'),
]
