const nodemailer = require('nodemailer');

// Create test account or fallback transport for demonstration
let transporter = null;

async function getTransporter() {
  if (!transporter) {
    // Generate test Ethereal account if no SMTP configured
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Ethereal test transport
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }
  }
  return transporter;
}

async function sendOrderConfirmationEmail(order) {
  try {
    const transport = await getTransporter();
    const itemsList = order.items.map(i => `• ${i.title} (Qty: ${i.quantity}) - ₹${(i.price * i.quantity).toFixed(2)}`).join('\n');
    
    const mailOptions = {
      from: '"MediQuick Pharmacy" <no-reply@medstore.com>',
      to: order.userEmail,
      subject: `Order Confirmation #${order._id} - MediQuick Pharmacy`,
      text: `Hello ${order.userName},\n\nThank you for your order at MediQuick Pharmacy!\n\nOrder Details:\n${itemsList}\n\nTotal Amount: ₹${order.totalAmount.toFixed(2)}\nPayment Method: ${order.paymentMethod || 'Cash on Delivery'}\nTransaction ID: ${order.transactionId || 'N/A'}\nDelivery Address: ${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}\n\nWe are preparing your medicines for express delivery.\n\nWarm regards,\nMediQuick Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0d9488; margin-top: 0;">Order Confirmation</h2>
          <p>Hello <strong>${order.userName}</strong>,</p>
          <p>Thank you for ordering with <strong>MediQuick Pharmacy</strong>! Your order has been received and is being processed for delivery.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin-top:0; color: #1e293b;">Order Summary (#${order._id})</h4>
            <pre style="font-family: inherit; margin: 0;">${itemsList}</pre>
            <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 10px 0;" />
            <p style="margin: 0; font-weight: bold; color: #0f766e;">Total Paid: ₹${order.totalAmount.toFixed(2)}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Payment Method: ${order.paymentMethod || 'Cash on Delivery'} | Txn ID: ${order.transactionId || 'N/A'}</p>
          </div>

          <p style="font-size: 13px; color: #475569;">
            <strong>Delivery Address:</strong><br />
            ${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}
          </p>

          <footer style="margin-top: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            MediQuick Retail Pharmacy • 24/7 Support: support@medstore.com
          </footer>
        </div>
      `
    };

    const info = await transport.sendMail(mailOptions);
    console.log('📧 Order confirmation email dispatched:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

async function sendRequestReplyEmail(request) {
  try {
    const transport = await getTransporter();
    const mailOptions = {
      from: '"MediQuick Admin" <admin@medstore.com>',
      to: request.userEmail,
      subject: `Update on your medicine request: ${request.medicineName}`,
      text: `Hello ${request.userName},\n\nOur pharmacy admin has responded to your request for "${request.medicineName}".\n\nAdmin Reply:\n"${request.adminReply}"\n\nStatus: ${request.status.toUpperCase()}\nTarget Due: ${request.dueDateTime}\n\nThank you for choosing MediQuick Pharmacy!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #d97706; margin-top: 0;">Medicine Request Response</h2>
          <p>Hello <strong>${request.userName}</strong>,</p>
          <p>Our pharmacy admin team has responded to your request for <strong>${request.medicineName}</strong> (Qty: ${request.quantity}).</p>
          
          <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border: 1px solid #fde68a; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">Admin Reply:</p>
            <p style="margin: 5px 0 0 0; color: #78350f;">"${request.adminReply}"</p>
          </div>

          <p style="font-size: 13px; color: #475569;">
            Status: <strong style="color: #059669;">${request.status.toUpperCase()}</strong> | Due Requested: ${request.dueDateTime}
          </p>
        </div>
      `
    };

    const info = await transport.sendMail(mailOptions);
    console.log('📧 Request reply email dispatched:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

module.exports = { sendOrderConfirmationEmail, sendRequestReplyEmail };
