# Forgot Password Fix - Complete Setup Guide

## ✅ Changes Implemented

### 1. Backend Improvements

#### Email Service (`backend/config/email.js`)
- Configured nodemailer with Gmail SMTP
- Sends HTML-formatted password reset emails
- Includes 1-hour expiration notice
- Sends confirmation email after successful reset

#### Database Schema (`backend/config/db.js`)
- Added `password_reset_tokens` table to store reset tokens:
  ```sql
  - user_id: Links to user
  - email: For recovery
  - reset_token: Hashed for security
  - expires_at: 1-hour expiration
  - created_at: Timestamp
  ```

#### Authentication Controller (`backend/controllers/authController.js`)
**forgotPassword endpoint:**
- Generates cryptographically secure token
- Hashes token before storage (SHA256)
- Stores with 1-hour expiration
- Sends email with reset link
- Returns success message

**resetPassword endpoint:**
- Now requires `resetToken` parameter
- Validates token against database
- Checks token expiration
- Deletes token after successful use
- Sends confirmation email

### 2. Mobile Frontend Improvements

#### Authentication API (`mobile/constants/authAPI.js`)
- `resetPasswordAPI()` now accepts and sends `resetToken`

#### Forgot Password Screen (`mobile/app/(auth)/forgot-password.jsx`)
- Better user feedback with confirmation screen
- Shows "Check Your Email" message
- Option to try different email
- Clear error handling

#### Reset Password Screen (`mobile/app/(auth)/create-new-password.jsx`)
- Accepts token from URL parameters: `?token=TOKEN&email=EMAIL`
- Validates token before showing form
- Shows helpful error for invalid/expired tokens
- Password validation (minimum 6 characters)
- Sends token with password reset request

---

## ⚙️ Configuration Needed

### Deep Linking Setup (Optional but Recommended)

To make email links clickable, update `mobile/app.json`:

```json
{
  "expo": {
    "name": "skrepachap",
    ...
    "scheme": "exp",
    "plugins": ["expo-router"],
    ...
  }
}
```

Then configure linking in `mobile/app/_layout.jsx`:

```javascript
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix, 'exp://', 'skrepachap://'],
  config: {
    screens: {
      '(auth)/create-new-password': 'reset-password',
      '(root)': '*',
    },
  },
};

export default function RootLayout() {
  return (
    <NavigationContainer linking={linking}>
      <Slot />
    </NavigationContainer>
  );
}
```

---

## 📧 Email Configuration

The system uses Gmail SMTP configured in `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=gmail
MAIL_PORT=465
MAIL_USERNAME=countrymaterialapp@gmail.com
MAIL_PASSWORD=2098Country@
```

✅ Already configured in your `.env` file

---

## 🔒 Security Features

✅ **Token Hashing**: Tokens are hashed before storage (not plaintext)
✅ **Token Expiration**: Automatically expires after 1 hour
✅ **One-Time Use**: Token deleted immediately after use
✅ **Confirmation Email**: Sent after successful password change
✅ **Token Validation**: Strict validation on reset attempt

---

## 🧪 Testing Guide

### Test Scenario 1: Complete Password Reset Flow
1. Open mobile app and click "Forgot Password"
2. Enter a registered email address
3. Should see "Check Your Email" confirmation
4. Check Gmail inbox for reset email
5. Click "Reset Password" link in email (or copy token)
6. Enter new password twice (must match, min 6 chars)
7. Click "Reset Password"
8. Should be redirected to sign-in screen
9. Log in with new password - should work

### Test Scenario 2: Invalid Token
1. Manually try to access reset page without token
2. Should see "Invalid or expired reset link" error
3. Should offer to "Request New Link"

### Test Scenario 3: Expired Token
1. Request password reset
2. Wait 60+ minutes (or modify token in DB)
3. Try to reset with old token
4. Should see "Reset token has expired" error

### Test Scenario 4: Token Already Used
1. Request password reset and complete it
2. Try to use same token again
3. Should see "Invalid or expired reset token" error

---

## 🐛 Troubleshooting

### Email Not Sending
1. Check Gmail credentials in `.env` (MAIL_USERNAME, MAIL_PASSWORD)
2. Check backend console for nodemailer errors
3. Gmail may require "Less Secure Apps" access or App Passwords
4. For Gmail 2FA, use App Password instead of account password

### Token Not Working
1. Check backend logs for token generation issues
2. Verify `password_reset_tokens` table exists in database
3. Check token expiration time (should be 1 hour from now)
4. Ensure URL encoding of email and token parameters

### Deep Linking Not Working
1. Deep linking setup is optional - app works without it
2. User can manually navigate to create-new-password page
3. Or configure linking as shown in "Configuration Needed" section
4. Test with: `exp://localhost:8081/reset-password?token=ABC&email=test@example.com`

---

## 📋 Files Modified

**Backend:**
- ✅ `backend/config/email.js` (NEW)
- ✅ `backend/config/db.js` (UPDATED)
- ✅ `backend/controllers/authController.js` (UPDATED)

**Mobile:**
- ✅ `mobile/constants/authAPI.js` (UPDATED)
- ✅ `mobile/app/(auth)/forgot-password.jsx` (UPDATED)
- ✅ `mobile/app/(auth)/create-new-password.jsx` (UPDATED)

---

## 🚀 Next Steps

1. ✅ Test the complete password reset flow
2. ✅ Verify emails are being sent to Gmail inbox
3. ✅ Check that tokens expire properly
4. (Optional) Configure deep linking for clickable email links
5. Test with multiple user accounts
6. Monitor backend logs for any errors

---

## 📞 Support

If you encounter any issues:
1. Check backend console for error messages
2. Verify Gmail credentials and app passwords
3. Check that `password_reset_tokens` table was created
4. Verify token is being generated and stored correctly
5. Check email configuration in `.env`

