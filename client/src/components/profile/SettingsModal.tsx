import { Dialog } from '@headlessui/react';
import { XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SetupStep = 'initial' | 'qr' | 'verify' | 'backup';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>('initial');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { user } = useAuthStore();

  const handleActivate2FA = async () => {
    console.log('[2FA Setup] Initiating 2FA setup');
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('[2FA Setup] Failed:', error);
        throw new Error(error.message || 'Failed to initialize 2FA setup');
      }
      
      const data = await response.json();
      console.log('[2FA Setup] Successfully received QR code and backup codes');
      setQrCodeUrl(data.qrCodeUrl);
      setBackupCodes(data.backupCodes);
      setSetupStep('qr');
    } catch (err) {
      console.error('[2FA Setup] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    console.log('[2FA Setup] Attempting to validate token');
    if (!user?.id) {
      console.error('[2FA Setup] No user ID available');
      setError('User ID not found');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/2fa/validate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          token: verificationCode,
          isBackupCode: false
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('[2FA Setup] Validation failed:', error);
        throw new Error(error.message || 'Failed to validate code');
      }
      
      console.log('[2FA Setup] Token validated successfully, showing backup codes');
      setSetupStep('backup');
    } catch (err) {
      console.error('[2FA Setup] Validation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  const handleConfirm = async () => {
    console.log('[2FA Confirm] Confirming backup codes saved');
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/2fa/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('[2FA Confirm] Failed:', error);
        throw new Error(error.message || 'Failed to complete 2FA setup');
      }
      
      console.log('[2FA Confirm] Successfully completed 2FA setup');
      onClose();
    } catch (err) {
      console.error('[2FA Confirm] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Settings
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 py-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add an extra layer of security to your account by requiring both your
              password and an authentication code.
            </p>

            {error && (
              <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {setupStep === 'initial' && (
              <button
                onClick={handleActivate2FA}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting up...' : 'Activate 2FA'}
              </button>
            )}

            {setupStep === 'qr' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="flex justify-center bg-white p-4 rounded-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                  <button
                    onClick={handleValidate}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Validating...' : 'Validate Code'}
                  </button>
                </div>
              </div>
            )}

            {setupStep === 'backup' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="relative">
                  <pre className="block w-full rounded-md bg-gray-50 dark:bg-gray-900 p-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                    {backupCodes.join('\n')}
                  </pre>
                  <button
                    onClick={copyBackupCodes}
                    className="absolute right-2 top-2 p-2 rounded-md bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    title="Copy to clipboard"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Completing setup...' : 'Done'}
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 