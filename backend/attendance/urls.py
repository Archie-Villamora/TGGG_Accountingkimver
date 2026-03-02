from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('', views.attendance_overview, name='overview'),
    path('my/', views.my_attendance_records, name='my_attendance_records'),
    path('all/', views.all_attendance_records, name='all_attendance_records'),
    path('leave/', views.create_leave_request, name='create_leave_request'),
    path('leave/my/', views.my_leave_requests, name='my_leave_requests'),
    path('events/', views.calendar_events, name='calendar_events'),
    path('overtime/', views.all_overtime_requests, name='all_overtime_requests'),
]
