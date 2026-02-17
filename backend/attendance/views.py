from datetime import date

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Leave

# Create your views here.

@api_view(['GET'])
def attendance_overview(request):
    """Overview of attendance module"""
    return Response({
        'message': 'Attendance module',
        'features': ['Time Tracking', 'Clock In/Out', 'Leave Management', 'Attendance Reports']
    })


def _serialize_leave(leave):
    return {
        'id': leave.id,
        'employee_id': leave.employee_id,
        'employee_name': f"{leave.employee.first_name} {leave.employee.last_name}".strip() or leave.employee.email,
        'leave_type': leave.leave_type,
        'leave_type_label': leave.get_leave_type_display(),
        'start_date': leave.start_date,
        'end_date': leave.end_date,
        'reason': leave.reason,
        'status': leave.status,
        'status_label': leave.get_status_display(),
        'approved_by_id': leave.approved_by_id,
        'approved_by_name': (
            f"{leave.approved_by.first_name} {leave.approved_by.last_name}".strip()
            if leave.approved_by else None
        ),
        'approved_at': leave.approved_at,
        'rejection_reason': leave.rejection_reason,
        'created_at': leave.created_at,
        'updated_at': leave.updated_at,
    }


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_leave_request(request):
    leave_type = request.data.get('leave_type')
    start_date_raw = request.data.get('start_date')
    end_date_raw = request.data.get('end_date')
    reason = (request.data.get('reason') or '').strip()

    allowed_types = {key for key, _ in Leave.LEAVE_TYPE_CHOICES}
    if leave_type not in allowed_types:
        return Response({'error': 'Invalid leave type.'}, status=status.HTTP_400_BAD_REQUEST)

    if not start_date_raw or not end_date_raw:
        return Response({'error': 'Start date and end date are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        start_date = date.fromisoformat(str(start_date_raw))
        end_date = date.fromisoformat(str(end_date_raw))
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

    if end_date < start_date:
        return Response({'error': 'End date cannot be earlier than start date.'}, status=status.HTTP_400_BAD_REQUEST)

    if not reason:
        return Response({'error': 'Reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

    leave = Leave.objects.create(
        employee=request.user,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
        status='pending',
    )

    return Response({
        'success': True,
        'leave': _serialize_leave(leave),
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_leave_requests(request):
    leaves = Leave.objects.filter(employee=request.user).select_related('approved_by').order_by('-created_at')
    return Response([_serialize_leave(leave) for leave in leaves])
