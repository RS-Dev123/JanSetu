import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome_back": "Welcome back",
      "create_account": "Create an Account",
      "voice_resolve": "Join People's Priorities to voice and resolve infrastructure development requests.",
      "access_constituency": "Sign in to access your constituency planning and citizen dashboard.",
      "email_address": "Email Address",
      "password": "Password",
      "full_name": "Full Name",
      "system_role": "System Role",
      "constituency": "Constituency",
      "remember_me": "Remember Me",
      "forgot_password": "Forgot Password?",
      "show_password": "Show Password",
      "sign_in": "Sign In",
      "create_account_btn": "Create Account",
      "or_sign_in_with": "Or Sign In With",
      "guest_mode": "Sign In as Guest (Demo Mode)",
      "already_have_account": "Already have an account? Sign In",
      "new_to_jansetu": "New to JanSetu? Create a Citizen Account",
      "language": "Language",
      "reset_pwd_title": "Reset Password",
      "reset_pwd_instructions": "Enter your email address and we will send you a link to reset your password.",
      "send_reset_link": "Send Reset Link",
      "cancel": "Cancel",
      "reset_success": "Password reset email sent successfully! Please check your inbox.",
      "phone_number": "Phone Number",
      "send_otp": "Send OTP Code",
      "verify_otp": "Verify & Sign In",
      "change_phone": "Change Phone Number"
    }
  },
  hi: {
    translation: {
      "welcome_back": "आपका स्वागत है",
      "create_account": "खाता बनाएं",
      "voice_resolve": "बुनियादी ढांचे के विकास के अनुरोधों को उठाने और हल करने के लिए जनसेतु में शामिल हों।",
      "access_constituency": "अपने निर्वाचन क्षेत्र की योजना और नागरिक डैशबोर्ड तक पहुँचने के लिए साइन इन करें।",
      "email_address": "ईमेल पता",
      "password": "पासवर्ड",
      "full_name": "पूरा नाम",
      "system_role": "सिस्टम भूमिका",
      "constituency": "निर्वाचन क्षेत्र",
      "remember_me": "मुझे याद रखें",
      "forgot_password": "पासवर्ड भूल गए?",
      "show_password": "पासवर्ड दिखाएं",
      "sign_in": "साइन इन करें",
      "create_account_btn": "खाता बनाएं",
      "or_sign_in_with": "या इसके साथ साइन इन करें",
      "guest_mode": "अतिथि के रूप में साइन इन करें (डेमो मोड)",
      "already_have_account": "पहले से ही एक खाता है? साइन इन करें",
      "new_to_jansetu": "जनसेतु में नए हैं? एक नागरिक खाता बनाएं",
      "language": "भाषा",
      "reset_pwd_title": "पासवर्ड रीसेट करें",
      "reset_pwd_instructions": "अपना ईमेल पता दर्ज करें और हम आपको आपका पासवर्ड रीसेट करने के लिए एक लिंक भेजेंगे।",
      "send_reset_link": "रीसेट लिंक भेजें",
      "cancel": "रद्द करें",
      "reset_success": "पासवर्ड रीसेट ईमेल सफलतापूर्वक भेजा गया! कृपया अपना इनबॉक्स देखें।",
      "phone_number": "फ़ोन नंबर",
      "send_otp": "ओटीपी कोड भेजें",
      "verify_otp": "सत्यापित करें और साइन इन करें",
      "change_phone": "फ़ोन नंबर बदलें"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
