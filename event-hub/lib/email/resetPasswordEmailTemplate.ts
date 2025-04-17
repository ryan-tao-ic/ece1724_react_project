export function resetPasswordEmailTemplate(resetLink: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
      <p style="color: #666; line-height: 1.6;">We received a request to reset your password for your Event Hub account. Click the button below to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reset Password
        </a>
      </div>

      <p style="color: #666; line-height: 1.6;">If you did not request a password reset, please ignore this email.</p>
      <p style="color: #666; line-height: 1.6;">This link will expire in 1 hour.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          If the button above doesn't work, you can copy and paste this link into your browser:<br>
          <span style="word-break: break-all;">${resetLink}</span>
        </p>
      </div>
    </div>
  `;
} 