export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, error?: any): string {
    const timestamp = new Date().toISOString();
    const errorDetails = error ? `\nError details: ${JSON.stringify(error, null, 2)}` : '';
    return `[${timestamp}] [${level}] [${this.context}] ${message}${errorDetails}`;
  }

  static info(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
  }

  static warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }

  static debug(message: string, data?: any): void {
    console.debug(`[DEBUG] ${message}`, data);
  }

  info(message: string): void {
    console.log(this.formatMessage('INFO', message));
  }

  warn(message: string): void {
    console.warn(this.formatMessage('WARN', message));
  }

  error(message: string, error?: any): void {
    console.error(this.formatMessage('ERROR', message, error));
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }
} 