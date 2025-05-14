import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Sign Up - Community.io',
  description: 'Create a new account on Community.io',
};

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <RegisterForm />
    </div>
  );
}