import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = { title: 'Sign up · CodeStarters Curriculum' };

export default function SignupPage() {
  return <SignupForm />;
}
