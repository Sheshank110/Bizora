import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter = null;

// Initialize transporter if SMTP config is present
if (env.email.smtp.host && env.email.smtp.auth.user) {
  transporter = nodemailer.createTransport({
    host: env.email.smtp.host,
    port: env.email.smtp.port,
    auth: {
      user: env.email.smtp.auth.user,
      pass: env.email.smtp.auth.pass,
    },
  });
}

/**
 * Universal send email helper with robust dev console fallback
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (transporter && !env.isDev) {
    try {
      return await transporter.sendMail({
        from: env.email.from,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error('[EmailService] Failed to send via SMTP, falling back to log:', error.message);
    }
  }

  // Development / fallback logger
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📧 [EMAIL NOTIFICATION] - TO: ${to}`);
  console.log(`📌 SUBJECT: ${subject}`);
  console.log('───────────────────────────────────────────────────────');
  console.log(text || html);
  console.log('═══════════════════════════════════════════════════════\n');

  return { messageId: `mock-${Date.now()}` };
};

/**
 * Send Email Verification link
 */
export const sendVerificationEmail = async ({ email, token, firstName }) => {
  const verifyUrl = `${env.clientUrl}/verify-email?token=${token}`;
  const subject = 'Verify your Bizora Account';
  const text = `Hello ${firstName},\n\nPlease verify your Bizora account by clicking this link:\n${verifyUrl}\n\nThis link is valid for 24 hours.\n\nIf you did not create an account, please disregard this email.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
      <h2 style="color: #6366f1;">Welcome to Bizora, ${firstName}!</h2>
      <p>Thank you for signing up. Please verify your email address to get full access to your workspace.</p>
      <div style="margin: 32px 0;">
        <a href="${verifyUrl}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:<br/><code>${verifyUrl}</code></p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">This link expires in 24 hours.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send Password Reset link
 */
export const sendPasswordResetEmail = async ({ email, token, firstName }) => {
  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
  const subject = 'Reset your Bizora Password';
  const text = `Hello ${firstName},\n\nWe received a request to reset your Bizora password. Click the link below to set a new password:\n${resetUrl}\n\nThis link is valid for 60 minutes.\n\nIf you did not request a password reset, please ignore this email.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
      <h2 style="color: #6366f1;">Reset your Bizora password</h2>
      <p>Hello ${firstName}, we received a request to reset your password. Click the button below to proceed:</p>
      <div style="margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:<br/><code>${resetUrl}</code></p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">This link expires in 60 minutes. If you did not make this request, you can safely ignore this email.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send Workspace Invitation email
 */
export const sendWorkspaceInviteEmail = async ({ email, inviterName, businessName, inviteToken, role }) => {
  const inviteUrl = `${env.clientUrl}/accept-invite?token=${inviteToken}`;
  const subject = `You've been invited to join ${businessName} on Bizora`;
  const text = `Hello,\n\n${inviterName} has invited you to join ${businessName} as a ${role} on Bizora.\n\nClick the link below to accept the invitation:\n${inviteUrl}\n\nThis link is valid for 7 days.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
      <h2 style="color: #6366f1;">Join ${businessName} on Bizora</h2>
      <p><strong>${inviterName}</strong> has invited you to collaborate as a <strong>${role}</strong>.</p>
      <div style="margin: 32px 0;">
        <a href="${inviteUrl}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:<br/><code>${inviteUrl}</code></p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">This invitation expires in 7 days.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};
