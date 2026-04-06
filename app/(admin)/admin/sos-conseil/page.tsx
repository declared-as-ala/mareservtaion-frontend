'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Eye, Trash2, RefreshCcw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { listSOSConseil, updateSOSConseilStatus, deleteSOSConseil, type SOSConseilRecord } from '@/lib/api/sos-conseil';
import { toast } from 'sonner';

const STATUS_LABEL: Record<string, string> = {
  new: 'Nouveau',
  in_review: 'En revue',
  contacted: 'Contacté',
  closed: 'Clôturé',
};

const STATUS_STYLE: Record<string, string> = {
  new: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  in_review: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  contacted: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  closed: 'text-zinc-400 bg-zinc-800 border-zinc-700',
};

function DetailModal({ req, onClose }: { req: SOSConseilRecord; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState<SOSConseilRecord>(req);

  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: (s: SOSConseilRecord['status']) => updateSOSConseilStatus(current._id, s),
    onSuccess: (updated) => {
      setCurrent((prev) => ({ ...prev, status: updated.status ?? updated as any }));
      queryClient.invalidateQueries({ queryKey: ['admin', 'sos-conseil'] });
      toast.success('Statut mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const fields: [string, string][] = [
    ['Nom complet', current.fullName],
    ['Téléphone', current.phone],
    ['Email', current.email || '—'],
    ['Occasion', current.occasionType.replace('_', ' ')],
    ['Participants', String(current.participantsCount)],
    ["Tranche d'âge", current.averageAgeRange],
    ['Région', current.preferredRegion],
    ['Catégorie', current.preferredCategory.replace('_', ' ')],
    ['Budget', current.budgetRange.replace('_', ' ')],
    ['Date souhaitée', current.preferredDate ? new Date(current.preferredDate).toLocaleDateString('fr-FR') : '—'],
    ['Heure souhaitée', current.preferredTime || '—'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Demande SOS Conseil</h2>
            </div>
            <p className="text-xs text-zinc-500">{new Date(current.createdAt).toLocaleString('fr-FR')}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <dl className="space-y-0 divide-y divide-zinc-800/60 text-sm">
          {fields.map(([label, value]) => (
            <div key={label} className="grid grid-cols-2 gap-2 py-2.5">
              <dt className="text-zinc-500">{label}</dt>
              <dd className="font-medium text-zinc-200 capitalize">{value}</dd>
            </div>
          ))}
        </dl>

        {current.details && (
          <div className="mt-4">
            <p className="text-xs text-zinc-500 mb-1.5">Détails</p>
            <div className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {current.details}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2">Changer le statut</p>
          <div className="flex flex-wrap gap-2">
            {(['new', 'in_review', 'contacted', 'closed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                disabled={isPending || current.status === s}
                onClick={() => changeStatus(s)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  current.status === s
                    ? 'bg-amber-400 text-black cursor-default'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-amber-400/40 hover:text-amber-400',
                ].join(' ')}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSOSConseilPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<SOSConseilRecord | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'sos-conseil', page, status],
    queryFn: () => listSOSConseil({ page, status: status || undefined }),
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteSOSConseil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sos-conseil'] });
      toast.success('Demande supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const requests = data?.data ?? [];

  return (
    <>
      {selected && <DetailModal req={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              SOS Conseil
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">Demandes de conseil personnalisé</p>
          </div>
          {data && (
            <span className="text-sm text-zinc-400">
              {data.total} demande{data.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm outline-none focus:border-amber-400/50"
          >
            <option value="">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="in_review">En revue</option>
            <option value="contacted">Contacté</option>
            <option value="closed">Clôturé</option>
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-16 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-zinc-600 opacity-50" />
              <p className="text-zinc-500">Aucune demande SOS Conseil pour le moment</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-zinc-950/50">
                  <tr>
                    {['Nom', 'Téléphone', 'Occasion', 'Participants', 'Catégorie', 'Région', 'Statut', 'Date', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-200">{req.fullName}</td>
                      <td className="px-4 py-3 text-zinc-400">{req.phone}</td>
                      <td className="px-4 py-3 text-zinc-300 capitalize">{req.occasionType.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-zinc-300">{req.participantsCount}</td>
                      <td className="px-4 py-3 text-zinc-300 capitalize">{req.preferredCategory.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-zinc-300">{req.preferredRegion}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[req.status] ?? ''}`}>
                          {STATUS_LABEL[req.status] ?? req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelected(req)}
                            className="p-1.5 rounded-lg hover:bg-amber-400/10 text-zinc-500 hover:text-amber-400 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Supprimer la demande de ${req.fullName} ?`)) remove(req._id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-400/10 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data && data.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                  <span className="text-sm text-zinc-500">
                    Page {data.page} / {data.pages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={data.page <= 1}
                      className="p-2 rounded-lg border border-zinc-700 disabled:opacity-40 hover:border-zinc-600 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={data.page >= data.pages}
                      className="p-2 rounded-lg border border-zinc-700 disabled:opacity-40 hover:border-zinc-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
