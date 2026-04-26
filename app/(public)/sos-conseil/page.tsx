'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitSOSConseil, type SOSConseilPayload } from '@/lib/api/sos-conseil';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const OCCASIONS = [
  { value: 'birthday', label: 'Anniversaire' },
  { value: 'wedding_engagement', label: 'Mariage / Fiançailles' },
  { value: 'business_meeting', label: "Réunion d'affaires" },
  { value: 'family_event', label: 'Événement familial' },
  { value: 'romantic_dinner', label: 'Dîner romantique' },
  { value: 'graduation', label: 'Remise de diplôme' },
  { value: 'corporate', label: "Soirée d'entreprise" },
  { value: 'other', label: 'Autre' },
];

const AGE_RANGES = ['18-20', '20-30', '30-40', '40-50', '50-60', '+60'] as const;

const CATEGORIES = [
  { value: 'cafe', label: 'Café' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'cinema', label: 'Cinéma' },
  { value: 'event_space', label: 'Espace événementiel' },
];

type FormData = {
  fullName: string;
  phone: string;
  email: string;
  occasionType: string;
  participantsCount: string;
  averageAgeRanges: string[];
  preferredRegion: string;
  preferredCategory: string;
  preferredDate: string;
  preferredTime: string;
  details: string;
};

const INITIAL: FormData = {
  fullName: '',
  phone: '',
  email: '',
  occasionType: '',
  participantsCount: '',
  averageAgeRanges: [],
  preferredRegion: '',
  preferredCategory: '',
  preferredDate: '',
  preferredTime: '',
  details: '',
};

export default function SOSConseilPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = (key: keyof FormData, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAgeRange = (range: string) => {
    setForm((prev) => {
      const has = prev.averageAgeRanges.includes(range);
      return {
        ...prev,
        averageAgeRanges: has
          ? prev.averageAgeRanges.filter((r) => r !== range)
          : [...prev.averageAgeRanges, range],
      };
    });
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Nom complet requis.';
    if (!form.phone.trim()) return 'Téléphone requis.';
    if (!form.occasionType) return "Type d'événement requis.";
    if (!form.participantsCount || Number(form.participantsCount) <= 0) return 'Nombre de participants invalide.';
    if (form.averageAgeRanges.length < 1) return "Sélectionnez au moins une tranche d'âge.";
    if (!form.preferredRegion.trim()) return 'Région requise.';
    if (!form.preferredCategory) return 'Type de lieu requis.';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) return 'Adresse email invalide.';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(true);
    try {
      const payload: SOSConseilPayload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        occasionType: form.occasionType,
        participantsCount: Number(form.participantsCount),
        averageAgeRanges: [...new Set(form.averageAgeRanges)],
        preferredRegion: form.preferredRegion.trim(),
        preferredCategory: form.preferredCategory,
        preferredDate: form.preferredDate || undefined,
        preferredTime: form.preferredTime || undefined,
        details: form.details.trim() || undefined,
      };
      await submitSOSConseil(payload);
      setSubmitted(true);
      toast.success('Demande envoyée', { description: 'Notre équipe vous contactera rapidement.' });
    } catch {
      toast.error('Erreur lors de l’envoi', { description: 'Veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-white/[0.08] bg-white/[0.03] text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/10 border border-amber-400/30">
              <CheckCircle2 className="size-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Demande envoyée</h2>
            <p className="text-sm text-zinc-400 mb-6">Nous revenons vers vous avec les meilleures recommandations.</p>
            <Button onClick={() => { setSubmitted(false); setForm(INITIAL); }} className="bg-amber-400 hover:bg-amber-300 text-black">
              Nouvelle demande
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/[0.06] bg-gradient-to-br from-amber-400/5 via-black to-black">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Service Conciergerie
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">SOS Conseil</h1>
          <p className="text-zinc-400 max-w-xl">Décrivez votre événement et notre équipe vous oriente vers les meilleurs lieux.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card className="border-white/[0.08] bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-white">Votre demande</CardTitle>
            <CardDescription>Réponse rapide et personnalisée.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={onSubmit} noValidate>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Nom complet *</Label>
                  <Input value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} className="bg-zinc-900/70 border-zinc-700" />
                </div>
                <div>
                  <Label className="mb-2 block">Téléphone *</Label>
                  <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="bg-zinc-900/70 border-zinc-700" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-2 block">Email (optionnel)</Label>
                  <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className="bg-zinc-900/70 border-zinc-700" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-2 block">Type d&apos;événement *</Label>
                  <Select value={form.occasionType} onValueChange={(v) => setField('occasionType', v)}>
                    <SelectTrigger className="w-full bg-zinc-900/70 border-zinc-700"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                      {OCCASIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Participants *</Label>
                  <Input type="number" min={1} value={form.participantsCount} onChange={(e) => setField('participantsCount', e.target.value)} className="bg-zinc-900/70 border-zinc-700" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-2 block">Tranches d&apos;âge * (choix multiples)</Label>
                  <p className="text-[11px] text-zinc-500 mb-2">Sélectionnez toutes les tranches qui correspondent à votre groupe.</p>
                  <div className="flex flex-wrap gap-2">
                    {AGE_RANGES.map((range) => {
                      const selected = form.averageAgeRanges.includes(range);
                      return (
                        <button
                          key={range}
                          type="button"
                          onClick={() => toggleAgeRange(range)}
                          className={cn(
                            'px-3 py-2 rounded-lg border text-xs font-medium transition-colors',
                            selected
                              ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                              : 'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                          )}
                        >
                          {range} ans
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Région *</Label>
                  <Input value={form.preferredRegion} onChange={(e) => setField('preferredRegion', e.target.value)} className="bg-zinc-900/70 border-zinc-700" />
                </div>
                <div>
                  <Label className="mb-2 block">Type de lieu *</Label>
                  <Select value={form.preferredCategory} onValueChange={(v) => setField('preferredCategory', v)}>
                    <SelectTrigger className="w-full bg-zinc-900/70 border-zinc-700"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                      {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Date (optionnel)</Label>
                  <Input type="date" value={form.preferredDate} onChange={(e) => setField('preferredDate', e.target.value)} className="bg-zinc-900/70 border-zinc-700" />
                </div>
                <div>
                  <Label className="mb-2 block">Heure (optionnel)</Label>
                  <Input type="time" value={form.preferredTime} onChange={(e) => setField('preferredTime', e.target.value)} className="bg-zinc-900/70 border-zinc-700" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-2 block">Détails (optionnel)</Label>
                  <Textarea value={form.details} onChange={(e) => setField('details', e.target.value)} className="min-h-28 bg-zinc-900/70 border-zinc-700" />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-black font-semibold">
                {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
