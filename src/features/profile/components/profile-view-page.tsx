'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export default function ProfileViewPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <div className='flex w-full flex-col p-4'>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const user = session.user
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className='flex w-full flex-col p-4'>
      <Card className='max-w-2xl'>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center space-x-4'>
            <Avatar className='h-20 w-20'>
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className='text-lg font-semibold'>{user.name || 'User'}</h3>
              <p className='text-muted-foreground'>{user.email}</p>
            </div>
          </div>
          
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>Name</label>
              <p className='text-sm text-muted-foreground'>{user.name || 'Not provided'}</p>
            </div>
            
            <div>
              <label className='text-sm font-medium'>Email</label>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
            </div>
            
            <div>
              <label className='text-sm font-medium'>User ID</label>
              <p className='text-sm text-muted-foreground font-mono'>{user.id}</p>
            </div>
          </div>
          
          <div className='pt-4'>
            <Button 
              variant='outline' 
              onClick={() => signOut({ callbackUrl: '/auth/sign-in' })}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
