# EmailJS Setup Guide

Follow these steps to set up email notifications for new room creation:

## 1. Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Sign Up" (it's free - 200 emails/month)
3. Verify your email

## 2. Add Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose "Gmail" (or your preferred email provider)
4. Click "Connect Account" and authorize EmailJS to send emails
5. Copy the **Service ID** (you'll need this later)

## 3. Create Email Template

1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template:

**Template Name:** `new_room_notification`

**Subject:** `🎅 New Secret Santa Room: {{room_name}}`

**Content (HTML):**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #c41e3a;">🎅 New Secret Santa Room Created</h2>

  <div
    style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"
  >
    <h3 style="margin-top: 0;">Room Details</h3>
    <p><strong>Room Name:</strong> {{room_name}}</p>
    <p><strong>Room ID:</strong> {{room_id}}</p>
    <p><strong>Participants:</strong> {{participant_count}}</p>
    <p><strong>Secured:</strong> {{is_secured}}</p>
    <p><strong>Created At:</strong> {{created_at}}</p>
  </div>

  <div
    style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;"
  >
    <h3 style="margin-top: 0;">Creator Information</h3>
    <p><strong>Name:</strong> {{creator_name}}</p>
    <p><strong>Email:</strong> {{creator_email}}</p>
  </div>

  <div style="margin-top: 20px;">
    <p><strong>Participants:</strong> {{participant_names}}</p>
  </div>

  <div style="margin-top: 30px;">
    <a
      href="{{room_url}}"
      style="background-color: #c41e3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;"
      >View Room</a
    >
  </div>

  <div
    style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;"
  >
    <p>This is an automated notification from Secret Santa Generator</p>
  </div>
</div>
```

4. **Set "To Email"** to your email: `amir.hilal@hilalpines.com`
5. Click "Save"
6. Copy the **Template ID**

## 4. Get Your Public Key

1. Go to "Account" → "General"
2. Find your **Public Key**
3. Copy it

## 5. Add Environment Variables

Create/update `.env` file in the project root:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Replace with your actual values from EmailJS dashboard.

## 6. Add to GitHub Secrets

For production deployment, add these to your GitHub repository secrets:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`

## 7. Install Dependencies

```bash
npm install
```

## 8. Test

1. Run your app: `npm run dev`
2. Create a new room
3. Check your email (amir.hilal@hilalpines.com)

## How It Works

- When a room is created via `createRoom()`, it automatically calls `sendRoomCreatedNotification()`
- The email is sent from the browser directly to EmailJS
- EmailJS forwards it to your Gmail
- No backend needed, completely free!

## Troubleshooting

### Email not arriving?

1. Check spam folder
2. Check EmailJS dashboard logs
3. Open browser console for errors
4. Verify all environment variables are set correctly

### Rate Limits

- Free tier: 200 emails/month
- If you need more, upgrade to EmailJS paid plan ($7/month for 1000 emails)

## Cost

**FREE** - No payment required! 200 emails/month is plenty for a Secret Santa app.
