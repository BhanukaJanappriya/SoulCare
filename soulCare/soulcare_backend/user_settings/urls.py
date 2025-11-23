from django.urls import path
from .views import UserThemeView, UserPreferencesView, UserPrivacyView, ChangePasswordView, TwoFactorStatusView, TwoFactorSetupView, TwoFactorVerifyView, TwoFactorDisableView,StripeSetupIntentView, BillingInfoView, StripeSaveMethodView 

urlpatterns = [
    path('theme/', UserThemeView.as_view(), name='user-theme'),
    path('preferences/', UserPreferencesView.as_view(), name='user-preferences'),
    path('privacy/', UserPrivacyView.as_view(), name='user-privacy'),
    path('password/change/', ChangePasswordView.as_view(), name='change-password'),

    # --- NEW: 2FA URLs ---
    path('2fa/status/', TwoFactorStatusView.as_view(), name='2fa-status'),
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa-verify'),
    path('2fa/disable/', TwoFactorDisableView.as_view(), name='2fa-disable'),

    path('billing/setup-intent/', StripeSetupIntentView.as_view(), name='billing-setup-intent'),
    path('billing/save-method/', StripeSaveMethodView.as_view(), name='billing-save-method'),
    path('billing/info/', BillingInfoView.as_view(), name='billing-info'),
]