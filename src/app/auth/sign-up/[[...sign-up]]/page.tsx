import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import SignUpForm from '@/features/auth/components/sign-up-form';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard/overview');
  }

  return <SignUpForm />;
}
