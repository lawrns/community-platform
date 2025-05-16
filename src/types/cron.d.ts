/**
 * Type declarations for cron module
 */

declare module 'cron' {
  export namespace CronJob {
    export interface CronJobParameters {
      cronTime: string | Date;
      onTick: () => void;
      onComplete?: () => void;
      start?: boolean;
      timezone?: string;
      context?: any;
      runOnInit?: boolean;
      unrefTimeout?: boolean;
    }
  }

  export class CronJob {
    constructor(
      cronTime: string | Date,
      onTick: () => void,
      onComplete?: () => void,
      start?: boolean,
      timezone?: string,
      context?: any,
      runOnInit?: boolean,
      unrefTimeout?: boolean
    );

    constructor(options: CronJob.CronJobParameters);

    start(): void;
    stop(): void;
    fireOnTick(): void;
    addCallback(callback: () => void): number;
    nextDate(): Date;
    running: boolean;
  }

  export class CronTime {
    constructor(time: string | Date);
    
    sendAt(): Date;
    sendAt(i: number): Date;
    
    getTimeout(): number;
  }
}