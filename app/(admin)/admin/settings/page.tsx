'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchAdminSettings, updateAdminSettings } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Globe, Phone, Mail, ImageIcon, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type SettingsForm = {
  siteName: string;
  logoUrlLight: string;
  logoUrlDark: string;
  supportPhone: string;
  supportEmail: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
};

const defaultForm: SettingsForm = {
  siteName: '',
  logoUrlLight: '',
  logoUrlDark: '',
  supportPhone: '',
  supportEmail: '',
  defaultLanguage: 'fr',
  maintenanceMode: false,
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaultForm);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: fetchAdminSettings,
  });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        siteName: data.siteName ?? '',
        logoUrlLight: data.logoUrlLight ?? '',
        logoUrlDark: data.logoUrlDark ?? '',
        supportPhone: data.supportPhone ?? '',
        supportEmail: data.supportEmail ?? '',
        defaultLanguage: data.defaultLanguage ?? 'fr',
        maintenanceMode: data.maintenanceMode ?? false,
      });
    }
  }, [data]);

  const saveMut = useMutation({
    mutationFn: () => updateAdminSettings({
      siteName: form.siteName || undefined,
      logoUrlLight: form.logoUrlLight || undefined,
      logoUrlDark: form.logoUrlDark || undefined,
      supportPhone: form.supportPhone || undefined,
      supportEmail: form.supportEmail || undefined,
      defaultLanguage: form.defaultLanguage || undefined,
      maintenanceMode: form.maintenanceMode,
    }),
    onSuccess: () => {
      toast.success('Paramètres enregistrés');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  });

  const field = (key: keyof SettingsForm) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configuration générale du site</p>
        </div>
        <Button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="gap-2 min-w-[130px]"
        >
          {saveMut.isPending ? (
            <><Loader2 className="size-4 animate-spin" />Sauvegarde...</>
          ) : saved ? (
            <><CheckCircle2 className="size-4" />Sauvegardé</>
          ) : (
            <><Save className="size-4" />Sauvegarder</>
          )}
        </Button>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="size-4 text-muted-foreground" />
            Informations générales
          </CardTitle>
          <CardDescription>Nom du site et paramètres de base</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="siteName">Nom du site</Label>
              <Input id="siteName" placeholder="MaTable" {...field('siteName')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defaultLanguage">Langue par défaut</Label>
              <Input id="defaultLanguage" placeholder="fr" {...field('defaultLanguage')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="size-4 text-muted-foreground" />
            Logos
          </CardTitle>
          <CardDescription>URLs des logos light et dark mode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="logoLight">Logo (mode clair)</Label>
              <Input id="logoLight" placeholder="https://..." {...field('logoUrlLight')} />
              {form.logoUrlLight && (
                <div className="mt-2 p-3 rounded-lg border bg-white flex items-center justify-center h-14 relative">
                  <Image src={form.logoUrlLight} alt="Logo light" fill className="object-contain p-3" sizes="200px" />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logoDark">Logo (mode sombre)</Label>
              <Input id="logoDark" placeholder="https://..." {...field('logoUrlDark')} />
              {form.logoUrlDark && (
                <div className="mt-2 p-3 rounded-lg border bg-zinc-900 flex items-center justify-center h-14 relative">
                  <Image src={form.logoUrlDark} alt="Logo dark" fill className="object-contain p-3" sizes="200px" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="size-4 text-muted-foreground" />
            Contact support
          </CardTitle>
          <CardDescription>Coordonnées affichées aux utilisateurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="supportPhone" className="flex items-center gap-1.5">
                <Phone className="size-3.5" /> Téléphone support
              </Label>
              <Input id="supportPhone" placeholder="+216 XX XXX XXX" {...field('supportPhone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supportEmail" className="flex items-center gap-1.5">
                <Mail className="size-3.5" /> Email support
              </Label>
              <Input id="supportEmail" type="email" placeholder="support@matable.tn" {...field('supportEmail')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="size-4 text-muted-foreground" />
            Mode maintenance
          </CardTitle>
          <CardDescription>
            En mode maintenance, seuls les admins peuvent accéder au site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Activer le mode maintenance</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {form.maintenanceMode
                  ? 'Le site est actuellement en maintenance'
                  : 'Le site est accessible au public'}
              </p>
            </div>
            <Switch
              checked={form.maintenanceMode}
              onCheckedChange={(v) => setForm((f) => ({ ...f, maintenanceMode: v }))}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="gap-2"
        >
          {saveMut.isPending ? (
            <><Loader2 className="size-4 animate-spin" />Sauvegarde...</>
          ) : (
            <><Save className="size-4" />Sauvegarder les paramètres</>
          )}
        </Button>
      </div>
    </div>
  );
}
