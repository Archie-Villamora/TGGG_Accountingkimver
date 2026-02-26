from django.urls import path
from . import views

app_name = 'payroll'

urlpatterns = [
    path('', views.payroll_overview, name='overview'),
    path('employees/', views.payroll_employees, name='payroll_employees'),
    path('attendance-summary/', views.attendance_summary, name='attendance_summary'),
    path('process/', views.process_payroll, name='process_payroll'),
    path('deductions/', views.deduction_types, name='deduction_types'),
    path('deductions/<int:deduction_id>/', views.deduction_type_detail, name='deduction_type_detail'),
    path('recent/', views.recent_payroll_records, name='recent_payroll_records'),
]
