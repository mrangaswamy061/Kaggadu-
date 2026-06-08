import nodemailer from 'nodemailer';

export async function sendBookingStatusEmail(booking, trekName) {
  const isApproved = booking.status === 'Approved';
  const statusColor = isApproved ? '#10b981' : '#ef4444'; // Emerald green vs Red
  const statusText = isApproved ? 'APPROVED' : 'REJECTED';

  const host = process.env.SMTP_HOST || '';
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  let transporter;

  if (host && user && pass) {
    // Real SMTP Configuration
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port == 465,
      auth: { user, pass }
    });
  } else {
    // Development / Fallback mode
    console.log('\n--- [EMAIL FALLBACK LOG] ---');
    console.log(`To: ${booking.email}`);
    console.log(`Subject: Your Booking for ${trekName} is ${statusText}!`);
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Status: ${booking.status}`);
    console.log('----------------------------\n');
    return { success: true, message: 'Logged to console (SMTP not configured)' };
  }

  const mailOptions = {
    from: `"Kaggadu Adventures" <${user}>`,
    to: booking.email,
    subject: isApproved 
      ? `🎉 Booking CONFIRMED! Get Ready for ${trekName}!`
      : `⚠️ Update on your ${trekName} booking request`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: #ffffff; padding: 40px 20px; text-align: center; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <!-- Header -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #f97316; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
            KAGGADU <span style="color: #22c55e;">ADVENTURES</span>
          </h2>
        </div>

        <!-- Banner / Hero -->
        <div style="background-color: #0f172a; padding: 30px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 30px;">
          <h3 style="color: #ffffff; font-size: 20px; margin-top: 0; font-weight: 700;">
            Hi ${booking.name},
          </h3>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            ${isApproved 
              ? `Your trek booking has been officially verified and **approved** by our leads! Get ready to scale the peaks, make amazing memories, and vibe with the youthful Kaggadu Adventures community.` 
              : `Thank you for your interest in Kaggadu Adventures. Unfortunately, we were unable to verify your payment or your booking details, and your request has been declined.`}
          </p>

          <!-- Status badge -->
          <div style="display: inline-block; padding: 10px 25px; border-radius: 50px; background-color: ${statusColor}1A; border: 1px solid ${statusColor}; color: ${statusColor}; font-size: 14px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px;">
            Booking ${statusText}
          </div>
        </div>

        <!-- Booking details table -->
        <div style="background-color: #0f172a; border-radius: 8px; border: 1px solid #1e293b; overflow: hidden; margin-bottom: 35px;">
          <div style="background-color: #1e293b; padding: 12px 20px; font-weight: 700; font-size: 14px; text-transform: uppercase; color: #f97316; letter-spacing: 1px; text-align: left;">
            Booking Details
          </div>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 12px 20px; color: #94a3b8;">Booking ID</td>
              <td style="padding: 12px 20px; color: #ffffff; font-weight: 600;">${booking.id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 12px 20px; color: #94a3b8;">Selected Trail</td>
              <td style="padding: 12px 20px; color: #ffffff; font-weight: 600;">${trekName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 12px 20px; color: #94a3b8;">Phone Number</td>
              <td style="padding: 12px 20px; color: #ffffff; font-weight: 600;">${booking.phone}</td>
            </tr>
            <tr>
              <td style="padding: 12px 20px; color: #94a3b8;">Status</td>
              <td style="padding: 12px 20px; color: ${statusColor}; font-weight: 800; text-transform: uppercase;">${booking.status}</td>
            </tr>
          </table>
        </div>

        ${isApproved ? `
        <!-- Inclusions reminder for packing -->
        <div style="text-align: left; background-color: #0f172a; padding: 25px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 35px;">
          <h4 style="color: #22c55e; margin: 0 0 12px 0; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
            🎒 Quick Trek Checklist
          </h4>
          <ul style="color: #cbd5e1; font-size: 13px; padding-left: 20px; margin: 0; line-height: 1.8;">
            <li>Original government photo ID card (mandatory)</li>
            <li>Backpack (30-40L) with rain cover</li>
            <li>Sturdy trekking shoes with good grip</li>
            <li>Refillable water bottle (stay eco-friendly!)</li>
            <li>Comfortable warm clothing & rain protection</li>
          </ul>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="border-top: 1px solid #1e293b; padding-top: 25px; margin-top: 25px; font-size: 12px; color: #64748b;">
          <p style="margin: 0 0 10px 0;">
            Need help or have questions? Contact our lead coordinators:
          </p>
          <p style="margin: 5px 0; font-weight: 700; color: #cbd5e1;">
            📞 WhatsApp: +91 77600 13106 | 📱 Hotline: +91 93537 72729
          </p>
          <p style="margin: 5px 0; font-weight: 700; color: #cbd5e1;">
            ✉️ Email: kaggadu@gmail.com
          </p>
          <p style="margin: 20px 0 0 0; font-size: 11px;">
            © 2020 Kaggadu Adventures. All rights reserved. Jayanagar 4th Block, Tumkur, Karnataka.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Booking Status email sent successfully to ${booking.email}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send status email to ${booking.email}:`, error);
    return { success: false, error: error.message };
  }
}

export async function sendLeadNotificationEmail(booking, trekName) {
  const host = process.env.SMTP_HOST || '';
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  // Log SMS/messaging alerts to the lead and main numbers in the console
  console.log('\n=== [NEW BOOKING NOTIFICATION FOR LEADS & MAIN NUMBER] ===');
  console.log(`Notification sent to Lead Number: +91 93537 72729`);
  console.log(`Notification sent to Main Number: +91 77600 13106`);
  console.log(`Message: New booking confirmed! ID: ${booking.id}, Customer: ${booking.name}, Phone: ${booking.phone}, Trek: ${trekName}, Date: ${booking.trekDate}.`);
  console.log('==========================================================\n');

  if (!host || !user || !pass) {
    console.log('SMTP not configured, skipping lead email notification.');
    return { success: true, message: 'Logged notification to console' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: port == 465,
    auth: { user, pass }
  });

  const mailOptions = {
    from: `"Kaggadu Adventures" <${user}>`,
    to: 'kaggadu@gmail.com',
    subject: `🚨 NEW BOOKING CONFIRMED: ${booking.name} - ${trekName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2E8B57; border-bottom: 2px solid #2E8B57; padding-bottom: 10px;">New Trek Booking Notification</h2>
        <p>A customer has booked a trek. The details are below:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Booking ID</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Name</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone Number</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Trek</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${trekName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Trek Date</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.trekDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Age / Gender</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.age} / ${booking.gender}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Emergency Contact</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.emergencyContact}</td>
          </tr>
        </table>
        <div style="margin-top: 20px;">
          <p><strong>Payment Screenshot Attached:</strong></p>
          ${booking.paymentScreenshot ? `<img src="${booking.paymentScreenshot}" style="max-width: 100%; max-height: 400px; border: 1px solid #ccc; border-radius: 4px;" alt="Payment Screenshot"/>` : '<p>No screenshot uploaded</p>'}
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Lead notification email sent successfully to kaggadu@gmail.com. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send lead notification email:`, error);
    return { success: false, error: error.message };
  }
}
