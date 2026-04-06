'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminBannerSlides,
  createAdminBannerSlide,
  updateAdminBannerSlide,
  deleteAdminBannerSlide,
  type AdminBannerSlide,
} from '@/lib/api/admin';
import { uploadImageFile } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableRowSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { Image as ImageIcon, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = {
  titleFr: '',
  subtitleFr: '',
  imageUrlDesktop: '',
  imageUrlMobile: '',
  ctaLabelFr: 'Réserver',
  ctaUrl: '/explorer',
  sortOrder: 0,
  isActive: true,
};

export default function AdminBannerSlidesPage() {
  const queryClient = useQueryClient();
  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['admin', 'banner-slides'],
    queryFn: fetchAdminBannerSlides,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'banner-slides'] });
    queryClient.invalidateQueries({ queryKey: ['banner-slides'] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: slides.length });
    setDialogOpen(true);
  };

  const openEdit = (s: AdminBannerSlide) => {
    setEditingId(s._id);
    setForm({
      titleFr: s.titleFr ?? '',
      subtitleFr: s.subtitleFr ?? '',
      imageUrlDesktop: s.imageUrlDesktop ?? '',
      imageUrlMobile: s.imageUrlMobile ?? '',
      ctaLabelFr: s.ctaLabelFr ?? 'Réserver',
      ctaUrl: s.ctaUrl ?? '/explorer',
      sortOrder: s.sortOrder ?? 0,
      isActive: s.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateAdminBannerSlide(editingId, form);
        toast.success('Slide mis à jour.');
      } else {
        await createAdminBannerSlide({
          ...form,
          titleFr: form.titleFr,
          imageUrlDesktop: form.imageUrlDesktop,
        });
        toast.success('Slide créé.');
      }
      invalidate();
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce slide ?')) return;
    setDeletingId(id);
    try {
      await deleteAdminBannerSlide(id);
      toast.success('Slide supprimé.');
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = async (field: 'imageUrlDesktop' | 'imageUrlMobile', file: File) => {
    const setUploading = field === 'imageUrlDesktop' ? setUploadingDesktop : setUploadingMobile;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      setForm((f) => ({ ...f, [field]: url }));
      toast.success('Photo envoyée.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Échec de l\'upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bannières</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-2" />
          Ajouter un slide
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Slides du hero</CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Photo</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={5} />
                  ))}
                </TableBody>
              </Table>
            ) : slides.length === 0 ? (
              <EmptyState
                icon={<ImageIcon className="size-12" />}
                title="Aucun slide"
                description="Les slides configurés apparaîtront ici. Connectez l'API backend si nécessaire."
                action={
                  <Button onClick={openCreate}>Ajouter un slide</Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Photo</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slides.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell>
                        {s.imageUrlDesktop || s.imageUrlMobile ? (
                          <div className="relative h-14 w-20 rounded overflow-hidden bg-muted">
                            <Image
                              src={s.imageUrlDesktop || s.imageUrlMobile || ''}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        ) : (
                          <div className="h-14 w-20 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">—</div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{s.titleFr}</TableCell>
                      <TableCell>
                        {s.isActive ? (
                          <Badge variant="default">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </TableCell>
                      <TableCell>{s.sortOrder}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label={`Modifier ${s.titleFr}`}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(s._id)}
                            disabled={deletingId === s._id}
                            aria-label={`Supprimer ${s.titleFr}`}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-lg" aria-describedby="banner-slide-form-desc">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier le slide' : 'Nouveau slide'}</DialogTitle>
          </DialogHeader>
          <p id="banner-slide-form-desc" className="sr-only">
            Formulaire pour créer ou modifier un slide de bannière affiché sur la page d’accueil.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titleFr">Titre</Label>
              <Input
                id="titleFr"
                value={form.titleFr}
                onChange={(e) => setForm((f) => ({ ...f, titleFr: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitleFr">Sous-titre</Label>
              <Input
                id="subtitleFr"
                value={form.subtitleFr}
                onChange={(e) => setForm((f) => ({ ...f, subtitleFr: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrlDesktop">Image desktop</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrlDesktop"
                  type="url"
                  placeholder="URL ou upload ci‑dessous"
                  value={form.imageUrlDesktop}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrlDesktop: e.target.value }))}
                  required
                  className="flex-1"
                />
                <input
                  ref={desktopInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload('imageUrlDesktop', file);
                    e.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => desktopInputRef.current?.click()}
                  disabled={uploadingDesktop}
                  title="Envoyer une photo"
                  aria-label="Envoyer une photo pour l’image desktop"
                >
                  <Upload className="size-4" />
                </Button>
              </div>
              {uploadingDesktop && <p className="text-xs text-muted-foreground">Envoi en cours…</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrlMobile">Image mobile (optionnel)</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrlMobile"
                  type="url"
                  placeholder="URL ou upload ci‑dessous"
                  value={form.imageUrlMobile}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrlMobile: e.target.value }))}
                  className="flex-1"
                />
                <input
                  ref={mobileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload('imageUrlMobile', file);
                    e.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => mobileInputRef.current?.click()}
                  disabled={uploadingMobile}
                  title="Envoyer une photo"
                  aria-label="Envoyer une photo pour l’image mobile"
                >
                  <Upload className="size-4" />
                </Button>
              </div>
              {uploadingMobile && <p className="text-xs text-muted-foreground">Envoi en cours…</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaLabelFr">Texte du bouton</Label>
                <Input
                  id="ctaLabelFr"
                  value={form.ctaLabelFr}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLabelFr: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaUrl">URL du bouton</Label>
                <Input
                  id="ctaUrl"
                  value={form.ctaUrl}
                  onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Ordre</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border"
                />
                <Label htmlFor="isActive">Actif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
