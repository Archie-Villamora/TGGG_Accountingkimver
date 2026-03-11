"""
Email Utility for Payslip Delivery
Sends payslip images via email using Django's EmailMessage
"""
from datetime import datetime
from django.core.mail import EmailMessage
from django.conf import settings


def send_payslip_email(employee, payslip_data, image_buffer, image_filename):
    """
    Send payslip image via email.
    
    Args:
        employee: CustomUser object with email field
        payslip_data: Dictionary containing payslip information
        image_buffer: BytesIO object containing the PNG image
        image_filename: Name for the image attachment
    
    Returns:
        dict: {
            'sent': bool,
            'recipient': str,
            'message': str
        }
    """
    try:
        # Check if email sending is configured
        if not hasattr(settings, 'EMAIL_HOST') or not settings.EMAIL_HOST:
            return {
                'sent': False,
                'recipient': None,
                'message': 'Email not configured in settings'
            }
        
        # Check if employee has email
        if not employee.email:
            return {
                'sent': False,
                'recipient': None,
                'message': f'Employee {employee.get_full_name()} has no email address'
            }
        
        recipient_email = employee.email
        employee_name = employee.get_full_name()
        
        # Email subject
        period = f"{payslip_data.get('period_start', '')} to {payslip_data.get('period_end', '')}"
        subject = f"Your Payslip - {employee_name}"
        
        # Email body (HTML)
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f9fafb;
                    padding: 30px 20px;
                    border-radius: 0 0 10px 10px;
                }}
                .info-box {{
                    background: white;
                    padding: 20px;
                    margin: 20px 0;
                    border-left: 4px solid #1e40af;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .salary-amount {{
                    font-size: 32px;
                    font-weight: bold;
                    color: #16a34a;
                    margin: 15px 0;
                }}
                .detail-row {{
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #e5e7eb;
                }}
                .label {{
                    color: #64748b;
                    font-weight: 600;
                }}
                .value {{
                    color: #1e293b;
                    font-weight: 500;
                }}
                .footer {{
                    text-align: center;
                    padding: 20px;
                    color: #64748b;
                    font-size: 12px;
                }}
                .attachment-note {{
                    background: #dbeafe;
                    border: 2px dashed #1e40af;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: center;
                    border-radius: 8px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">TGGG ACCOUNTING</h1>
                    <p style="margin: 10px 0 0 0;">Payslip Notification</p>
                </div>
                <div class="content">
                    <h2>Hello {employee_name},</h2>
                    <p>Your payslip for the period <strong>{period}</strong> is ready.</p>
                    
                    <div class="attachment-note">
                        <p style="margin: 0;"><strong>📎 Your payslip image is attached to this email</strong></p>
                        <p style="margin: 5px 0 0 0; font-size: 14px;">Please download and save it for your records</p>
                    </div>
                    
                    <p>If you have any questions about your payslip, please contact the Accounting Department.</p>
                    
                    <p><strong>Important:</strong> This payslip is confidential and for your personal use only. Do not share your salary information with unauthorized persons.</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                    <p>© {datetime.now().year} TGGG Accounting. All rights reserved.</p>
                    <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version (fallback)
        text_body = f"""
Hello {employee_name},

Your payslip for the period {period} is ready.

Your payslip image is attached to this email. Please download and save it for your records.

If you have any questions about your payslip, please contact the Accounting Department.

IMPORTANT: This payslip is confidential and for your personal use only.

---
This is an automated email. Please do not reply.
© {datetime.now().year} TGGG Accounting. All rights reserved.
Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        """
        
        # Create email message
        email = EmailMessage(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else settings.EMAIL_HOST_USER,
            to=[recipient_email],
        )
        
        # Set HTML alternative
        email.content_subtype = "html"
        email.body = html_body
        
        # Attach payslip image
        image_buffer.seek(0)  # Reset buffer position
        email.attach(image_filename, image_buffer.read(), 'image/png')
        
        # Send email
        email.send(fail_silently=False)
        
        return {
            'sent': True,
            'recipient': recipient_email,
            'message': f'Payslip sent successfully to {recipient_email}'
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Email sending error: {error_msg}")
        return {
            'sent': False,
            'recipient': recipient_email if 'recipient_email' in locals() else None,
            'message': f'Failed to send email: {error_msg}'
        }


def save_payslip_image_and_send_email(employee, payslip, payslip_data, image_buffer, period_str):
    """
    Save payslip image to the database and send via email.
    
    Args:
        employee: CustomUser object
        payslip: PaySlip model instance
        payslip_data: Dictionary containing payslip information
        image_buffer: BytesIO object containing the PNG image
        period_str: Period string for filename (e.g., '2024-01')
    
    Returns:
        dict: {
            'image_saved': bool,
            'image_endpoint': str or None,
            'email': dict from send_payslip_email
        }
    """
    result = {
        'image_saved': False,
        'image_endpoint': None,
        'storage': 'database',
        'email': None
    }
    
    try:
        # Generate filename for DB metadata and email attachment name.
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        image_filename = f"payslip_{period_str}_{timestamp}.png"

        # Persist image bytes in the payslip database record.
        image_buffer.seek(0)
        image_bytes = image_buffer.read()
        payslip.payslip_image = image_bytes
        payslip.payslip_image_filename = image_filename
        payslip.payslip_image_content_type = 'image/png'
        payslip.save(update_fields=['payslip_image', 'payslip_image_filename', 'payslip_image_content_type'])

        result['image_saved'] = True
        result['image_endpoint'] = f"/api/payroll/recent/{payslip.id}/payslip-image/"

        print(f"✅ Payslip image saved to DB for payslip ID {payslip.id}")
        
        # Send email with the image
        image_buffer.seek(0)  # Reset buffer for email attachment
        email_result = send_payslip_email(employee, payslip_data, image_buffer, image_filename)
        result['email'] = email_result
        
        if email_result['sent']:
            print(f"✅ Email sent successfully to {email_result['recipient']}")
        else:
            print(f"⚠️ Email failed: {email_result['message']}")
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error in save_payslip_image_and_send_email: {error_msg}")
        result['email'] = {
            'sent': False,
            'recipient': None,
            'message': f'Error: {error_msg}'
        }
    
    return result
