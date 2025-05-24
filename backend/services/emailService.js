

const nodemailer = require('nodemailer');
const { generateOtpEmailTemplate } = require('./emailTemplates'); // Email template

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email (and simulate SMS if type === 'sms')
const sendOTP = async (to, otp, type = 'email', email = null) => {
  // Set up email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Generate HTML template for OTP
  const htmlTemplate = generateOtpEmailTemplate(to, otp); // 'to' is email address

  // Prepare email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: type === 'sms' && email ? email : to, // use provided email for sms fallback
    subject: 'Your OTP Code',
    html: htmlTemplate,
  };

  // If SMS (simulate), also send email if available
  if (type === 'sms') {
    console.log(`📲 SMS OTP ${otp} sent to ${to}`);
    if (email) {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Email OTP ${otp} sent to ${email}`);
    }
    return;
  }

  // Email-only case
  await transporter.sendMail(mailOptions);
  console.log(`📧 Email OTP ${otp} sent to ${to}`);
};

module.exports = { generateOTP, sendOTP };
