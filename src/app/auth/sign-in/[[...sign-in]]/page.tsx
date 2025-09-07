import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import SignInForm from '@/features/auth/components/sign-in-form';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard/overview');
  }

  return <SignInForm />;
}
