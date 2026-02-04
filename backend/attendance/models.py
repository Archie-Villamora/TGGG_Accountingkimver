from django.db import models
from django.utils import timezone
from accounts.models import CustomUser

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('on_leave', 'On Leave'),
        ('excused', 'Excused Absence'),
    ]
    
    employee = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='absent')
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee.email} - {self.date} ({self.status})"


class TimeLog(models.Model):
    LOG_TYPE_CHOICES = [
        ('time_in', 'Time In'),
        ('time_out', 'Time Out'),
        ('break_start', 'Break Start'),
        ('break_end', 'Break End'),
    ]
    
    employee = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='time_logs')
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name='logs', null=True, blank=True)
    log_type = models.CharField(max_length=20, choices=LOG_TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    device_info = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.employee.email} - {self.log_type} at {self.timestamp}"


class Leave(models.Model):
    LEAVE_TYPE_CHOICES = [
        ('sick', 'Sick Leave'),
        ('vacation', 'Vacation'),
        ('personal', 'Personal Leave'),
        ('emergency', 'Emergency Leave'),
        ('bereavement', 'Bereavement Leave'),
        ('maternity', 'Maternity Leave'),
        ('paternity', 'Paternity Leave'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    employee = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.employee.email} - {self.leave_type} ({self.start_date} to {self.end_date})"


class AttendancePolicy(models.Model):
    department = models.OneToOneField('accounts.Department', on_delete=models.CASCADE, related_name='attendance_policy')
    work_hours_per_day = models.IntegerField(default=8)  # in hours
    late_threshold_minutes = models.IntegerField(default=15)  # minutes allowed before marking late
    early_out_threshold_minutes = models.IntegerField(default=15)  # minutes early allowed
    break_duration_minutes = models.IntegerField(default=60)  # lunch break duration
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Attendance Policies'

    def __str__(self):
        return f"Policy for {self.department.name}"
