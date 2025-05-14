import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In - Community.io',
  description: 'Sign in to your Community.io account',
};

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <LoginForm />
    </div>
  );
}