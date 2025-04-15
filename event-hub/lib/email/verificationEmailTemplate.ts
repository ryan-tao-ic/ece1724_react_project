export function verificationEmailTemplate(verificationLink: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
      <p style="color: #666; line-height: 1.6;">Thank you for registering with Event Hub! Please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email Address
        </a>
      </div>

      <p style="color: #666; line-height: 1.6;">If you did not create an account, please ignore this email.</p>
      <p style="color: #666; line-height: 1.6;">This link will expire in 24 hours.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          If the button above doesn't work, you can copy and paste this link into your browser:<br>
          <span style="word-break: break-all;">${verificationLink}</span>
        </p>
      </div>
    </div>
  `;
} 