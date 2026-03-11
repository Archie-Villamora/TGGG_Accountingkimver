from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payroll', '0002_employeecontribution'),
    ]

    operations = [
        migrations.AddField(
            model_name='payslip',
            name='payslip_image',
            field=models.BinaryField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='payslip',
            name='payslip_image_content_type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='payslip',
            name='payslip_image_filename',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
