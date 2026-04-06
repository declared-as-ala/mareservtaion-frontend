'use client';

import { useState } from 'react';
import {
  Sparkles, User, Phone, Mail, Users, MapPin,
  Calendar, Clock, MessageSquare, ChevronDown, CheckCircle2,
} from 'lucide-react';
import { submitSOSConseil, type SOSConseilPayload } from '@/lib/api/sos-conseil';

const OCCASIONS = [
  { value: 'birthday', label: '🎂 Anniversaire' },
  { value: 'wedding_engagement', label: '💍 Mariage / Fiançailles' },
  { value: 'business_meeting', label: "💼 Réunion d'affaires" },
  { value: 'family_event', label: '👨‍👩‍👧 Événement familial' },
  { value: 'romantic_dinner', label: '🕯️ Dîner romantique' },
  { value: 'graduation', label: '🎓 Remise de diplôme' },
  { value: 'corporate', label: '🏢 Soirée d\'entreprise' },
  { value: 'other', label: '✨ Autre' },
];

const AGE_RANGES = [
  { value: '18-20', label: '18 – 20 ans' },
  { value: '20-30', label: '20 – 30 ans' },
  { value: '30-40', label: '30 – 40 ans' },
  { value: '40-50', label: '40 – 50 ans' },
  { value: '50-60', label: '50 – 60 ans' },
  { value: '+60', label: '60 ans et plus' },
];

const CATEGORIES = [
  { value: 'cafe', label: 'Café' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'cinema', label: 'Cinéma' },
  { value: 'event_space', label: 'Espace événementiel' },
];

const BUDGETS = [
  { value: 'moins_100', label: 'Moins de 100 TND' },
  { value: '100_300', label: '100 – 300 TND' },
  { value: '300_600', label: '300 – 600 TND' },
  { value: '600_1000', label: '600 – 1 000 TND' },
  { value: 'plus_1000', label: 'Plus de 1 000 TND' },
];

type FormData = {
  fullName: string; phone: string; email: string;
  occasionType: string; participantsCount: string; averageAgeRange: string;
  preferredRegion: string; preferredCategory: string; budgetRange: string;
  preferredDate: string; preferredTime: string; details: string;
};

const INITIAL: FormData = {
  fullName: '', phone: '', email: '', occasionType: '',
  participantsCount: '', averageAgeRange: '', preferredRegion: '',
  preferredCategory: '', budgetRange: '', preferredDate: '', preferredTime: '', details: '',
};

function SectionHeader({ step, title, optional }: { step: number; title: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-7 h-7 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
        {step}
      </div>
      <h2 className="text-sm font-semibold text-foreground tracking-wide">
        {title}
        {optional && <span className="ml-2 text-muted-foreground font-normal">(optionnel)</span>}
      </h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-muted-foreground mb-2">
      {children}
      {required && <span className="ml-1 text-amber-400">*</span>}
    </label>
  );
}

