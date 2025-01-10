import { SSHTunnel } from '@shared/index';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

export const setupTunnel = async (): Promise<() => Promise<void>> => {
  // Initialize and get the shared tunnel instance
  const tunnel = SSHTunnel.initializeFromEnv();
  await tunnel.connect();

  // Return cleanup function
  return async () => {
    await SSHTunnel.getInstance().disconnect();
    SSHTunnel.resetInstance();
  };
}; 