from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import UserSettings

# Serializer for the specific Theme endpoint
class UserThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['theme']

# Serializer for the full Preferences form
class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        # These fields must match the names in your models.py exactly
        fields = ['theme', 'language', 'timezone', 'date_format', 'time_format', 'session_duration','email_appointment_updates', 'email_new_messages', 'email_appointment_reminders']


class UserPrivacySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['profile_visibility', 'show_online_status']

# --- NEW: Serializer for Changing Password ---
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        # 1. Check if new password matches confirm password
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        
        # 2. Check if old password is correct
        user = self.context['request'].user
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({"old_password": "Old password is not correct."})
            
        return data
    
# --- NEW: 2FA Verify Serializer ---
class TwoFactorVerifySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, min_length=6, required=True)

class BillingInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['card_brand', 'card_last4', 'card_exp_month', 'card_exp_year']