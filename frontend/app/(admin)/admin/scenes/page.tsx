'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Loader2,
  X,
} from 'lucide-react';
import { fetchScenes, createScene, updateScene, deleteScene } from '@/lib/api/scenes';
import { apiGetRaw } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Scene } from '@/lib/api/types';

/* ------------------------------------------------------------------ */
/* Venue selector                                                        */
/* ------------------------------------------------------------------ */
interface VenueOption { _id: string; name: string; slug?: string; }

function useVenues() {
  return useQuery({
    queryKey: ['admin-venues-light'],
    queryFn: async () => {
      const data = await apiGetRaw<VenueOption[]>('/admin/venues?limit=200&fields=name,slug');
      return Array.isArray(data) ? data : [];
    },
  });
}

/* ------------------------------------------------------------------ */
/* Scene card                                                            */
/* ------------------------------------------------------------------ */
function SceneCard({ scene, venueId }: { scene: Scene; venueId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(scene.name);
  const [description, setDescription] = useState(scene.description ?? '');
  const [image, setImage] = useState(scene.image);

  const updateMut = useMutation({
    mutationFn: (body: Partial<{ name: string; description: string; image: string; order: number; isActive: boolean }>) =>
      updateScene(scene._id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scenes', venueId] });
      toast.success('Scène mise à jour.');
      setEditing(false);
    },
    onError: () => toast.error('Erreur.'),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteScene(scene._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scenes', venueId] });
      toast.success('Scène supprimée.');
    },
  });

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      {/* Image preview */}
      <div className="relative aspect-[2/1] bg-zinc-800 overflow-hidden">
        {scene.image ? (
          <Image src={scene.image} alt={scene.name} fill className="object-cover" sizes="600px" />
        ) : (
          <div className="size-full flex items-center justify-center">
            <ImageIcon className="size-10 text-zinc-600" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="bg-black/60 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-mono">
            #{scene.order}
          </span>
          {!scene.isActive && (
            <span className="bg-red-900/60 text-red-300 text-xs px-2 py-0.5 rounded-full">
              Inactive
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            onClick={() => updateMut.mutate({ isActive: !scene.isActive })}
            className="size-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
            title={scene.isActive ? 'Désactiver' : 'Activer'}
          >
            {scene.isActive
              ? <Eye className="size-3.5 text-emerald-400" />
              : <EyeOff className="size-3.5 text-zinc-400" />}
          </button>
          <button
            onClick={() => { if (confirm('Supprimer cette scène ?')) deleteMut.mutate(); }}
            className="size-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-red-500/60 transition-colors"
          >
            <Trash2 className="size-3.5 text-zinc-300" />
          </button>
        </div>
      </div>

      {/* Info / edit */}
      <div className="p-4">
        {editing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" placeholder="Optionnel" />
            </div>
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">URL image 360°</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => updateMut.mutate({ name, description, image })}
                disabled={updateMut.isPending}
                className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold rounded-full gap-1.5"
              >
                {updateMut.isPending && <Loader2 className="size-3.5 animate-spin" />}
                Enregistrer
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-zinc-400">
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-zinc-100">{scene.name}</p>
              {scene.description && <p className="text-zinc-500 text-xs mt-0.5">{scene.description}</p>}
              <p className="text-zinc-600 text-xs mt-1 font-mono truncate max-w-[200px]">{scene.image}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="text-zinc-400 hover:text-zinc-100 shrink-0">
              Éditer
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 pb-3 flex items-center gap-2">
        <GripVertical className="size-4 text-zinc-700" />
        <Label className="text-zinc-500 text-xs">Ordre :</Label>
        <input
          type="number"
          defaultValue={scene.order}
          onBlur={(e) => updateMut.mutate({ order: Number(e.target.value) })}
          className="w-14 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-300 text-xs"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Create form                                                           */
/* ------------------------------------------------------------------ */
function CreateSceneForm({ venueId, onDone }: { venueId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState(0);

  const mut = useMutation({
    mutationFn: () => createScene({ venueId, name, description, image, order }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scenes', venueId] });
      toast.success('Scène créée.');
      onDone();
    },
    onError: () => toast.error('Erreur lors de la création.'),
  });

  return (
    <div className="rounded-2xl border border-amber-400/30 bg-zinc-900/60 p-5 space-y-4">
      <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
        <Plus className="size-4 text-amber-400" />
        Nouvelle scène
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-zinc-400 text-xs">Nom *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Salle principale" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
        </div>
        <div className="space-y-1">
          <Label className="text-zinc-400 text-xs">Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnel" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-zinc-400 text-xs">URL image 360° (equirectangular, 2:1) *</Label>
          <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-zinc-400 text-xs">Ordre d&apos;affichage</Label>
          <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-24" />
        </div>
      </div>
      {image && (
        <div className="rounded-xl overflow-hidden border border-zinc-700 aspect-[2/1] relative bg-zinc-800">
          <Image src={image} alt="preview" fill className="object-cover" sizes="600px" onError={() => {}} />
          <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-zinc-300 px-2 py-0.5 rounded-full">Aperçu 360°</span>
        </div>
      )}
      <div className="flex gap-2">
        <Button
          onClick={() => mut.mutate()}
          disabled={!name.trim() || !image.trim() || mut.isPending}
          className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-full gap-2"
        >
          {mut.isPending && <Loader2 className="size-3.5 animate-spin" />}
          Créer la scène
        </Button>
        <Button variant="ghost" onClick={onDone} className="text-zinc-400">
          Annuler
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                             */
/* ------------------------------------------------------------------ */
export default function AdminScenesPage() {
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const { data: venues = [], isLoading: venuesLoading } = useVenues();

  const { data: scenes = [], isLoading: scenesLoading } = useQuery({
    queryKey: ['scenes', selectedVenueId],
    queryFn: () => fetchScenes(selectedVenueId),
    enabled: !!selectedVenueId,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="size-6 text-amber-400" />
            360° Scene Builder
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Gérez les scènes 360° de vos lieux. Chaque scène = une pièce / zone.
          </p>
        </div>
        {selectedVenueId && (
          <Button
            onClick={() => setShowCreate((v) => !v)}
            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-full gap-2"
          >
            <Plus className="size-4" />
            Nouvelle scène
          </Button>
        )}
      </div>

      {/* Venue picker */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <Label className="text-zinc-400 text-sm mb-2 block">Sélectionner un lieu</Label>
        <select
          value={selectedVenueId}
          onChange={(e) => { setSelectedVenueId(e.target.value); setShowCreate(false); }}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-400/60"
        >
          <option value="">— Choisir un lieu —</option>
          {venues.map((v) => (
            <option key={v._id} value={v._id}>{v.name}</option>
          ))}
        </select>
        {venuesLoading && <p className="text-zinc-500 text-xs mt-2">Chargement des lieux…</p>}
      </div>

      {/* Create form */}
      {showCreate && selectedVenueId && (
        <CreateSceneForm venueId={selectedVenueId} onDone={() => setShowCreate(false)} />
      )}

      {/* Scenes grid */}
      {selectedVenueId && (
        scenesLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 animate-pulse">
                <div className="aspect-[2/1] bg-zinc-800 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : scenes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-800">
            <Layers className="size-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium mb-1">Aucune scène pour ce lieu</p>
            <p className="text-zinc-600 text-sm mb-4">Créez votre première scène 360°</p>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-full gap-2"
            >
              <Plus className="size-4" /> Créer une scène
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {scenes.map((scene) => (
              <SceneCard key={scene._id} scene={scene} venueId={selectedVenueId} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
