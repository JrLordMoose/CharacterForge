// This is a placeholder email service that logs emails instead of sending them
// In a production environment, this would be replaced with a real email service like SendGrid

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In a real environment, this would send an actual email
  // For now, we'll just log the email content
  console.log(`
    =============== EMAIL WOULD BE SENT ===============
    To: ${options.to}
    Subject: ${options.subject}
    
    ${options.text}
    
    HTML version would also be sent.
    =============== END OF EMAIL ===============
  `);
  
  // Simulate a successful send
  return true;
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl: string
): Promise<boolean> {
  const subject = "5D Character Creator - Password Reset";
  
  const text = `
    Hello,
    
    You requested a password reset for your 5D Character Creator account.
    
    Please use the following link to reset your password:
    ${resetUrl}
    
    If you didn't request this reset, please ignore this email.
    
    The 5D Character Creator Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d4af37; border-bottom: 1px solid #eee; padding-bottom: 10px;">Password Reset</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your 5D Character Creator account.</p>
      <p>Please use the following link to reset your password:</p>
      <p>
        <a 
          href="${resetUrl}" 
          style="display: inline-block; background-color: #d4af37; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 4px;"
        >
          Reset Password
        </a>
      </p>
      <p style="color: #777; margin-top: 20px; font-size: 0.9em;">
        If you didn't request this reset, please ignore this email.
      </p>
      <p style="color: #777; font-size: 0.9em;">The 5D Character Creator Team</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
}
