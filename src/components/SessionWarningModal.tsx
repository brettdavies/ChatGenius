import { useAuth0 } from '@auth0/auth0-react';

interface SessionWarningModalProps {
  isOpen: boolean;
  remainingMinutes: number;
  onExtend: () => void;
  onClose: () => void;
}

const SessionWarningModal = ({
  isOpen,
  remainingMinutes,
  onExtend,
  onClose
}: SessionWarningModalProps) => {
  const { logout } = useAuth0();

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-labelledby="session-warning-title"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 id="session-warning-title" className="text-xl font-semibold mb-4">Session Expiring Soon</h2>
        <p className="mb-6">
          Your session will expire in approximately {remainingMinutes} minutes. 
          Would you like to extend your session?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              logout({ logoutParams: { returnTo: window.location.origin } });
              onClose();
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Logout Now
          </button>
          <button
            onClick={onExtend}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal; 