'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  User, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Shield, 
  ChevronRight,
  Crown,
  CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';

export function UserMenuDropdown() {
  const { user, logout } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  if (!user) return null;
  const isAdmin = user.role === 'ADMIN';
  const isOwner = user.role === 'VENUE_OWNER' || user.role === 'ORGANIZER';

  const initials = user.fullName
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowConfirm(false);
    logout();
  };

  const roleBadge = () => {
    if (isAdmin) {
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 text-[10px] px-1.5 py-0 font-medium">
          <Shield className="size-2.5 mr-1" />
          Admin
        </Badge>
      );
    }
    if (isOwner) {
      return (
        <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20 text-[10px] px-1.5 py-0 font-medium">
          <Crown className="size-2.5 mr-1" />
          Proprietaire
        </Badge>
      );
    }
    return (
      <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 text-[10px] px-1.5 py-0 font-medium">
        <User className="size-2.5 mr-1" />
        Utilisateur
      </Badge>
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative flex items-center gap-2 h-9 px-2 rounded-full hover:bg-zinc-800/50 transition-all duration-200"
          >
            <Avatar className="size-8 ring-2 ring-zinc-700 ring-offset-2 ring-offset-zinc-950 transition-all duration-200 hover:ring-amber-500/50">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:block text-sm font-medium text-zinc-200 max-w-[120px] truncate">
              {user.fullName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-72 p-0 border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40"
        >
          {/* User Profile Header */}
          <div className="relative p-4 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border-b border-zinc-800">
            <div className="flex items-start gap-3">
              <Avatar className="size-12 ring-2 ring-amber-500/30 ring-offset-2 ring-offset-zinc-900">
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-base font-bold text-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{user.fullName}</p>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
                <div className="mt-1.5">
                  {roleBadge()}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <DropdownMenuGroup className="p-2">
            {isAdmin && (
              <DropdownMenuItem asChild className="p-0">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center size-9 rounded-lg bg-zinc-800/80 group-hover:bg-amber-500/10 transition-colors duration-200">
                    <LayoutDashboard className="size-4 text-zinc-400 group-hover:text-amber-400 transition-colors duration-200" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors duration-200">
                      Tableau de bord
                    </p>
                    <p className="text-[10px] text-zinc-500">Administration</p>
                  </div>
                  <ChevronRight className="size-4 text-zinc-600 group-hover:text-amber-400 transition-all duration-200 group-hover:translate-x-0.5" />
                </Link>
              </DropdownMenuItem>
            )}
            {!isAdmin && (
              <DropdownMenuItem asChild className="p-0">
                <Link
                  href="/mes-reservations"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center size-9 rounded-lg bg-zinc-800/80 group-hover:bg-amber-500/10 transition-colors duration-200">
                    <CalendarClock className="size-4 text-zinc-400 group-hover:text-amber-400 transition-colors duration-200" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors duration-200">
                      Mes réservations
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Historique et prochaines réservations
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-zinc-600 group-hover:text-amber-400 transition-all duration-200 group-hover:translate-x-0.5" />
                </Link>
              </DropdownMenuItem>
            )}

            {isOwner && (
              <DropdownMenuItem asChild className="p-0">
                <Link
                  href="/owner"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center size-9 rounded-lg bg-zinc-800/80 group-hover:bg-blue-500/10 transition-colors duration-200">
                    <LayoutDashboard className="size-4 text-zinc-400 group-hover:text-blue-300 transition-colors duration-200" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors duration-200">
                      Espace proprietaire
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Mes lieux et reservations
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-zinc-600 group-hover:text-blue-300 transition-all duration-200 group-hover:translate-x-0.5" />
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem asChild className="p-0">
              <Link
                href={isAdmin ? '/admin/settings' : '/profile'}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center justify-center size-9 rounded-lg bg-zinc-800/80 group-hover:bg-amber-500/10 transition-colors duration-200">
                  <Settings className="size-4 text-zinc-400 group-hover:text-amber-400 transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors duration-200">
                    Paramètres
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Gérer mon profil
                  </p>
                </div>
                <ChevronRight className="size-4 text-zinc-600 group-hover:text-amber-400 transition-all duration-200 group-hover:translate-x-0.5" />
              </Link>
            </DropdownMenuItem>

            {isAdmin && (
              <DropdownMenuItem asChild className="p-0">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center size-9 rounded-lg bg-zinc-800/80 group-hover:bg-purple-500/10 transition-colors duration-200">
                    <Crown className="size-4 text-zinc-400 group-hover:text-purple-400 transition-colors duration-200" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors duration-200">
                      Utilisateurs
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Gestion des comptes
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-zinc-600 group-hover:text-purple-400 transition-all duration-200 group-hover:translate-x-0.5" />
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-zinc-800" />

          {/* Logout Button */}
          <div className="p-2">
            <DropdownMenuItem
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLogoutClick}
            >
              <div className="flex items-center justify-center size-9 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors duration-200">
                <LogOut className="size-4 text-red-400 group-hover:text-red-300 transition-colors duration-200" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Déconnexion
                </p>
                <p className="text-[10px] text-zinc-500">
                  Fermer la session
                </p>
              </div>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-900 max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <LogOut className="size-5 text-red-400" />
              </div>
              <AlertDialogTitle className="text-white text-lg">
                Confirmer la déconnexion
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-zinc-400 pt-2">
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={() => setShowConfirm(false)}
              className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogoutConfirm}
              className="bg-red-500 hover:bg-red-400 text-white"
            >
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
