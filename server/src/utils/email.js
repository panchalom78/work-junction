import { createTransport } from "nodemailer";

const createTransporter = () => {
    return createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: 465, // SSL port for Gmail
        secure: true, // true for port 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD, // Gmail App password
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
};

/**
 * Send OTP email
 * @param {String} email - Recipient email
 * @param {String} otp - OTP code
 * @param {String} name - User name
 * @param {String} purpose - Purpose of OTP
 */
const sendOTPEmail = async (email, otp, name, purpose = "REGISTRATION") => {
    try {
        const transporter = createTransporter();

        let subject, htmlContent;

        switch (purpose) {
            case "REGISTRATION":
                subject = "Verify Your Email - Registration OTP";
                htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thank you for registering with us! To complete your registration, please verify your email address using the OTP below:</p>
                
                <div class="otp-box">
                  <p style="margin: 0; color: #666;">Your OTP Code</p>
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">Valid for 10 minutes</p>
                </div>

                <div class="warning">
                  <strong>⚠️ Security Note:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
                </div>

                <p>If you didn't request this verification, please ignore this email.</p>
                
                <p>Best regards,<br>The Team</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
          </html>
        `;
                break;

            case "PASSWORD_RESET":
                subject = "Password Reset OTP";
                htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #f5576c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #f5576c; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 12px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${name}</strong>,</p>
                <p>We received a request to reset your password. Use the OTP below to proceed:</p>
                
                <div class="otp-box">
                  <p style="margin: 0; color: #666;">Your OTP Code</p>
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">Valid for 10 minutes</p>
                </div>

                <div class="warning">
                  <strong>⚠️ Important:</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                </div>

                <p>Best regards,<br>The Team</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
          </html>
        `;
                break;

            default:
                subject = "Your OTP Code";
                htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hello ${name},</h2>
            <p>Your OTP code is: <strong style="font-size: 24px; color: #667eea;">${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `;
        }

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Your App"}" <${
                process.env.EMAIL_USER
            }>`,
            to: email,
            subject: subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};

/**
 * Send welcome email after verification
 * @param {String} email - Recipient email
 * @param {String} name - User name
 */
const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Your App"}" <${
                process.env.EMAIL_USER
            }>`,
            to: email,
            subject: "Welcome! Your Account is Verified",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome Aboard!</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <p>Hello <strong>${name}</strong>,</p>
              <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
              <p>You can now access all features and start using our services.</p>
              <p>Thank you for choosing us!</p>
              <p>Best regards,<br>The Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Welcome email sent successfully");
    } catch (error) {
        console.error("Error sending welcome email:", error);
        // Don't throw error for welcome email failure
    }
};

/**
 * Send Service OTP email to customer
 * @param {String} email - Customer email
 * @param {String} otp - OTP code
 * @param {String} customerName - Customer name
 * @param {String} workerName - Worker name
 */
const sendServiceOTPEmail = async (email, otp, customerName, workerName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Service App"}" <${
                process.env.EMAIL_USER
            }>`,
            to: email,
            subject: "Service OTP - Your Professional is Here",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px dashed #10b981; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 8px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        .info-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 12px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🛠️ Service Professional Arrived</h1>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${customerName}</strong>,</p>
                            <p>Your service professional <strong>${workerName}</strong> has arrived and is ready to start the service.</p>
                            
                            <div class="info-box">
                                <strong>Please share this OTP with the professional to begin the service:</strong>
                            </div>
                            
                            <div class="otp-box">
                                <p style="margin: 0; color: #666;">Service Start OTP</p>
                                <div class="otp-code">${otp}</div>
                                <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">Valid for 10 minutes</p>
                            </div>

                            <div class="info-box">
                                <strong>Service Details:</strong><br>
                                • Do not share this OTP with anyone else<br>
                                • The professional will enter this OTP to start the service<br>
                                • This ensures your service starts only with your consent
                            </div>

                            <p>If you didn't request this service or have any concerns, please contact us immediately.</p>
                            
                            <p>Best regards,<br>The Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Service OTP email sent successfully:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending service OTP email:", error);
        throw new Error("Failed to send service OTP email");
    }
};

/**
 * Send Cash Payment OTP email to worker
 * @param {String} email - Worker email
 * @param {String} otp - OTP code
 * @param {String} workerName - Worker name
 * @param {String} customerName - Customer name
 * @param {Number} amount - Payment amount
 * @param {String} bookingId - Booking ID
 */
const sendCashPaymentOTPEmail = async (
    email,
    otp,
    workerName,
    customerName,
    amount,
    bookingId
) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Workjunction"}" <${
                process.env.EMAIL_USER
            }>`,
            to: email,
            subject: "💰 Cash Payment OTP - Verify Payment Received",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px dashed #f59e0b; padding: 25px; text-align: center; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                        .otp-code { font-size: 36px; font-weight: bold; color: #d97706; letter-spacing: 8px; font-family: 'Courier New', monospace; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .payment-details { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
                        .detail-row:last-child { border-bottom: none; }
                        .detail-label { color: #6b7280; font-weight: 500; }
                        .detail-value { color: #1f2937; font-weight: 600; }
                        .amount-highlight { font-size: 24px; color: #065f46; font-weight: bold; }
                        .steps { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
                        .step-number { background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 12px; flex-shrink: 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>💰 Cash Payment Received</h1>
                            <p>Verify your cash payment with OTP</p>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${workerName}</strong>,</p>
                            <p>Great news! <strong>${customerName}</strong> has made a cash payment for your service.</p>
                            
                            <div class="payment-details">
                                <div class="detail-row">
                                    <span class="detail-label">Customer Name:</span>
                                    <span class="detail-value">${customerName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Booking ID:</span>
                                    <span class="detail-value">${bookingId}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Payment Amount:</span>
                                    <span class="detail-value amount-highlight">₹${amount}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Payment Method:</span>
                                    <span class="detail-value">Cash</span>
                                </div>
                            </div>

                            <div class="info-box">
                                <strong>📋 Next Steps:</strong> Please share this OTP with the customer to verify the payment.
                            </div>
                            
                            <div class="otp-box">
                                <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 16px;">Cash Payment Verification OTP</p>
                                <div class="otp-code">${otp}</div>
                                <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 14px;">
                                    ⏰ Valid for 30 minutes
                                </p>
                            </div>

                            <div class="steps">
                                <h3 style="margin-top: 0; color: #065f46;">How to complete payment verification:</h3>
                                
                                <div class="step">
                                    <div class="step-number">1</div>
                                    <div>
                                        <strong>Receive Cash</strong><br>
                                        Accept ₹${amount} cash payment from the customer
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">2</div>
                                    <div>
                                        <strong>Share OTP</strong><br>
                                        Provide this OTP code to the customer
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">3</div>
                                    <div>
                                        <strong>Customer Verification</strong><br>
                                        Customer will enter this OTP in the app
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">4</div>
                                    <div>
                                        <strong>Payment Confirmed</strong><br>
                                        Payment status will update to "Completed"
                                    </div>
                                </div>
                            </div>

                            <div class="info-box">
                                <strong>⚠️ Important Security Notes:</strong><br>
                                • Only share this OTP after receiving the cash payment<br>
                                • Do not share this OTP with anyone else<br>
                                • This OTP ensures secure payment verification<br>
                                • If customer doesn't have the app, you can enter the OTP for them
                            </div>

                            <p style="text-align: center; margin: 25px 0 15px 0;">
                                <strong>Need help?</strong> Contact our support team if you face any issues.
                            </p>
                            
                            <p>Best regards,<br><strong>The Workjunction Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>© ${new Date().getFullYear()} Workjunction. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(
            "Cash payment OTP email sent successfully to worker:",
            info.messageId
        );
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending cash payment OTP email to worker:", error);
        throw new Error("Failed to send cash payment OTP email");
    }
};

/**
 * Send Cash Payment Confirmation email to worker
 * @param {String} email - Worker email
 * @param {String} workerName - Worker name
 * @param {String} customerName - Customer name
 * @param {Number} amount - Payment amount
 * @param {String} bookingId - Booking ID
 * @param {String} transactionId - Transaction ID
 */
const sendCashPaymentConfirmationEmail = async (
    email,
    workerName,
    customerName,
    amount,
    bookingId,
    transactionId
) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Workjunction"}" <${
                process.env.EMAIL_USER
            }>`,
            to: email,
            subject: "✅ Cash Payment Verified Successfully",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .success-icon { text-align: center; font-size: 80px; margin: 20px 0; }
                        .payment-details { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
                        .detail-row:last-child { border-bottom: none; }
                        .detail-label { color: #6b7280; font-weight: 500; }
                        .detail-value { color: #1f2937; font-weight: 600; }
                        .amount-highlight { font-size: 24px; color: #065f46; font-weight: bold; }
                        .next-steps { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Payment Verified Successfully</h1>
                            <p>Cash payment has been confirmed</p>
                        </div>
                        <div class="content">
                            <div class="success-icon">💰</div>
                            
                            <p>Hello <strong>${workerName}</strong>,</p>
                            <p>Great news! The cash payment from <strong>${customerName}</strong> has been successfully verified and confirmed in our system.</p>
                            
                            <div class="payment-details">
                                <div class="detail-row">
                                    <span class="detail-label">Customer Name:</span>
                                    <span class="detail-value">${customerName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Booking ID:</span>
                                    <span class="detail-value">${bookingId}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Transaction ID:</span>
                                    <span class="detail-value">${transactionId}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Amount Received:</span>
                                    <span class="detail-value amount-highlight">₹${amount}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Payment Method:</span>
                                    <span class="detail-value">Cash</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value" style="color: #059669;">✅ Verified & Confirmed</span>
                                </div>
                            </div>

                            <div class="next-steps">
                                <h3 style="margin-top: 0; color: #065f46;">What happens next?</h3>
                                <p><strong>💰 Earnings:</strong> ₹${amount} has been added to your earnings and will be processed for payout according to our payment schedule.</p>
                                <p><strong>📊 Dashboard:</strong> You can view this payment in your earnings dashboard.</p>
                                <p><strong>⭐ Review:</strong> The customer can now leave a review for your service.</p>
                            </div>

                            <div style="text-align: center; margin: 25px 0;">
                                <p><strong>Thank you for providing excellent service! 🎉</strong></p>
                            </div>
                            
                            <p>Best regards,<br><strong>The Workjunction Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>© ${new Date().getFullYear()} Workjunction. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(
            "Cash payment confirmation email sent successfully to worker:",
            info.messageId
        );
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(
            "Error sending cash payment confirmation email to worker:",
            error
        );
        throw new Error("Failed to send cash payment confirmation email");
    }
};

/**
 * Send Booking Request Notification email to worker
 * @param {String} email - Worker email
 * @param {String} workerName - Worker name
 * @param {String} customerName - Customer name
 * @param {String} serviceName - Service name
 * @param {String} bookingDate - Booking date
 * @param {String} bookingTime - Booking time
 * @param {Number} price - Service price
 * @param {String} bookingId - Booking ID
 * @param {String} customerPhone - Customer phone number
 * @param {Object} address - Customer address
 */
const sendBookingRequestEmail = async (
    email,
    workerName,
    customerName,
    serviceName,
    bookingDate,
    bookingTime,
    price,
    bookingId,
    customerPhone,
    address = {}
) => {
    try {
        const transporter = createTransporter();

        // Format the booking date
        const formattedDate = new Date(bookingDate).toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );

        // Format address
        const formattedAddress = address
            ? `${address.street || ""}${
                  address.area ? `, ${address.area}` : ""
              }${address.city ? `, ${address.city}` : ""}${
                  address.pincode ? ` - ${address.pincode}` : ""
              }`.replace(/^,\s*/, "")
            : "Address not provided";

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Workjunction"}" <${
                process.env.EMAIL_USER
            }>`,
            to: email,
            subject: `📅 New Booking Request - ${serviceName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 0; 
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            padding: 20px; 
                        }
                        .header { 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 30px; 
                            text-align: center; 
                            border-radius: 10px 10px 0 0; 
                        }
                        .content { 
                            background: #f9f9f9; 
                            padding: 30px; 
                            border-radius: 0 0 10px 10px; 
                        }
                        .booking-card { 
                            background: white; 
                            border: 2px solid #e5e7eb; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                        }
                        .detail-row { 
                            display: flex; 
                            justify-content: space-between; 
                            padding: 12px 0; 
                            border-bottom: 1px solid #f3f4f6; 
                        }
                        .detail-row:last-child { 
                            border-bottom: none; 
                        }
                        .detail-label { 
                            color: #6b7280; 
                            font-weight: 500; 
                            min-width: 150px; 
                        }
                        .detail-value { 
                            color: #1f2937; 
                            font-weight: 600; 
                            text-align: right; 
                        }
                        .price-highlight { 
                            font-size: 24px; 
                            color: #059669; 
                            font-weight: bold; 
                        }
                        .action-buttons { 
                            text-align: center; 
                            margin: 30px 0; 
                        }
                        .btn { 
                            display: inline-block; 
                            padding: 12px 30px; 
                            margin: 0 10px; 
                            border-radius: 6px; 
                            text-decoration: none; 
                            font-weight: 600; 
                            transition: all 0.3s ease; 
                        }
                        .btn-primary { 
                            background: #10b981; 
                            color: white; 
                        }
                        .btn-secondary { 
                            background: #6b7280; 
                            color: white; 
                        }
                        .btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        }
                        .urgent-badge { 
                            background: #fef3c7; 
                            color: #d97706; 
                            padding: 8px 16px; 
                            border-radius: 20px; 
                            font-size: 14px; 
                            font-weight: 600; 
                            display: inline-block; 
                            margin-bottom: 15px; 
                        }
                        .customer-info { 
                            background: #eff6ff; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                        }
                        .footer { 
                            text-align: center; 
                            margin-top: 20px; 
                            color: #666; 
                            font-size: 12px; 
                        }
                        .status-pending { 
                            background: #fef3c7; 
                            color: #d97706; 
                            padding: 4px 12px; 
                            border-radius: 12px; 
                            font-size: 12px; 
                            font-weight: 600; 
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📅 New Booking Request!</h1>
                            <p>You have a new service request waiting for your response</p>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${workerName}</strong>,</p>
                            <p>Great news! You have received a new booking request for your service.</p>

                            <div class="urgent-badge">
                                ⏰ Please respond within 2 hours
                            </div>

                            <div class="booking-card">
                                <h3 style="margin-top: 0; color: #667eea; text-align: center;">
                                    ${serviceName}
                                </h3>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Booking ID:</span>
                                    <span class="detail-value">${bookingId}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Service Date:</span>
                                    <span class="detail-value">${formattedDate}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Service Time:</span>
                                    <span class="detail-value">${bookingTime}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Service Price:</span>
                                    <span class="detail-value price-highlight">₹${price}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value">
                                        <span class="status-pending">Pending Your Response</span>
                                    </span>
                                </div>
                            </div>

                            <div class="customer-info">
                                <h4 style="margin-top: 0; color: #374151;">👤 Customer Information</h4>
                                <div class="detail-row">
                                    <span class="detail-label">Customer Name:</span>
                                    <span class="detail-value">${customerName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Phone Number:</span>
                                    <span class="detail-value">
                                        <a href="tel:${customerPhone}" style="color: #059669; text-decoration: none;">
                                            ${customerPhone}
                                        </a>
                                    </span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Service Address:</span>
                                    <span class="detail-value" style="text-align: left;">
                                        ${formattedAddress}
                                    </span>
                                </div>
                            </div>

                            <div class="action-buttons">
                                <p style="color: #6b7280; margin-bottom: 20px;">
                                    Please log in to your account to accept or decline this booking request.
                                </p>
                                
                                <a href="${
                                    process.env.WORKER_APP_URL ||
                                    "https://yourapp.com/worker"
                                }/bookings" class="btn btn-primary">
                                    ✅ View & Respond to Booking
                                </a>
                            </div>

                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="margin-top: 0; color: #d97706;">💡 Important Notes:</h4>
                                <ul style="margin-bottom: 0; color: #92400e;">
                                    <li>Respond within 2 hours to maintain your response rate</li>
                                    <li>Contact the customer if you need more information</li>
                                    <li>Check your schedule before accepting the booking</li>
                                    <li>Decline only if you're genuinely unavailable</li>
                                </ul>
                            </div>

                            <p style="text-align: center; color: #6b7280; font-style: italic;">
                                "Your prompt response helps build trust with customers and improves your booking rate."
                            </p>
                            
                            <p>Best regards,<br><strong>The Workjunction Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>© ${new Date().getFullYear()} Workjunction. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(
            "Booking request email sent successfully to worker:",
            info.messageId
        );
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending booking request email to worker:", error);
        throw new Error("Failed to send booking request email");
    }
};

/**
 * Send Booking Accepted Notification email to customer
 * @param {String} email - Customer email
 * @param {String} customerName - Customer name
 * @param {String} workerName - Worker name
 * @param {String} serviceName - Service name
 * @param {String} bookingDate - Booking date
 * @param {String} bookingTime - Booking time
 * @param {Number} price - Service price
 * @param {String} bookingId - Booking ID
 * @param {String} workerPhone - Worker phone number
 * @param {Object} workerDetails - Worker details
 */
const sendBookingAcceptedEmail = async (
    email,
    customerName,
    workerName,
    serviceName,
    bookingDate,
    bookingTime,
    price,
    bookingId,
    workerPhone,
    workerDetails = {}
) => {
    try {
        const transporter = createTransporter();

        // Format the booking date
        const formattedDate = new Date(bookingDate).toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );

        // Format worker experience and rating
        const experience = workerDetails.experience || "Not specified";
        const rating = workerDetails.rating || "New worker";
        const completedJobs = workerDetails.completedJobs || 0;

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Workjunction"}" <${
                process.env.EMAIL_USER
            }>`,
            to: email,
            subject: `✅ Booking Confirmed! ${workerName} will serve you`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 0; 
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            padding: 20px; 
                        }
                        .header { 
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                            color: white; 
                            padding: 30px; 
                            text-align: center; 
                            border-radius: 10px 10px 0 0; 
                        }
                        .content { 
                            background: #f9f9f9; 
                            padding: 30px; 
                            border-radius: 0 0 10px 10px; 
                        }
                        .confirmation-card { 
                            background: white; 
                            border: 2px solid #10b981; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            text-align: center; 
                        }
                        .detail-row { 
                            display: flex; 
                            justify-content: space-between; 
                            padding: 12px 0; 
                            border-bottom: 1px solid #f3f4f6; 
                        }
                        .detail-row:last-child { 
                            border-bottom: none; 
                        }
                        .detail-label { 
                            color: #6b7280; 
                            font-weight: 500; 
                            min-width: 150px; 
                        }
                        .detail-value { 
                            color: #1f2937; 
                            font-weight: 600; 
                            text-align: right; 
                        }
                        .price-highlight { 
                            font-size: 24px; 
                            color: #059669; 
                            font-weight: bold; 
                        }
                        .worker-card { 
                            background: #eff6ff; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                        }
                        .worker-stats { 
                            display: flex; 
                            justify-content: space-around; 
                            margin-top: 15px; 
                            text-align: center; 
                        }
                        .stat-item { 
                            padding: 10px; 
                        }
                        .stat-value { 
                            font-size: 18px; 
                            font-weight: bold; 
                            color: #1e40af; 
                        }
                        .stat-label { 
                            font-size: 12px; 
                            color: #6b7280; 
                        }
                        .action-buttons { 
                            text-align: center; 
                            margin: 30px 0; 
                        }
                        .btn { 
                            display: inline-block; 
                            padding: 12px 30px; 
                            margin: 0 10px; 
                            border-radius: 6px; 
                            text-decoration: none; 
                            font-weight: 600; 
                            transition: all 0.3s ease; 
                        }
                        .btn-primary { 
                            background: #10b981; 
                            color: white; 
                        }
                        .btn-secondary { 
                            background: #3b82f6; 
                            color: white; 
                        }
                        .btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        }
                        .next-steps { 
                            background: #f0fdf4; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                        }
                        .step { 
                            display: flex; 
                            align-items: flex-start; 
                            margin-bottom: 15px; 
                        }
                        .step-number { 
                            background: #10b981; 
                            color: white; 
                            width: 24px; 
                            height: 24px; 
                            border-radius: 50%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            font-size: 14px; 
                            font-weight: bold; 
                            margin-right: 12px; 
                            flex-shrink: 0; 
                        }
                        .footer { 
                            text-align: center; 
                            margin-top: 20px; 
                            color: #666; 
                            font-size: 12px; 
                        }
                        .success-icon { 
                            font-size: 60px; 
                            margin-bottom: 15px; 
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Booking Confirmed!</h1>
                            <p>Your service professional is ready to serve you</p>
                        </div>
                        <div class="content">
                            <div class="confirmation-card">
                                <div class="success-icon">🎉</div>
                                <h2 style="margin: 0; color: #059669;">Booking Accepted!</h2>
                                <p style="font-size: 18px; color: #6b7280; margin: 10px 0;">
                                    <strong>${workerName}</strong> has accepted your booking request
                                </p>
                            </div>

                            <p>Hello <strong>${customerName}</strong>,</p>
                            <p>Great news! Your booking request has been accepted. Your service professional is looking forward to serving you.</p>

                            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #374151; text-align: center;">
                                    📋 Booking Details
                                </h3>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Service:</span>
                                    <span class="detail-value">${serviceName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Date:</span>
                                    <span class="detail-value">${formattedDate}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Time:</span>
                                    <span class="detail-value">${bookingTime}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Booking ID:</span>
                                    <span class="detail-value">${bookingId}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Amount:</span>
                                    <span class="detail-value price-highlight">₹${price}</span>
                                </div>
                            </div>

                            <div class="worker-card">
                                <h4 style="margin-top: 0; color: #1e40af; text-align: center;">
                                    👨‍🔧 Your Service Professional
                                </h4>
                                <div class="detail-row">
                                    <span class="detail-label">Name:</span>
                                    <span class="detail-value">${workerName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Contact:</span>
                                    <span class="detail-value">
                                        <a href="tel:${workerPhone}" style="color: #059669; text-decoration: none;">
                                            ${workerPhone}
                                        </a>
                                    </span>
                                </div>
                                
                                <div class="worker-stats">
                                    <div class="stat-item">
                                        <div class="stat-value">${experience}</div>
                                        <div class="stat-label">Experience</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value">⭐ ${rating}</div>
                                        <div class="stat-label">Rating</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value">${completedJobs}</div>
                                        <div class="stat-label">Jobs Done</div>
                                    </div>
                                </div>
                            </div>

                            <div class="next-steps">
                                <h4 style="margin-top: 0; color: #065f46;">📝 What to Expect Next</h4>
                                
                                <div class="step">
                                    <div class="step-number">1</div>
                                    <div>
                                        <strong>Service Day Preparation</strong><br>
                                        Ensure the service area is accessible and ready
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">2</div>
                                    <div>
                                        <strong>Professional Arrival</strong><br>
                                        ${workerName} will arrive at the scheduled time
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">3</div>
                                    <div>
                                        <strong>Service Execution</strong><br>
                                        The professional will perform the service efficiently
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">4</div>
                                    <div>
                                        <strong>Quality Check & Payment</strong><br>
                                        Verify service quality and complete payment
                                    </div>
                                </div>
                            </div>

                            <div class="action-buttons">
                                <p style="color: #6b7280; margin-bottom: 20px;">
                                    Need to make changes or have questions?
                                </p>
                                
                                <a href="${
                                    process.env.CUSTOMER_APP_URL ||
                                    "https://yourapp.com/customer"
                                }/bookings/${bookingId}" class="btn btn-primary">
                                    📱 View Booking Details
                                </a>
                                <a href="tel:${workerPhone}" class="btn btn-secondary">
                                    📞 Contact Professional
                                </a>
                            </div>

                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="margin-top: 0; color: #d97706;">💡 Important Reminders:</h4>
                                <ul style="margin-bottom: 0; color: #92400e;">
                                    <li>Keep your phone accessible for any communication</li>
                                    <li>Have the service area ready before arrival</li>
                                    <li>Discuss any specific requirements with the professional</li>
                                    <li>Payment will be collected after service completion</li>
                                </ul>
                            </div>

                            <p style="text-align: center; color: #059669; font-style: italic; font-weight: 600;">
                                "We're committed to ensuring you have a great service experience!"
                            </p>
                            
                            <p>Best regards,<br><strong>The Workjunction Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>© ${new Date().getFullYear()} Workjunction. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(
            "Booking accepted email sent successfully to customer:",
            info.messageId
        );
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(
            "Error sending booking accepted email to customer:",
            error
        );
        throw new Error("Failed to send booking accepted email");
    }
};

export {
    sendOTPEmail,
    sendWelcomeEmail,
    sendServiceOTPEmail,
    sendCashPaymentOTPEmail,
    sendCashPaymentConfirmationEmail,
    sendBookingRequestEmail,
    sendBookingAcceptedEmail,
};
