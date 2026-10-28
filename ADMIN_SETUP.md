# 🔐 Admin Access Setup Guide

## Admin Secret Key

To create an admin account, you need the **Admin Secret Key**.

### Current Admin Secret Key:

```
SKILLBRIDGE_ADMIN_2025_SECRET
```

## Accessing Admin Portal

### Direct URL Access:

- **Admin Login**: `/admin-login`
- **Admin Signup**: `/admin-signup`
- **Admin Dashboard**: `/admin-dashboard`

**Note**: Admin access links are NOT visible on student/tutor pages for security reasons.

## Creating Your First Admin Account

1. **Go to Admin Signup**: Navigate directly to `/admin-signup`
2. **Fill the form**:
   - Name: Your admin name
   - Email: Your admin email
   - Password: Strong password (8+ characters)
   - Confirm Password: Same as password
   - **Admin Secret Key**: `SKILLBRIDGE_ADMIN_2025_SECRET`
3. **Create Account**: Submit the form
4. **Login**: Use the same credentials at `/admin-login`

## Security Features

✅ **Secret Key Protection**: Only users with the secret key can create admin accounts  
✅ **Hidden Access**: No admin links visible on student/tutor pages  
✅ **Direct URL Access**: Admin portal only accessible via direct URLs  
✅ **Role-Based Access**: Admins have separate authentication from students/tutors  
✅ **JWT Authentication**: Secure token-based authentication  
✅ **Input Validation**: Server-side validation for all admin operations

## Admin Capabilities

- 📊 **Dashboard Overview**: View platform statistics
- 👥 **User Management**: Monitor students and tutors
- 🔧 **System Administration**: Full administrative control
- 🔒 **Secure Access**: Protected admin-only routes

## Environment Variables

Make sure your `.env` file contains:

```
ADMIN_SECRET_KEY=SKILLBRIDGE_ADMIN_2025_SECRET
```

## Changing the Secret Key

To change the admin secret key:

1. Update `ADMIN_SECRET_KEY` in your `.env` file
2. Restart the backend server
3. Use the new key for admin account creation

---

**⚠️ Important**: Keep the admin secret key confidential and only share with authorized personnel.
