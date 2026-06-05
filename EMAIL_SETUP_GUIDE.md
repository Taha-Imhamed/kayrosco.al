# Email Notification Setup Guide

## Overview
To send automated email notifications to clients after they submit a request, you'll need to integrate an email service. Here are the recommended options:

## Option 1: EmailJS (Easiest - No Backend Required)

### Setup Steps:
1. **Create EmailJS Account**
   - Go to [https://www.emailjs.com/](https://www.emailjs.com/)
   - Sign up for a free account

2. **Create Email Template**
   - Go to Email Templates section
   - Create a new template with this content:
   ```
   Subject: Request Received - Kayrosco Tech Team

   Hi {{to_name}},

   Thank you for submitting your request for {{service_type}}.

   We have received your request and one of our team members will contact you within 24 hours.

   Your Request Details:
   - Service: {{service_type}}
   - Date: {{submission_date}}

   In the meantime, feel free to call us at: +1 (555) 123-4567

   Best regards,
   The Kayrosco Tech Team
   ```

3. **Get Your Credentials**
   - Service ID
   - Template ID
   - Public Key

4. **Install EmailJS**
   ```bash
   npm install @emailjs/browser
   ```

5. **Add to Tech.tsx** (in the handleSubmit function):
   ```typescript
   import emailjs from '@emailjs/browser';

   // After saving to localStorage, add:
   emailjs.send(
     'YOUR_SERVICE_ID',
     'YOUR_TEMPLATE_ID',
     {
       to_email: formData.email,
       to_name: formData.name,
       service_type: formData.service,
       submission_date: new Date().toLocaleDateString(),
     },
     'YOUR_PUBLIC_KEY'
   );
   ```

## Option 2: Using a Backend Service

If you want more control, you can use:
- **SendGrid** (https://sendgrid.com/)
- **Mailgun** (https://www.mailgun.com/)
- **AWS SES** (https://aws.amazon.com/ses/)

These require backend integration and API keys.

## Current Implementation

Currently, the app:
✅ Shows a confirmation toast with contact number
✅ Saves all requests to localStorage
✅ Admin can view all requests at `/admin/tech`
✅ Displays message that email will be sent

To complete the email functionality, follow Option 1 above (EmailJS).

## Testing Admin Panel

1. Go to `/admin/tech`
2. Login with:
   - Username: `tech`
   - Password: `tech123`
3. View all submitted requests
4. Update status (Pending/Processing/Completed)
5. Delete requests if needed

## Data Storage

All requests are stored in browser's localStorage under key `techRequests`.
To view stored data:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Find `techRequests` key
