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
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your information to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-muted-foreground text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium underline-offset-4 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
