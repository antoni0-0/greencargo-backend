export interface QueueJob {
  id: string;
  type: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

export interface QueueProcessor {
  process(job: QueueJob): Promise<void>;
}

export class QueueService {
  private queues: Map<string, QueueJob[]> = new Map();
  private processors: Map<string, QueueProcessor> = new Map();
  private isProcessing: Map<string, boolean> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProcessing();
  }

  addJob(queueName: string, jobType: string, data: any, maxAttempts: number = 3): string {
    const jobId = `${queueName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: QueueJob = {
      id: jobId,
      type: jobType,
      data,
      attempts: 0,
      maxAttempts,
      createdAt: new Date()
    };

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }

    this.queues.get(queueName)!.push(job);
    console.log(`Job ${jobId} added to queue ${queueName}`);
    
    return jobId;
  }

  registerProcessor(queueName: string, processor: QueueProcessor): void {
    this.processors.set(queueName, processor);
    console.log(`Processor registered for queue: ${queueName}`);
  }

  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processQueues();
    }, 1000);
  }

  private async processQueues(): Promise<void> {
    for (const [queueName, jobs] of this.queues.entries()) {
      if (this.isProcessing.get(queueName)) {
        continue;
      }

      const processor = this.processors.get(queueName);
      if (!processor) {
        continue;
      }

      const pendingJobs = jobs.filter(job => !job.processedAt && job.attempts < job.maxAttempts);
      if (pendingJobs.length === 0) {
        continue;
      }

      this.isProcessing.set(queueName, true);
      
      try {
        await this.processQueue(queueName, pendingJobs, processor);
      } finally {
        this.isProcessing.set(queueName, false);
      }
    }
  }

  private async processQueue(queueName: string, jobs: QueueJob[], processor: QueueProcessor): Promise<void> {
    for (const job of jobs) {
      try {
        job.attempts++;
        await processor.process(job);
        job.processedAt = new Date();
        console.log(`Job ${job.id} processed successfully`);
      } catch (error) {
        job.error = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Job ${job.id} failed (attempt ${job.attempts}/${job.maxAttempts}):`, job.error);
        
        if (job.attempts >= job.maxAttempts) {
          job.processedAt = new Date();
          console.error(`Job ${job.id} failed permanently after ${job.maxAttempts} attempts`);
        }
      }
    }
  }

  getQueueStatus(queueName: string): { pending: number; failed: number; processed: number } {
    const jobs = this.queues.get(queueName) || [];
    
    return {
      pending: jobs.filter(job => !job.processedAt && job.attempts < job.maxAttempts).length,
      failed: jobs.filter(job => job.processedAt && job.attempts >= job.maxAttempts).length,
      processed: jobs.filter(job => job.processedAt && job.attempts < job.maxAttempts).length
    };
  }

  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}
