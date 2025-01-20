import { useState } from 'react';
import { useAuthStore } from '../../stores';
import { login, validate2FA } from '../../services/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginFormProps {
  onClose?: () => void;
  onRegister: () => void;
}

type LoginStep = 'credentials' | '2fa';

export default function LoginForm({ onClose, onRegister }: LoginFormProps) {
  console.log('[LoginForm] Props received:', { onClose: !!onClose, onRegister: !!onRegister });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<LoginStep>('credentials');
  const [userId, setUserId] = useState<string>('');
  const [token, setToken] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const { setUser } = useAuthStore();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginForm] Submitting credentials...');
    setError('');
    setLoading(true);

    try {
      const { user, requiresTwoFactor, userId } = await login(email, password);
      console.log('[LoginForm] Login response received:', { 
        requiresTwoFactor,
        hasUser: !!user,
        userId
      });
      
      if (requiresTwoFactor) {
        if (!userId) {
          throw new Error('Server did not provide userId for 2FA');
        }
        console.log('[LoginForm] 2FA required, switching to 2FA step');
        setUserId(userId);
        setCurrentStep('2fa');
      } else {
        if (!user) {
          throw new Error('Server did not provide user data');
        }
        console.log('[LoginForm] Login successful, setting user');
        setUser(user);
        onClose?.();
      }
    } catch (err) {
      console.error('[LoginForm] Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginForm] Submitting 2FA verification...', { userId, isBackupCode });
    setError('');
    setLoading(true);

    try {
      const response = await validate2FA(userId, token, isBackupCode);
      console.log('[LoginForm] 2FA validation successful');
      
      if (!response.user) {
        console.error('[LoginForm] No user data received after 2FA validation');
        throw new Error('Failed to validate 2FA: No user data received');
      }
      
      console.log('[LoginForm] Setting user');
      setUser(response.user);
      onClose?.();
    } catch (err) {
      console.error('[LoginForm] 2FA validation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[LoginForm] Create account clicked, onRegister:', !!onRegister);
    if (typeof onRegister !== 'function') {
      console.error('[LoginForm] onRegister is not a function:', onRegister);
      return;
    }
    onRegister();
  };

  if (currentStep === '2fa') {
    return (
      <form onSubmit={handle2FASubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-400">Enter the code from your authenticator app</p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-200">
            Authentication Code
          </label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter 6-digit code"
          />
        </div>

        <div className="flex items-center">
          <input
            id="backup-code"
            type="checkbox"
            checked={isBackupCode}
            onChange={(e) => setIsBackupCode(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="backup-code" className="ml-2 block text-sm text-gray-200">
            Use backup code
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to ChatGenius</h2>
        <p className="text-gray-400">Or <a href="#" className="text-indigo-400 hover:text-indigo-300" onClick={handleCreateAccount}>create a new account</a></p>
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-200">
          Password
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
            Remember me
          </label>
        </div>

        <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
} 