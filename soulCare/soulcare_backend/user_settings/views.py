from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.conf import settings as django_settings 
from .models import UserSettings
from .serializers import UserThemeSerializer, UserPreferencesSerializer, UserPrivacySerializer, ChangePasswordSerializer, TwoFactorVerifySerializer, BillingInfoSerializer

import pyotp
import qrcode
import io
import base64
import stripe

stripe.api_key = django_settings.STRIPE_SECRET_KEY


# --- NEW: View for Changing Password ---
class ChangePasswordView(APIView):
    """
    An endpoint for changing password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            # Set the new password
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {"detail": "Password updated successfully."}, 
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TwoFactorStatusView(APIView):
    """ Checks if 2FA is enabled """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        return Response({"enabled": settings.two_factor_enabled})

class TwoFactorSetupView(APIView):
    """ Generates a secret and returns a QR code """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        
        # Generate a random secret key
        secret = pyotp.random_base32()
        settings.two_factor_secret = secret
        settings.save()

        # Generate the Provisioning URI (for the Authenticator App)
        otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=request.user.email, 
            issuer_name="SoulCare"
        )

        # Generate QR Code Image
        qr = qrcode.make(otp_uri)
        img_buffer = io.BytesIO()
        qr.save(img_buffer, format="PNG")
        img_str = base64.b64encode(img_buffer.getvalue()).decode('utf-8')

        return Response({
            "secret": secret,
            "qr_code": f"data:image/png;base64,{img_str}"
        })

class TwoFactorVerifyView(APIView):
    """ Verifies the code and enables 2FA """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TwoFactorVerifySerializer(data=request.data)
        if serializer.is_valid():
            settings = get_object_or_404(UserSettings, user=request.user)
            code = serializer.validated_data['code']
            
            # Verify the code against the saved secret
            totp = pyotp.TOTP(settings.two_factor_secret)
            if totp.verify(code):
                settings.two_factor_enabled = True
                settings.save()
                return Response({"detail": "2FA Enabled Successfully", "enabled": True})
            else:
                return Response({"code": ["Invalid authentication code"]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TwoFactorDisableView(APIView):
    """ Disables 2FA """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        settings = get_object_or_404(UserSettings, user=request.user)
        settings.two_factor_enabled = False
        settings.two_factor_secret = None  # Clear the secret for security
        settings.save()
        return Response({"detail": "2FA Disabled", "enabled": False})

# --- NEW: Stripe Views ---

class StripeSetupIntentView(APIView):
    """ 
    Creates a Stripe SetupIntent for adding a new payment method.
    If the user doesn't have a stripe_customer_id, we create one first.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            settings, _ = UserSettings.objects.get_or_create(user=user)

            # 1. Ensure Stripe Customer Exists
            if not settings.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user.username,
                )
                settings.stripe_customer_id = customer.id
                settings.save()
            
            customer_id = settings.stripe_customer_id

            # 2. Create SetupIntent
            intent = stripe.SetupIntent.create(
                customer=customer_id,
                payment_method_types=['card'],
            )

            return Response({
                'client_secret': intent.client_secret
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Save the payment method details to DB
class StripeSaveMethodView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        payment_method_id = request.data.get('payment_method_id')
        if not payment_method_id:
            return Response({'error': 'Payment method ID required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve details from Stripe
            payment_method = stripe.PaymentMethod.retrieve(payment_method_id)
            card_info = payment_method.card

            # Save to DB
            settings, _ = UserSettings.objects.get_or_create(user=request.user)
            settings.card_brand = card_info.brand
            settings.card_last4 = card_info.last4
            settings.save()

            return Response({'status': 'updated', 'brand': card_info.brand, 'last4': card_info.last4})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Get Billing Info
class BillingInfoView(generics.RetrieveAPIView):
    serializer_class = BillingInfoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        settings, _ = UserSettings.objects.get_or_create(user=self.request.user)
        return settings

class UserThemeView(generics.RetrieveUpdateAPIView):
    """ Handles ONLY the theme switching """
    serializer_class = UserThemeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        return settings

class UserPreferencesView(generics.RetrieveUpdateAPIView):
    """ Handles the main 'Preferences' tab (Language, Timezone, etc.) """
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        return settings
    
# In user_settings/views.py

# Make sure to import your serializer (you'll need to create this if it doesn't exist)
# from .serializers import UserPrivacySerializer 

class UserPrivacyView(generics.RetrieveUpdateAPIView):
    """ Handles the Privacy settings tab """
    serializer_class = UserPrivacySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        return settings
    
    def update(self, request, *args, **kwargs):
        print("------------------------------------------------")
        print("INCOMING DATA:", request.data) # See what frontend sent
        
        # Manually run validation to catch the error
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if not serializer.is_valid():
            print("VALIDATION ERRORS:", serializer.errors) # This prints the exact cause
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        print("UPDATE SUCCESSFUL")
        return Response(serializer.data)