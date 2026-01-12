import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type EmailLog,
  type CreateEmailLogInput,
  isEmailLogComplete,
} from '@tdc/schemas';
import { getFirebaseAuth } from '../config';
import { emailLogRepository } from '../repositories/email-log.repository';
import { emailTemplateService } from './email-template.service';
import { settingsService } from './settings.service';

/**
 * Email Service Error Codes
 * Requirements: 8.1, 8.4, 8.5
 */
export const EmailServiceErrorCode = {
  GMAIL_NOT_CONNECTED: 'GMAIL_NOT_CONNECTED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  INVALID_RECIPIENT: 'INVALID_RECIPIENT',
  LOG_CREATE_FAILED: 'LOG_CREATE_FAILED',
} as const;

/**
 * Email recipient interface
 */
export interface EmailRecipient {
  email: string;
  name: string;
  data: Record<string, string>;
}

/**
 * Send email result
 */
export interface SendEmailResult {
  success: boolean;
  logId: string | null;
  error?: string;
}

/**
 * Bulk email result
 * Requirements: 8.1
 */
export interface BulkEmailResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
  logs: EmailLog[];
}

/**
 * Email Service
 * Handles sending emails via Gmail API and logging
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
class EmailService {
  /**
   * Check if Gmail is connected before sending
   * Requirements: 8.5
   * 
   * @returns Result indicating if Gmail is connected
   */
  async checkGmailConnection(): Promise<Result<boolean>> {
    const settingsResult = await settingsService.getEmailSettings();
    if (!settingsResult.success) {
      return failure(settingsResult.error);
    }

    if (!settingsResult.data.gmailConnected) {
      return failure(
        new AppError(
          ErrorCode.GMAIL_NOT_CONNECTED,
          'Gmail chưa được kết nối. Vui lòng kết nối Gmail trước khi gửi email.',
          { code: EmailServiceErrorCode.GMAIL_NOT_CONNECTED }
        )
      );
    }

    return success(true);
  }

  /**
   * Send a single email using a template
   * Requirements: 8.1, 8.2, 8.3, 8.4
   * 
   * @param to - Recipient email address
   * @param recipientName - Recipient name
   * @param templateId - Email template ID
   * @param data - Data to replace placeholders
   * @returns Result with send status
   */
  async sendEmail(
    to: string,
    recipientName: string,
    templateId: string,
    data: Record<string, string>
  ): Promise<Result<SendEmailResult>> {
    // Check Gmail connection first (Requirements: 8.5)
    const connectionCheck = await this.checkGmailConnection();
    if (!connectionCheck.success) {
      return failure(connectionCheck.error);
    }

    // Get current user for logging
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return failure(
        new AppError(ErrorCode.AUTH_REQUIRED, 'Vui lòng đăng nhập để gửi email')
      );
    }

    // Get and render template (Requirements: 8.2)
    const templateResult = await emailTemplateService.getTemplate(templateId);
    if (!templateResult.success) {
      return failure(
        new AppError(
          ErrorCode.EMAIL_TEMPLATE_NOT_FOUND,
          'Không tìm thấy template email',
          { code: EmailServiceErrorCode.TEMPLATE_NOT_FOUND, templateId }
        )
      );
    }

    const template = templateResult.data;

    // Render template with data
    const renderResult = await emailTemplateService.renderTemplate(templateId, data);
    if (!renderResult.success) {
      return failure(renderResult.error);
    }

    const { subject, body } = renderResult.data;

    // Attempt to send email via Gmail API (placeholder implementation)
    const sendResult = await this.sendViaGmailApi(to, subject, body);

    // Create email log (Requirements: 8.3)
    const logInput: CreateEmailLogInput = {
      recipientEmail: to,
      recipientName,
      templateId,
      templateName: template.name,
      subject,
      sentAt: new Date(),
      sentBy: currentUser.uid,
      status: sendResult.success ? 'sent' : 'failed',
      errorMessage: sendResult.error ?? null,
    };

    const logResult = await emailLogRepository.create(logInput);
    
    if (!logResult.success) {
      console.error('[EmailService] Failed to create email log:', logResult.error);
    }

    // Return result based on send status
    if (!sendResult.success) {
      return failure(
        new AppError(
          ErrorCode.EMAIL_SEND_FAILED,
          sendResult.error ?? 'Gửi email thất bại',
          { 
            code: EmailServiceErrorCode.EMAIL_SEND_FAILED,
            recipient: to,
            logId: logResult.success ? logResult.data.id : null,
          }
        )
      );
    }

    return success({
      success: true,
      logId: logResult.success ? logResult.data.id : null,
    });
  }

  /**
   * Send bulk emails to multiple recipients
   * Requirements: 8.1
   * 
   * @param recipients - Array of recipients with their data
   * @param templateId - Email template ID
   * @returns Result with bulk send results
   */
  async sendBulkEmail(
    recipients: EmailRecipient[],
    templateId: string
  ): Promise<Result<BulkEmailResult>> {
    // Check Gmail connection first
    const connectionCheck = await this.checkGmailConnection();
    if (!connectionCheck.success) {
      return failure(connectionCheck.error);
    }

    // Verify template exists
    const templateResult = await emailTemplateService.getTemplate(templateId);
    if (!templateResult.success) {
      return failure(templateResult.error);
    }

    const results: BulkEmailResult = {
      total: recipients.length,
      success: 0,
      failed: 0,
      errors: [],
      logs: [],
    };

    // Process each recipient
    for (const recipient of recipients) {
      const sendResult = await this.sendEmail(
        recipient.email,
        recipient.name,
        templateId,
        recipient.data
      );

      if (sendResult.success) {
        results.success++;
        // Fetch the log if we have a logId
        if (sendResult.data.logId) {
          const logResult = await emailLogRepository.findById(sendResult.data.logId);
          if (logResult.success) {
            results.logs.push(logResult.data);
          }
        }
      } else {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: sendResult.error.message,
        });
      }
    }

    return success(results);
  }

  /**
   * Send test email to verify Gmail connection
   * Requirements: 2.5
   * 
   * @returns Result indicating test email status
   */
  async sendTestEmail(): Promise<Result<SendEmailResult>> {
    // Check Gmail connection
    const settingsResult = await settingsService.getEmailSettings();
    if (!settingsResult.success) {
      return failure(settingsResult.error);
    }

    const settings = settingsResult.data;
    if (!settings.gmailConnected || !settings.gmailEmail) {
      return failure(
        new AppError(
          ErrorCode.GMAIL_NOT_CONNECTED,
          'Gmail chưa được kết nối',
          { code: EmailServiceErrorCode.GMAIL_NOT_CONNECTED }
        )
      );
    }

    // Get current user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return failure(
        new AppError(ErrorCode.AUTH_REQUIRED, 'Vui lòng đăng nhập')
      );
    }

    // Send test email to the connected Gmail address
    const testSubject = '[TDC] Test Email - Kết nối Gmail thành công';
    const testBody = `
      <h2>Test Email</h2>
      <p>Đây là email test để xác nhận kết nối Gmail đã hoạt động.</p>
      <p>Thời gian: ${new Date().toLocaleString('vi-VN')}</p>
      <p>Nếu bạn nhận được email này, kết nối Gmail đã thành công!</p>
    `;

    const sendResult = await this.sendViaGmailApi(
      settings.gmailEmail,
      testSubject,
      testBody
    );

    // Log the test email
    const logInput: CreateEmailLogInput = {
      recipientEmail: settings.gmailEmail,
      recipientName: 'Test Email',
      templateId: 'test',
      templateName: 'Test Email',
      subject: testSubject,
      sentAt: new Date(),
      sentBy: currentUser.uid,
      status: sendResult.success ? 'sent' : 'failed',
      errorMessage: sendResult.error ?? null,
    };

    const logResult = await emailLogRepository.create(logInput);

    if (!sendResult.success) {
      return failure(
        new AppError(
          ErrorCode.EMAIL_SEND_FAILED,
          sendResult.error ?? 'Gửi test email thất bại',
          { code: EmailServiceErrorCode.EMAIL_SEND_FAILED }
        )
      );
    }

    return success({
      success: true,
      logId: logResult.success ? logResult.data.id : null,
    });
  }

  /**
   * Get email logs for a recipient
   * Requirements: 8.3
   * 
   * @param email - Recipient email
   * @returns Result with email logs
   */
  async getEmailLogs(email?: string): Promise<Result<EmailLog[]>> {
    if (email) {
      return emailLogRepository.findByRecipient(email);
    }
    return emailLogRepository.findAll();
  }

  /**
   * Placeholder for Gmail API integration
   * Requirements: 8.1
   * 
   * Note: This is a placeholder implementation.
   * Actual Gmail API integration requires:
   * 1. OAuth 2.0 token management
   * 2. Gmail API client setup
   * 3. Server-side implementation for security
   * 
   * @param to - Recipient email
   * @param subject - Email subject
   * @param body - Email body (HTML)
   * @returns Send result
   */
  private async sendViaGmailApi(
    to: string,
    subject: string,
    body: string
  ): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement actual Gmail API integration
    // This requires server-side implementation with:
    // 1. Google OAuth 2.0 credentials
    // 2. Gmail API client
    // 3. Token refresh handling
    
    console.log('[EmailService] Sending email via Gmail API (placeholder)');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body length: ${body.length} chars`);

    // For now, simulate successful send
    // In production, this would call the actual Gmail API
    return { success: true };
  }
}

// Singleton export
export const emailService = new EmailService();

/**
 * Helper function to create email data from student info
 * Requirements: 4.2
 * 
 * @param student - Student data
 * @param additionalData - Additional placeholder data
 * @returns Data object for placeholder replacement
 */
export function createEmailData(
  student: { name: string; email: string },
  additionalData?: Record<string, string>
): Record<string, string> {
  const loginUrl = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.thedesigncouncil.com';
  const timestamp = new Date().toLocaleString('vi-VN');

  return {
    name: student.name,
    email: student.email,
    login_url: loginUrl,
    timestamp,
    ...additionalData,
  };
}

/**
 * Validates email log has all required fields
 * Property 10: Email log completeness
 * 
 * @param log - Email log to validate
 * @returns true if log is complete
 */
export function validateEmailLogCompleteness(log: EmailLog): boolean {
  return isEmailLogComplete(log);
}
