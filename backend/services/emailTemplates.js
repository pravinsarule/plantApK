

const generateOtpEmailTemplate = (email, otp) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>OTP Verification</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
        </head>
        <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
          <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff; background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner); background-repeat: no-repeat; background-size: 800px 452px; background-position: top center; font-size: 14px; color: #434343; text-align: center;">
            <header>
              <table style="width: 100%;">
                <tbody>
                  <tr>
                    <td>
                      <img alt="Multifly Logo" src="https://multiflytravel.com/public/assets/images/logo.png" height="70px" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </header>
      
            <main>
              <div style="margin-top: 70px; padding: 50px 30px; background: #ffffff; border-radius: 30px;">
                <h1 style="font-size: 24px; font-weight: 500; color: #1f1f1f;">Email Verification</h1>
                <p style="font-size: 16px;">Here is your One-Time Password (OTP) for verification:</p>
                <h2 style="color: #0056b3; font-size: 36px; margin: 20px 0;">${otp}</h2>
                <p style="color: #E74C3C; font-weight: bold;">Valid for 5 minutes only</p>
                <p style="margin-top: 20px; font-size: 14px; color: #8c8c8c;">If you didn't request this, please ignore or contact support.</p>
              </div>
            </main>
      
            <footer style="margin-top: 40px; text-align: center; border-top: 1px solid #e6ebf1; padding-top: 20px;">
              <p style="font-size: 16px; font-weight: 600; color: #434343;">Multifly Travels India</p>
              <p style="color: #434343;">Address C 604, Chh.Sambhajinagar, India.</p>
              <div style="margin-top: 16px;">
                <a href="#" style="display: inline-block;">
                  <img width="36px" alt="Facebook" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook" />
                </a>
                <a href="#" style="display: inline-block; margin-left: 8px;">
                  <img width="36px" alt="Instagram" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram" />
                </a>
                <a href="#" style="display: inline-block; margin-left: 8px;">
                  <img width="36px" alt="Twitter" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter" />
                </a>
                <a href="#" style="display: inline-block; margin-left: 8px;">
                  <img width="36px" alt="Youtube" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube" />
                </a>
              </div>
              <p style="margin-top: 16px; color: #434343;">Copyright © 2025 Multifly Travels. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>`;
  };
  
  module.exports = { generateOtpEmailTemplate };
  