import { useEffect, useCallback, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import SessionWarningModal from './SessionWarningModal';

interface SessionManagerProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
  children: React.ReactNode;
}

const SessionManager = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  children
}: SessionManagerProps) => {
  const { logout, getAccessTokenSilently } = useAuth0();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(warningMinutes);
  
  // Reset timer on user activity
  const resetTimer = useCallback(() => {
    localStorage.setItem('lastActivity', Date.now().toString());
    setShowWarning(false);
  }, []);

  // Extend session by getting a new access token
  const extendSession = useCallback(async () => {
    try {
      await getAccessTokenSilently();
      resetTimer();
    } catch (error) {
      console.error('Failed to extend session:', error);
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  }, [getAccessTokenSilently, resetTimer, logout]);

  // Check session status
  const checkSession = useCallback(() => {
    const lastActivity = Number(localStorage.getItem('lastActivity'));
    const now = Date.now();
    const minutesSinceLastActivity = (now - lastActivity) / (1000 * 60);
    const remaining = Math.max(0, timeoutMinutes - minutesSinceLastActivity);

    if (minutesSinceLastActivity >= timeoutMinutes) {
      // Session expired, log out
      logout({ logoutParams: { returnTo: window.location.origin } });
    } else if (minutesSinceLastActivity >= (timeoutMinutes - warningMinutes)) {
      // Show warning
      setShowWarning(true);
      setRemainingMinutes(Math.ceil(remaining));
    }
  }, [logout, timeoutMinutes, warningMinutes]);

  useEffect(() => {
    // Initialize last activity
    resetTimer();

    // Set up activity listeners
    const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activities.forEach(activity => {
      window.addEventListener(activity, resetTimer);
    });

    // Set up interval to check session
    const interval = setInterval(checkSession, 60000); // Check every minute

    return () => {
      // Cleanup
      activities.forEach(activity => {
        window.removeEventListener(activity, resetTimer);
      });
      clearInterval(interval);
    };
  }, [resetTimer, checkSession]);

  return (
    <>
      {children}
      <SessionWarningModal
        isOpen={showWarning}
        remainingMinutes={remainingMinutes}
        onExtend={extendSession}
        onClose={() => setShowWarning(false)}
      />
    </>
  );
};

export default SessionManager; 