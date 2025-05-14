
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const SessionTimeoutComponent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const timeoutDuration = 20 * 60 * 1000; // 20 minutes in milliseconds

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      setLastActivity(Date.now());
      // Sauvegarde du timestamp d'activité dans localStorage
      localStorage.setItem('lastActivityTimestamp', Date.now().toString());
    };

    // Initialisation avec une valeur stockée si elle existe
    const storedTimestamp = localStorage.getItem('lastActivityTimestamp');
    if (storedTimestamp) {
      setLastActivity(parseInt(storedTimestamp, 10));
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    const intervalId = setInterval(() => {
      const now = Date.now();
      const storedActivity = localStorage.getItem('lastActivityTimestamp');
      const lastActivityTime = storedActivity ? parseInt(storedActivity, 10) : lastActivity;
      
      if (now - lastActivityTime > timeoutDuration) {
        logout();
        navigate('/login');
        toast.error("Session expirée", {
          description: "Votre session a expiré en raison d'inactivité. Veuillez vous reconnecter."
        });
      }
    }, 60000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(intervalId);
    };
  }, [isAuthenticated, lastActivity, logout, navigate]);

  return null;
};

export default SessionTimeoutComponent;
