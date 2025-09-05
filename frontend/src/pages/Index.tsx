import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/templates/AuthForm';
import { githubService } from '@/lib/github-service';
import { useToast } from '@hanseo0507/react-toast'

export const Index = () => {

  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (githubService.isAuthenticated()) {
        try {
          await githubService.getCurrentUser();
          setIsAuthenticated(true);
          navigate('/repositories');
        } catch (err) {
          githubService.clearToken();
          setIsAuthenticated(false);
          toast.error('Authentication failed. Please sign in again.');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    navigate('/repositories');
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onSuccess={handleAuthSuccess} />
  }

  return null;
};
