'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/hooks/useAuth';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface QuickActionCard {
  href: string;
  icon: string;
  title: string;
  description: string;
}

const quickActions: QuickActionCard[] = [
  {
    href: '/profil/retete',
    icon: 'fa-utensils',
    title: 'Rețetele mele',
    description: 'Gestionează rețetele tale',
  },
  {
    href: '/profil/favorite',
    icon: 'fa-heart',
    title: 'Favorite',
    description: 'Rețetele tale salvate',
  },
  {
    href: '/profil/setari',
    icon: 'fa-cog',
    title: 'Setări cont',
    description: 'Editează profilul tău',
  },
  {
    href: '/profil/retete/noua',
    icon: 'fa-plus',
    title: 'Adaugă rețetă',
    description: 'Creează o rețetă nouă',
  },
];

export default function ProfileDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/autentificare');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <main className="min-h-screen py-8 px-4 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Se încarcă..." />
      </main>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen py-8 px-4 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecționare..." />
      </main>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-theme-card rounded-2xl shadow-rustic p-8 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-mint flex items-center justify-center mx-auto mb-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <i className="fas fa-user text-4xl text-brown"></i>
            )}
          </div>

          {/* User Info */}
          <h1 className="font-display text-2xl font-bold text-theme-primary mb-1">
            {fullName}
          </h1>
          <p className="text-theme-secondary mb-6">{user.email}</p>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-peach">0</div>
              <div className="text-sm text-theme-secondary">Rețete create</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink">0</div>
              <div className="text-sm text-theme-secondary">Favorite</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-theme-card p-6 rounded-2xl shadow-rustic hover:shadow-rustic-lg transition-all cursor-pointer text-center group"
            >
              <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center mx-auto mb-3 group-hover:bg-peach/20 transition-colors">
                <i className={`fas ${action.icon} text-3xl text-peach`}></i>
              </div>
              <h3 className="font-display font-bold text-theme-primary mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-theme-secondary">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-cream/50 rounded-2xl p-6 text-center">
          <h2 className="font-display text-lg font-semibold text-brown mb-2">
            Bine ai venit, {user.firstName}! 👋
          </h2>
          <p className="text-brown/70">
            Explorează panoul tău de control și gestionează-ți rețetele preferate.
          </p>
        </div>
      </div>
    </main>
  );
}
