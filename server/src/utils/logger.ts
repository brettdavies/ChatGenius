import { config } from '@/config';

const formatMessage = (level: string, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
};

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(formatMessage('info', message, meta));
  },
  
  error: (message: string, meta?: any) => {
    console.error(formatMessage('error', message, meta));
  },
  
  warn: (message: string, meta?: any) => {
    console.warn(formatMessage('warn', message, meta));
  },
  
  debug: (message: string, meta?: any) => {
    if (config.nodeEnv === 'development') {
      console.debug(formatMessage('debug', message, meta));
    }
  }
}; 