function InputField({ icon: Icon, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType; error?: string }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />}
      <input
        {...props}
        className={[
          'w-full rounded-xl border bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600',
          'py-3 pr-4 text-sm outline-none transition-all',
          'focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 focus:bg-zinc-900',
          'hover:border-zinc-600',
          error ? 'border-red-400/60' : 'border-zinc-700',
          Icon ? 'pl-10' : 'pl-4',
        ].join(' ')}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function SelectField({
  icon: Icon, options, placeholder, value, onChange, error,
}: {
  icon?: React.ElementType; options: { value: string; label: string }[];
  placeholder: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={[
          'w-full flex items-center gap-3 rounded-xl border text-sm outline-none transition-all text-left',
          'py-3 px-4',
          open ? 'border-amber-400/60 ring-1 ring-amber-400/20 bg-zinc-900' : 'bg-zinc-900/60 hover:border-zinc-600',
          error ? 'border-red-400/60' : open ? '' : 'border-zinc-700',
        ].join(' ')}
      >
        {Icon && <Icon className="w-4 h-4 text-zinc-500 shrink-0" />}
        <span className={selected ? 'text-zinc-100 flex-1' : 'text-zinc-500 flex-1'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={['w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/60 overflow-hidden">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={[
                  'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2',
                  o.value === value
                    ? 'bg-amber-400/15 text-amber-400 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
                ].join(' ')}
              >
                {o.value === value && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                {o.value !== value && <span className="w-1.5 h-1.5 shrink-0" />}
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function SOSConseilPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormData) => (value: string) => setForm((p) => ({ ...p, [key]: value }));
  const fromInput = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key)(e.target.value);

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.fullName.trim()) errs.fullName = 'Champ requis';
    if (!form.phone.trim()) errs.phone = 'Champ requis';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide';
    if (!form.occasionType) errs.occasionType = 'Champ requis';
    if (!form.participantsCount || isNaN(Number(form.participantsCount)) || Number(form.participantsCount) < 1)
      errs.participantsCount = 'Nombre invalide';
    if (!form.averageAgeRange) errs.averageAgeRange = 'Champ requis';
    if (!form.preferredRegion.trim()) errs.preferredRegion = 'Champ requis';
    if (!form.preferredCategory) errs.preferredCategory = 'Champ requis';
    if (!form.budgetRange) errs.budgetRange = 'Champ requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: SOSConseilPayload = {
        fullName: form.fullName, phone: form.phone,
        email: form.email || undefined,
        occasionType: form.occasionType,
        participantsCount: Number(form.participantsCount),
        averageAgeRange: form.averageAgeRange,
        preferredRegion: form.preferredRegion,
        preferredCategory: form.preferredCategory,
        budgetRange: form.budgetRange,
        preferredDate: form.preferredDate || undefined,
        preferredTime: form.preferredTime || undefined,
        details: form.details || undefined,
      };
      await submitSOSConseil(payload);
      setSubmitted(true);
    } catch {
      setErrors({ fullName: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Demande envoyée !</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Notre équipe a bien reçu votre demande et vous contactera dans les plus brefs délais pour vous proposer les meilleures options.
          </p>
          <button
            type="button"
            onClick={() => { setSubmitted(false); setForm(INITIAL); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-amber-400/40 text-amber-400 font-medium hover:bg-amber-400/10 transition-colors"
          >
            Nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative border-b bg-gradient-to-br from-amber-400/5 via-background to-background">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Service Conciergerie
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">SOS Conseil</h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Vous ne savez pas où aller ? Décrivez-nous votre événement et notre équipe vous sélectionne les lieux parfaits — personnellement.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-10">

            {/* 1 — Coordonnées */}
            <section>
              <SectionHeader step={1} title="Vos coordonnées" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Nom complet</FieldLabel>
                  <InputField icon={User} type="text" placeholder="Votre nom et prénom" value={form.fullName} onChange={fromInput('fullName')} error={errors.fullName} autoComplete="name" />
                </div>
                <div>
                  <FieldLabel required>Téléphone</FieldLabel>
                  <InputField icon={Phone} type="tel" placeholder="+216 xx xxx xxx" value={form.phone} onChange={fromInput('phone')} error={errors.phone} autoComplete="tel" />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Email <span className="text-muted-foreground/60 font-normal">(optionnel)</span></FieldLabel>
                  <InputField icon={Mail} type="email" placeholder="votre@email.com" value={form.email} onChange={fromInput('email')} error={errors.email} autoComplete="email" />
                </div>
              </div>
            </section>

            {/* 2 — Événement */}
            <section>
              <SectionHeader step={2} title="Votre événement" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FieldLabel required>Type d&apos;événement</FieldLabel>
                  <SelectField options={OCCASIONS} placeholder="Sélectionnez votre événement" value={form.occasionType} onChange={set('occasionType')} error={errors.occasionType} />
                </div>
                <div>
                  <FieldLabel required>Nombre de participants</FieldLabel>
                  <InputField icon={Users} type="number" min="1" placeholder="Ex : 12" value={form.participantsCount} onChange={fromInput('participantsCount')} error={errors.participantsCount} />
                </div>
                <div>
                  <FieldLabel required>Tranche d&apos;âge des participants</FieldLabel>
                  <SelectField options={AGE_RANGES} placeholder="Sélectionnez une tranche" value={form.averageAgeRange} onChange={set('averageAgeRange')} error={errors.averageAgeRange} />
                </div>
              </div>
            </section>

            {/* 3 — Préférences */}
            <section>
              <SectionHeader step={3} title="Vos préférences" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Ville / Région souhaitée</FieldLabel>
                  <InputField icon={MapPin} type="text" placeholder="Ex : Tunis, Sfax, Sousse…" value={form.preferredRegion} onChange={fromInput('preferredRegion')} error={errors.preferredRegion} />
                </div>
                <div>
                  <FieldLabel required>Type de lieu</FieldLabel>
                  <SelectField options={CATEGORIES} placeholder="Sélectionnez un type" value={form.preferredCategory} onChange={set('preferredCategory')} error={errors.preferredCategory} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel required>Budget estimé</FieldLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {BUDGETS.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => set('budgetRange')(b.value)}
                        className={[
                          'px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-center leading-tight',
                          form.budgetRange === b.value
                            ? 'border-amber-400 bg-amber-400/15 text-amber-400'
                            : 'border-border bg-background/40 text-muted-foreground hover:border-amber-400/40 hover:text-foreground',
                        ].join(' ')}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                  {errors.budgetRange && <p className="mt-1.5 text-xs text-red-400">{errors.budgetRange}</p>}
                </div>
              </div>
            </section>

            {/* 4 — Date & heure */}
            <section>
              <SectionHeader step={4} title="Date et heure" optional />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Date souhaitée</FieldLabel>
                  <InputField icon={Calendar} type="date" value={form.preferredDate} onChange={fromInput('preferredDate')} />
                </div>
                <div>
                  <FieldLabel>Heure souhaitée</FieldLabel>
                  <InputField icon={Clock} type="time" value={form.preferredTime} onChange={fromInput('preferredTime')} />
                </div>
              </div>
            </section>

            {/* 5 — Détails */}
            <section>
              <SectionHeader step={5} title="Votre besoin en détails" />
              <FieldLabel>Décrivez votre demande <span className="text-muted-foreground/60 font-normal">(optionnel)</span></FieldLabel>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                <textarea
                  rows={4}
                  placeholder="Précisez vos attentes, contraintes, préférences particulières…"
                  value={form.details}
                  onChange={fromInput('details')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 text-sm outline-none transition-all resize-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 focus:bg-zinc-900 hover:border-zinc-600"
                />
              </div>
            </section>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-amber-400 text-black font-semibold text-sm shadow-[0_6px_24px_rgba(251,191,36,0.3)] hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Envoyer ma demande
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-muted-foreground/60">
                En soumettant ce formulaire, vous acceptez d&apos;être contacté par notre équipe.
              </p>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
