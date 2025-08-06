# Email Setup Guide

## Configuration Required

To enable email notifications for booking confirmations, you need to add the following environment variables to your `.env` file:

```env
# Email Configuration (for Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
```

## Gmail App Password Setup

For Gmail, you need to use an App Password, not your regular password:

1. Go to your Google Account settings
2. Enable 2-Step Verification if not already enabled
3. Go to Security > App passwords
4. Generate a new app password for "Mail"
5. Use that password in `EMAIL_PASSWORD`

## Alternative Email Services

You can modify the `emailService.js` file to use other email services like:
- SendGrid
- Mailgun
- AWS SES
- Outlook/Hotmail

## Testing

When email credentials are not configured, the system will log the email content to the console instead of sending actual emails. This is useful for development and testing.

## Email Templates

The system sends two types of emails:
1. **Booking Confirmation**: Sent when a customer books an appointment
2. **Admin Confirmation**: Sent when an admin marks a booking as completed

Both emails include:
- Booking details (name, date, time, phone)
- Store information
- Contact details
- Instructions for the visit 