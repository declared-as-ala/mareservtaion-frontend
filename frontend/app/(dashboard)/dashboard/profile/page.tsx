'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? '');

  const initials = user?.fullName
    ?.split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Vos informations de compte (lecture seule pour l&apos;instant).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled />
            </div>
          </div>
          <Button disabled>Enregistrer (bientôt)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
