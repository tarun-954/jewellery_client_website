const nodemailer = require('nodemailer');

// Create transporter for Gmail (you can change this to your email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use app password for Gmail
    }
  });
};

// Email template for booking confirmation
const createBookingConfirmationEmail = (bookingData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Request Received</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body { 
          font-family: 'Poppins', Arial, sans-serif; 
          margin: 0; 
          padding: 0; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff; 
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
          animation: slideIn 0.6s ease-out;
        }
        
        @keyframes slideIn {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .header { 
          background: linear-gradient(135deg, #d97706, #92400e); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 700;
          position: relative;
          z-index: 1;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .content { 
          padding: 40px 30px; 
          position: relative;
        }
        
        .logo { 
          font-size: 28px; 
          font-weight: 700; 
          margin-bottom: 15px;
          position: relative;
          z-index: 1;
        }
        
        .status { 
          background: linear-gradient(135deg, #f59e0b, #d97706); 
          color: white; 
          padding: 12px 24px; 
          border-radius: 25px; 
          display: inline-block; 
          margin: 20px 0;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .booking-details { 
          background: linear-gradient(135deg, #fef3c7, #fde68a); 
          border-left: 5px solid #d97706; 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(217, 119, 6, 0.1);
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          margin: 15px 0;
          padding: 10px 0;
          border-bottom: 1px solid rgba(217, 119, 6, 0.1);
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label { 
          font-weight: 600; 
          color: #374151;
          font-size: 14px;
        }
        
        .detail-value { 
          color: #1f2937;
          font-weight: 500;
          font-size: 14px;
        }
        
        .waiting-notice {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border: 2px solid #3b82f6;
          padding: 25px;
          border-radius: 15px;
          margin: 25px 0;
          text-align: center;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }
        
        .waiting-notice h3 {
          color: #1e40af;
          margin: 0 0 15px 0;
          font-size: 20px;
          font-weight: 600;
        }
        
        .waiting-notice p {
          color: #1e3a8a;
          margin: 0;
          line-height: 1.6;
          font-size: 15px;
        }
        
        .steps {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border: 1px solid #0ea5e9;
          padding: 25px;
          border-radius: 15px;
          margin: 25px 0;
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }
        
        .steps h3 {
          color: #0c4a6e;
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .step-item {
          display: flex;
          align-items: center;
          margin: 15px 0;
          padding: 10px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 10px;
          transition: transform 0.2s ease;
        }
        
        .step-item:hover {
          transform: translateX(5px);
        }
        
        .step-number {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          margin-right: 15px;
        }
        
        .step-text {
          color: #0c4a6e;
          font-size: 14px;
          font-weight: 500;
        }
        
        .footer { 
          background: linear-gradient(135deg, #f8fafc, #f1f5f9); 
          padding: 30px; 
          text-align: center; 
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
          margin: 8px 0;
          font-size: 14px;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin: 20px 0;
          flex-wrap: wrap;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #64748b;
        }
        
        .emoji {
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✨ Chanchal Ornaments</div>
          <h1>Booking Request Received!</h1>
          <p>We've received your appointment request</p>
        </div>
        
        <div class="content">
          <div class="status">⏳ Pending Confirmation</div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">Booking Request Details</h2>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">👤 Name:</span>
              <span class="detail-value">${bookingData.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Date:</span>
              <span class="detail-value">${new Date(bookingData.date).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🕐 Time:</span>
              <span class="detail-value">${bookingData.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📞 Phone:</span>
              <span class="detail-value">${bookingData.phone}</span>
            </div>
          </div>
          
          <div class="waiting-notice">
            <h3>⏰ Please Wait for Confirmation</h3>
            <p>Your booking request has been submitted successfully! Our admin team will review your request and send you a confirmation email within 24 hours.</p>
          </div>
          
          <div class="steps">
            <h3>📋 What Happens Next?</h3>
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-text">We review your booking request</div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-text">Admin confirms your appointment</div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-text">You receive confirmation email</div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-text">Visit us for your consultation</div>
            </div>
          </div>
          
          <p style="color: #374151; line-height: 1.6; font-size: 15px; margin: 25px 0;">
            We're excited to help you find the perfect jewelry piece! Our team of experts will provide you with personalized recommendations based on your preferences and requirements.
          </p>
          
          <p style="color: #374151; line-height: 1.6; font-size: 15px;">
            If you need to modify your request or have any questions, please contact us at <strong>+91-XXXXXXXXXX</strong> or reply to this email.
          </p>
        </div>
        
        <div class="footer">
          <p style="font-weight: 600; color: #374151; margin-bottom: 20px;">Thank you for choosing Chanchal Ornaments!</p>
          <div class="contact-info">
            <div class="contact-item">
              <span class="emoji">📍</span>
              <span>Store Address: [Your Store Address]</span>
            </div>
            <div class="contact-item">
              <span class="emoji">📞</span>
              <span>Contact: +91-XXXXXXXXXX</span>
            </div>
            <div class="contact-item">
              <span class="emoji">🌐</span>
              <span>Website: www.chanchalornaments.com</span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for admin confirmation
const createAdminConfirmationEmail = (bookingData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Appointment Confirmed by Admin</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .booking-details { background-color: #d1fae5; border-left: 4px solid #059669; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .detail-label { font-weight: bold; color: #374151; }
        .detail-value { color: #1f2937; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .status { background-color: #059669; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
        .highlight { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✨ Chanchal Ornaments</div>
          <h1>Appointment Confirmed!</h1>
          <p>Your appointment has been confirmed by our team</p>
        </div>
        
        <div class="content">
          <div class="status">✅ ADMIN CONFIRMED</div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Confirmed Booking Details</h2>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${bookingData.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(bookingData.date).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${bookingData.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${bookingData.phone}</span>
            </div>
          </div>
          
          <div class="highlight">
            <h3 style="color: #1f2937; margin-top: 0;">🎉 Great News!</h3>
            <p style="color: #374151; line-height: 1.6;">
              Your appointment has been officially confirmed by our admin team. We're looking forward to meeting you and helping you find the perfect jewelry piece!
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            <strong>Important Reminders:</strong>
          </p>
          <ul style="color: #374151; line-height: 1.6;">
            <li>Please arrive 5 minutes before your scheduled time</li>
            <li>Bring any specific jewelry preferences or requirements</li>
            <li>Our expert team will be ready to assist you</li>
            <li>Free consultation and personalized recommendations</li>
          </ul>
          
          <p style="color: #374151; line-height: 1.6;">
            If you need to reschedule or have any questions, please contact us at <strong>+91-XXXXXXXXXX</strong> or reply to this email.
          </p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Chanchal Ornaments!</p>
          <p>📍 Store Address: [Your Store Address]</p>
          <p>📞 Contact: +91-XXXXXXXXXX</p>
          <p>🌐 Website: www.chanchalornaments.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send email function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email credentials not configured. Email would be sent to:', to);
      console.log('Subject:', subject);
      console.log('Content:', htmlContent);
      return { success: true, message: 'Email logged (credentials not configured)' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation email
const sendBookingConfirmation = async (bookingData) => {
  const subject = 'Booking Request Received - Chanchal Ornaments';
  const htmlContent = createBookingConfirmationEmail(bookingData);
  
  return await sendEmail(bookingData.email, subject, htmlContent);
};

// Send admin confirmation email
const sendAdminConfirmation = async (bookingData) => {
  const subject = 'Appointment Confirmed by Admin - Chanchal Ornaments';
  const htmlContent = createAdminConfirmationEmail(bookingData);
  
  return await sendEmail(bookingData.email, subject, htmlContent);
};

// Email template for order confirmation
const createOrderConfirmationEmail = (orderData) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Chanchal Ornaments</title>
      <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js" type="module"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body { 
          font-family: 'Poppins', Arial, sans-serif; 
          margin: 0; 
          padding: 0; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff; 
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
          animation: slideIn 0.6s ease-out;
        }
        
        @keyframes slideIn {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .header { 
          background: linear-gradient(135deg, #d97706, #92400e); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 700;
          position: relative;
          z-index: 1;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .content { 
          padding: 40px 30px; 
          position: relative;
        }
        
        .logo { 
          font-size: 28px; 
          font-weight: 700; 
          margin-bottom: 15px;
          color: #d97706;
        }
        
        .order-number {
          background: linear-gradient(135deg, #d97706, #92400e);
          color: white;
          padding: 15px 25px;
          border-radius: 15px;
          text-align: center;
          margin: 20px 0;
          font-size: 18px;
          font-weight: 600;
          animation: bounce 2s infinite;
        }
        
        .animation-container {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 15px;
          border: 2px solid #f59e0b;
          animation: pulse 2s infinite;
          position: relative;
          overflow: hidden;
        }
        
        .animation-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }
        
        .animation-container iframe {
          border: none;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
          position: relative;
          z-index: 1;
        }
        
        .animation-container p {
          position: relative;
          z-index: 1;
        }
        
        .order-details {
          background-color: #f8fafc;
          border-left: 4px solid #d97706;
          padding: 25px;
          margin: 25px 0;
          border-radius: 10px;
        }
        
        .order-items {
          margin: 25px 0;
        }
        
        .item {
          display: flex;
          align-items: center;
          padding: 15px;
          background: white;
          border-radius: 10px;
          margin: 10px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .item img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          margin-right: 15px;
        }
        
        .item-details {
          flex: 1;
        }
        
        .item-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 5px;
        }
        
        .item-price {
          color: #6b7280;
          font-size: 14px;
        }
        
        .shipping-info {
          background-color: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 20px 0;
          border-radius: 10px;
        }
        
        .total-section {
          background: linear-gradient(135deg, #d97706, #92400e);
          color: white;
          padding: 25px;
          border-radius: 15px;
          text-align: center;
          margin: 25px 0;
          animation: fadeInUp 0.8s ease-out;
        }
        
        .total-amount {
          font-size: 28px;
          font-weight: 700;
          margin: 10px 0;
        }
        
        .status-badge {
          display: inline-block;
          background-color: #fef3c7;
          color: #92400e;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin: 10px 0;
        }
        
        .footer {
          background-color: #1f2937;
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .footer h3 {
          margin: 0 0 15px 0;
          color: #d97706;
        }
        
        .contact-info {
          margin: 15px 0;
          font-size: 14px;
        }
        
        .social-links {
          margin-top: 20px;
        }
        
        .social-links a {
          color: #d97706;
          text-decoration: none;
          margin: 0 10px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your purchase from Chanchal Ornaments</p>
        </div>
        
        <div class="content">
          <div class="logo">✨ Chanchal Ornaments</div>
          
          <div class="order-number">
            Order #${orderData.orderNumber}
          </div>
          
          <div class="animation-container">
            <iframe 
              src="https://lottie.host/embed/bfaaed62-4411-4432-84e4-165dd39c1529/VX4pVq1TJZ.lottie"
              width="300" 
              height="300"
              title="Order Confirmation Animation"
              style="border: none; border-radius: 10px; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);">
            </iframe>
            <p style="margin-top: 15px; color: #92400e; font-weight: 600; font-size: 16px;">🎉 Your order has been successfully placed!</p>
          </div>
          
          <div class="order-details">
            <h3>📋 Order Details</h3>
            <p><strong>Order Date:</strong> ${formatDate(orderData.createdAt)}</p>
            <p><strong>Status:</strong> <span class="status-badge">${orderData.status}</span></p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
          </div>
          
          <div class="order-items">
            <h3>🛍️ Order Items</h3>
            ${orderData.items.map(item => `
              <div class="item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                  <div class="item-name">${item.name}</div>
                  <div class="item-price">Quantity: ${item.quantity} × ${formatPrice(item.price)}</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="shipping-info">
            <h3>📦 Shipping Address</h3>
            <p><strong>${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}</strong></p>
            <p>${orderData.shippingAddress.address}</p>
            <p>${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}</p>
            <p>📞 ${orderData.shippingAddress.phone}</p>
            <p>📧 ${orderData.shippingAddress.email}</p>
          </div>
          
          <div class="total-section">
            <h3>💰 Total Amount</h3>
            <div class="total-amount">${formatPrice(orderData.totalAmount)}</div>
            <p>Thank you for choosing Chanchal Ornaments!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              We'll send you updates about your order status. You can track your order in your account.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <h3>Chanchal Ornaments</h3>
          <div class="contact-info">
            <p>📍 Palampur, Himachal Pradesh</p>
            <p>📞 +91 9805394341</p>
            <p>📧 admin@tarun.com</p>
          </div>
          <div class="social-links">
            <a href="#">Facebook</a> | 
            <a href="#">Instagram</a> | 
            <a href="#">WhatsApp</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation email
const sendOrderConfirmation = async (orderData) => {
  const subject = `Order Confirmation - ${orderData.orderNumber}`;
  const htmlContent = createOrderConfirmationEmail(orderData);
  
  return await sendEmail(orderData.shippingAddress.email, subject, htmlContent);
};

// Email template for admin order notification
const createAdminOrderNotificationEmail = (orderData) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Received - Admin Notification</title>
      <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js" type="module"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body { 
          font-family: 'Poppins', Arial, sans-serif; 
          margin: 0; 
          padding: 0; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff; 
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .header { 
          background: linear-gradient(135deg, #dc2626, #991b1b); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 700;
        }
        
        .content { 
          padding: 40px 30px; 
        }
        
        .order-number {
          background: linear-gradient(135deg, #dc2626, #991b1b);
          color: white;
          padding: 15px 25px;
          border-radius: 15px;
          text-align: center;
          margin: 20px 0;
          font-size: 18px;
          font-weight: 600;
          animation: bounce 2s infinite;
        }
        
        .order-summary {
          background-color: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 25px;
          margin: 25px 0;
          border-radius: 10px;
        }
        
        .customer-info {
          background-color: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          padding: 20px;
          margin: 20px 0;
          border-radius: 10px;
        }
        
        .total-section {
          background: linear-gradient(135deg, #dc2626, #991b1b);
          color: white;
          padding: 25px;
          border-radius: 15px;
          text-align: center;
          margin: 25px 0;
        }
        
        .total-amount {
          font-size: 28px;
          font-weight: 700;
          margin: 10px 0;
        }
        
        .animation-container {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background: linear-gradient(135deg, #fef2f2, #fecaca);
          border-radius: 15px;
          border: 2px solid #dc2626;
          animation: pulse 2s infinite;
          position: relative;
          overflow: hidden;
        }
        
        .animation-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }
        
        .animation-container iframe {
          border: none;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
          position: relative;
          z-index: 1;
        }
        
        .animation-container p {
          position: relative;
          z-index: 1;
        }
        
        .footer {
          background-color: #1f2937;
          color: white;
          padding: 30px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 New Order Received!</h1>
          <p>Action required - Process this order</p>
        </div>
        
        <div class="content">
          <div class="order-number">
            Order #${orderData.orderNumber}
          </div>
          
          <div class="animation-container">
            <dotlottie-wc 
              src="https://lottie.host/392e9441-67bc-4c24-8e3b-696318b2086c/xYgcRSwEqT.lottie" 
              style="width: 300px; height: 300px; border: none; border-radius: 10px; box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);" 
              speed="1" 
              autoplay 
              loop>
            </dotlottie-wc>
            <p style="margin-top: 15px; color: #991b1b; font-weight: 600; font-size: 16px;">🛒 New order requires your attention!</p>
          </div>
          
          <div class="order-summary">
            <h3>📋 Order Summary</h3>
            <p><strong>Customer:</strong> ${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}</p>
            <p><strong>Email:</strong> ${orderData.shippingAddress.email}</p>
            <p><strong>Phone:</strong> ${orderData.shippingAddress.phone}</p>
            <p><strong>Items:</strong> ${orderData.items.length} item(s)</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
          </div>
          
          <div class="customer-info">
            <h3>📦 Shipping Address</h3>
            <p>${orderData.shippingAddress.address}</p>
            <p>${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}</p>
          </div>
          
          <div class="total-section">
            <h3>💰 Total Amount</h3>
            <div class="total-amount">${formatPrice(orderData.totalAmount)}</div>
            <p>Please process this order as soon as possible</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Login to your admin dashboard to view full order details and update status.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <h3>Chanchal Ornaments</h3>
          <p>Admin Notification System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send admin order notification email
const sendAdminOrderNotification = async (orderData) => {
  const subject = `New Order Received - ${orderData.orderNumber}`;
  const htmlContent = createAdminOrderNotificationEmail(orderData);
  
  return await sendEmail(process.env.ADMIN_EMAIL || 'admin@tarun.com', subject, htmlContent);
};

module.exports = {
  sendBookingConfirmation,
  sendAdminConfirmation,
  sendOrderConfirmation,
  sendAdminOrderNotification,
  sendEmail
}; 