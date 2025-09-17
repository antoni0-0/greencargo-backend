import { QueueJob, QueueProcessor } from '../QueueService';
import { EmailService } from '../../services/EmailService';
import { EmailTemplates, EnvioEmailData } from '../../templates/EmailTemplates';

export class EmailProcessor implements QueueProcessor {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async process(job: QueueJob): Promise<void> {
    switch (job.type) {
      case 'envio_confirmation':
        await this.processEnvioConfirmation(job);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  private async processEnvioConfirmation(job: QueueJob): Promise<void> {
    const data: EnvioEmailData = job.data;
    
    const emailTemplate = EmailTemplates.generateEnvioConfirmation(data);
    
    const success = await this.emailService.sendEmail({
      to: data.usuarioEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    if (!success) {
      throw new Error('Failed to send email');
    }
  }
}
