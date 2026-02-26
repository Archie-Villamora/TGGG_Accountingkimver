from django.contrib import admin
from .models import OvertimeRequest


@admin.register(OvertimeRequest)
class OvertimeRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'date_completed', 'anticipated_hours', 'approval_date')
    list_filter = ('date_completed', 'approval_date')
    search_fields = ('employee__email', 'employee_name', 'department', 'job_position')
