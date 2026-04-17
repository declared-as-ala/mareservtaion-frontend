'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore, type CartItem } from '@/stores/cart';
import { ArrowRight, Clock, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ------------------------------------------------------------------ */
/* Cart Item Row                                                         */
/* ------------------------------------------------------------------ */
function CartLine({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="group flex gap-3 py-4 border-b border-gray-200 last:border-0">
      {/* Image */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="64px" />
        ) : (
          <div className="size-full flex items-center justify-center">
            <ShoppingBag className="size-5 text-gray-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <p className="font-semibold text-[#111111] text-sm leading-tight truncate pr-1">
            {item.title}
          </p>
          <button
            onClick={() => removeItem(item.id)}
            className="shrink-0 size-5 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-0.5"
            aria-label="Supprimer"
          >
            <X className="size-3" />
          </button>
        </div>

        <p className="text-[#D4AF37] text-xs mb-1.5">{item.unitLabel}</p>

        <p className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <Clock className="size-3" />
          {new Date(item.dateTime).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        {/* Qty + price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden h-7">
            <button
              type="button"
              className="size-7 flex items-center justify-center text-gray-500 hover:text-[#111111] hover:bg-gray-100 transition-colors"
              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
              aria-label="Diminuer"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-7 text-center text-sm text-[#111111] font-medium">
              {item.quantity}
            </span>
            <button
              type="button"
              className="size-7 flex items-center justify-center text-gray-500 hover:text-[#111111] hover:bg-gray-100 transition-colors"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              aria-label="Augmenter"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <span className="font-bold text-[#111111] text-sm">
            {item.price * item.quantity}{' '}
            <span className="text-gray-500 font-normal text-xs">TND</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer                                                                */
/* ------------------------------------------------------------------ */
export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const totalQuantity = useCartStore((s) => s.totalQuantity());
  const totalAmount = useCartStore((s) => s.totalAmount());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-md bg-white border-gray-200 p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-[#111111] font-semibold">
              <ShoppingBag className="size-5 text-[#D4AF37]" />
              Mon panier
              {totalQuantity > 0 && (
                <span className="ml-1 size-5 rounded-full bg-[#D4AF37] text-white text-xs font-bold flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Body */}
        <div
          className={cn(
            'flex-1 overflow-y-auto px-5',
            items.length === 0 && 'flex items-center justify-center'
          )}
        >
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto size-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
                <ShoppingBag className="size-7 text-gray-400" />
              </div>
              <p className="text-[#111111] font-medium mb-1">Votre panier est vide</p>
              <p className="text-gray-500 text-sm">Ajoutez des tables ou chambres pour commencer.</p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartLine key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-5 py-5 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Total</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#D4AF37]">{totalAmount}</span>
                <span className="text-gray-500 text-sm ml-1">TND</span>
              </div>
            </div>

            {/* CTAs */}
            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-[#D4AF37] hover:bg-[#B8962E] text-white font-bold h-12 gap-2 shadow-lg"
              onClick={() => onOpenChange(false)}
            >
              <Link href="/checkout">
                Passer au paiement
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full text-gray-500 hover:text-[#111111] hover:bg-gray-50"
              onClick={() => onOpenChange(false)}
            >
              <Link href="/panier">Voir le panier complet</Link>
            </Button>
          </div>
        )}

        {items.length === 0 && (
          <div className="border-t border-gray-200 px-5 py-4">
            <Button
              asChild
              variant="outline"
              className="w-full border-gray-200 bg-white text-[#111111] hover:bg-gray-50"
              onClick={() => onOpenChange(false)}
            >
              <Link href="/explorer">Explorer les lieux</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
