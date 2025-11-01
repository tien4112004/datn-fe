import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/shared/components/ui/card';
import { useAuth } from '@/shared/context/auth';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-muted-foreground text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium underline-offset-4 hover:underline">
                Sign up
              </Link>
            </div>
            <div className="text-muted-foreground border-t pt-4 text-center text-sm">
              <p className="font-medium">Demo Accounts:</p>
              <div className="mt-2 space-y-1 text-xs">
                <p>test@example.com / password123</p>
                <p>admin@example.com / admin123</p>
                <p>demo@example.com / demo123</p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
