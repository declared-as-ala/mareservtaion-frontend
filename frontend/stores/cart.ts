'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItemType = 'venue_table' | 'venue_room' | 'event_ticket';

export interface CartOrderMenuItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

export interface CartItem {
  id: string;
  type: CartItemType;
  title: string;
  imageUrl?: string;
  unitLabel: string;
  unitType: string;
  dateTime: string;
  endAt?: string;
  price: number;
  quantity: number;
  /** For linking back to venue/event */
  venueId?: string;
  tableId?: string;
  roomId?: string;
  seatId?: string;
  eventId?: string;
  slug?: string;
  orderType?: 'table_only' | 'with_menu';
  menuItems?: CartOrderMenuItem[];
  menuTotal?: number;
}

type CartState = {
  items: CartItem[];
  /** UI state: whether the cart drawer is open */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalQuantity: () => number;
  totalAmount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      addItem: (payload) => {
        const quantity = payload.quantity ?? 1;
        const existing = get().items.find((i) => i.id === payload.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === payload.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...payload, quantity }] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },
      clearCart: () => set({ items: [] }),
      totalQuantity: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      totalAmount: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity + (i.menuTotal ?? 0), 0),
    }),
    {
      name: 'ma-reservation-cart',
      // Don't persist UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
