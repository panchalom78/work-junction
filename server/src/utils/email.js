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

export { sendOTPEmail, sendWelcomeEmail, sendServiceOTPEmail };
