"""Supabase Storage Service for Work Documentation Files."""

import os
import json
from datetime import datetime
from django.conf import settings
from supabase import create_client, Client


class SupabaseStorageManager:
    """Manages file uploads and retrieval from Supabase storage."""
    
    _client: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client (singleton)."""
        if cls._client is None:
            url = settings.SUPABASE_URL
            key = settings.SUPABASE_KEY
            cls._client = create_client(url, key)
        return cls._client
    
    @classmethod
    def validate_file(cls, file_obj, max_size_mb: int = 25) -> tuple[bool, str]:
        """
        Validate file before upload.
        
        Args:
            file_obj: Django UploadedFile object
            max_size_mb: Maximum file size in MB
            
        Returns:
            (is_valid, error_message)
        """
        # Check file size
        max_size_bytes = max_size_mb * 1024 * 1024
        if file_obj.size > max_size_bytes:
            return False, f"File size exceeds {max_size_mb}MB limit"
        
        # Check file type
        allowed_extensions = {
            # Images
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',
            # Documents
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            # Text
            'txt', 'csv'
        }
        
        # Get file extension
        name_parts = file_obj.name.rsplit('.', 1)
        if len(name_parts) < 2:
            return False, "File must have an extension"
        
        extension = name_parts[1].lower()
        
        if extension not in allowed_extensions:
            return False, f"File type '{extension}' not allowed. Allowed: {', '.join(sorted(allowed_extensions))}"
        
        return True, ""
    
    @classmethod
    def upload_work_documentation(
        cls,
        file_obj,
        user_id: int,
        date_str: str,  # YYYY-MM-DD format
        employee_id: int,
        bucket_name: str = "work_attachments"
    ) -> dict:
        """
        Upload a work documentation file to Supabase.
        
        Args:
            file_obj: Django UploadedFile object
            user_id: ID of the logged-in user uploading
            date_str: Date in YYYY-MM-DD format
            employee_id: ID of the employee this documentation is for
            bucket_name: Name of the Supabase bucket
            
        Returns:
            {
                'success': bool,
                'file_path': str (if success),
                'file_url': str (if success),
                'error': str (if not success)
            }
        """
        # Validate authorization - user can only upload for themselves or if admin
        user = None
        try:
            from accounts.models import CustomUser
            user = CustomUser.objects.get(id=user_id)
            is_admin = user.is_staff or user.is_superuser
            is_owner = employee_id == user_id
            
            if not (is_admin or is_owner):
                return {
                    'success': False,
                    'error': 'You can only upload documentation for yourself'
                }
        except Exception as e:
            return {
                'success': False,
                'error': f'User validation failed: {str(e)}'
            }
        
        # Validate file
        is_valid, error_msg = cls.validate_file(file_obj)
        if not is_valid:
            return {'success': False, 'error': error_msg}
        
        try:
            client = cls.get_client()
            
            # Construct file path: /work-docs/{user_id}/{date}/{filename}
            file_path = f"work-docs/{employee_id}/{date_str}/{file_obj.name}"
            
            # Read file content
            file_content = file_obj.read()
            
            # Upload to Supabase
            response = client.storage.from_(bucket_name).upload(
                path=file_path,
                file=(file_obj.name, file_content, file_obj.content_type),
                file_options={"cacheControl": "3600", "upsert": False}
            )
            
            # Generate public URL
            file_url = client.storage.from_(bucket_name).get_public_url(file_path)
            
            return {
                'success': True,
                'file_path': file_path,
                'file_url': file_url,
                'filename': file_obj.name,
                'uploaded_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Upload failed: {str(e)}'
            }
    
    @classmethod
    def delete_work_documentation(
        cls,
        file_path: str,
        user_id: int,
        employee_id: int,
        bucket_name: str = "work_attachments"
    ) -> dict:
        """
        Delete a work documentation file from Supabase.
        
        Args:
            file_path: Path of the file to delete
            user_id: ID of the logged-in user requesting deletion
            employee_id: ID of the employee who owns the document
            bucket_name: Name of the Supabase bucket
            
        Returns:
            {'success': bool, 'error': str (if not success)}
        """
        try:
            from accounts.models import CustomUser
            user = CustomUser.objects.get(id=user_id)
            is_admin = user.is_staff or user.is_superuser
            is_owner = employee_id == user_id
            
            if not (is_admin or is_owner):
                return {
                    'success': False,
                    'error': 'You do not have permission to delete this file'
                }
        except Exception as e:
            return {
                'success': False,
                'error': f'User validation failed: {str(e)}'
            }
        
        try:
            client = cls.get_client()
            client.storage.from_(bucket_name).remove([file_path])
            return {'success': True}
        except Exception as e:
            return {
                'success': False,
                'error': f'Deletion failed: {str(e)}'
            }
    
    @classmethod
    def get_public_url(
        cls,
        file_path: str,
        bucket_name: str = "work_attachments"
    ) -> str:
        """Get public URL for a file."""
        try:
            client = cls.get_client()
            return client.storage.from_(bucket_name).get_public_url(file_path)
        except Exception:
            return None
