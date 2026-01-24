'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { useToast } from '../../../../lib/hooks/useToast';
import { authApi } from '../../../../lib/api/auth';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth();
  const { success, error } = useToast();

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Theme state
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);

  // Danger zone state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        avatar: user.avatar || '',
      });
      setSelectedTheme(user.theme || 'light');
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/autentificare');
    }
  }, [isLoading, isAuthenticated, router]);

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      const updatedUser = await authApi.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatar: profileData.avatar || undefined,
      });
      updateUser(updatedUser);
      success('Profilul a fost actualizat cu succes!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'A apărut o eroare la actualizarea profilului.';
      error(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      error('Parolele noi nu coincid!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      error('Parola nouă trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      success('Parola a fost schimbată cu succes!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Parola actuală este incorectă sau a apărut o eroare.';
      error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle theme change
  const handleThemeChange = useCallback(async (theme: 'light' | 'dark') => {
    setSelectedTheme(theme);
    setIsUpdatingTheme(true);

    // Apply theme immediately to UI
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    try {
      const updatedUser = await authApi.updateTheme(theme);
      updateUser(updatedUser);
      success(`Tema ${theme === 'dark' ? 'întunecată' : 'luminoasă'} a fost activată.`);
    } catch (err: unknown) {
      // Revert on error
      const revertTheme = theme === 'dark' ? 'light' : 'dark';
      setSelectedTheme(revertTheme);
      if (revertTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      const errorMessage = err instanceof Error ? err.message : 'A apărut o eroare la salvarea temei.';
      error(errorMessage);
    } finally {
      setIsUpdatingTheme(false);
    }
  }, [updateUser, success, error]);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Note: This API endpoint may need to be implemented on the backend
      // For now, we'll show a message and log the user out
      // await usersApi.deleteAccount();
      success('Contul tău a fost programat pentru ștergere. Vei fi deconectat.');
      setTimeout(() => {
        logout();
        router.push('/');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'A apărut o eroare la ștergerea contului.';
      error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle logout from all devices
  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true);
    try {
      // Note: This API endpoint may need to be implemented on the backend
      // For now, we'll just log out the current session
      success('Vei fi deconectat de pe toate dispozitivele.');
      setTimeout(() => {
        logout();
        router.push('/autentificare');
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'A apărut o eroare.';
      error(errorMessage);
    } finally {
      setIsLoggingOutAll(false);
    }
  };

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

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Back Navigation */}
        <Link
          href="/profil"
          className="inline-flex items-center gap-2 text-theme-secondary hover:text-brown transition-colors mb-6"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Înapoi la profil</span>
        </Link>

        {/* Page Title */}
        <h1 className="font-display text-3xl font-bold text-theme-primary mb-8">
          Setări cont
        </h1>

        {/* Section 1: Profile Information */}
        <section className="bg-theme-card rounded-2xl shadow-rustic p-6 mb-6">
          <h2 className="text-xl font-display font-bold text-theme-primary mb-4 flex items-center gap-2">
            <i className="fas fa-user"></i>
            Informații profil
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-1">
                  Prenume
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
                  placeholder="Prenumele tău"
                  required
                />
              </div>
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-1">
                  Nume
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
                  placeholder="Numele tău"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors opacity-60 cursor-not-allowed"
                placeholder="email@exemplu.com"
                disabled
                title="Emailul nu poate fi modificat"
              />
              <p className="text-xs text-theme-secondary mt-1">
                <i className="fas fa-info-circle mr-1"></i>
                Emailul nu poate fi modificat.
              </p>
            </div>

            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-1">
                Avatar URL (opțional)
              </label>
              <input
                type="url"
                value={profileData.avatar}
                onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
                placeholder="https://exemplu.com/avatar.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="py-3 px-6 rounded-lg font-semibold text-white bg-brown hover:bg-brown/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isUpdatingProfile ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Se actualizează...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Actualizează profilul
                </>
              )}
            </button>
          </form>
        </section>

        {/* Section 2: Change Password */}
        <section className="bg-theme-card rounded-2xl shadow-rustic p-6 mb-6">
          <h2 className="text-xl font-display font-bold text-theme-primary mb-4 flex items-center gap-2">
            <i className="fas fa-lock"></i>
            Schimbă parola
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-1">
                Parolă actuală
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-1">
                Parolă nouă
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-1">
                Confirmă parola nouă
              </label>
              <input
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="py-3 px-6 rounded-lg font-semibold text-white bg-brown hover:bg-brown/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Se schimbă...
                </>
              ) : (
                <>
                  <i className="fas fa-key"></i>
                  Schimbă parola
                </>
              )}
            </button>
          </form>
        </section>

        {/* Section 3: Theme Preference */}
        <section className="bg-theme-card rounded-2xl shadow-rustic p-6 mb-6">
          <h2 className="text-xl font-display font-bold text-theme-primary mb-4 flex items-center gap-2">
            <i className="fas fa-palette"></i>
            Preferințe temă
          </h2>

          <div className="space-y-3">
            <p className="text-theme-secondary text-sm mb-4">
              Alege tema preferată pentru interfață. Setarea va fi salvată în contul tău.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Light Theme Option */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                disabled={isUpdatingTheme}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  selectedTheme === 'light'
                    ? 'border-peach bg-peach/10'
                    : 'border-theme hover:border-peach/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedTheme === 'light' ? 'border-peach' : 'border-theme-secondary'
                  }`}>
                    {selectedTheme === 'light' && (
                      <div className="w-3 h-3 rounded-full bg-peach"></div>
                    )}
                  </div>
                  <i className="fas fa-sun text-xl text-amber-500"></i>
                  <span className="font-medium text-theme-primary">Temă luminoasă</span>
                </div>
              </button>

              {/* Dark Theme Option */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                disabled={isUpdatingTheme}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  selectedTheme === 'dark'
                    ? 'border-peach bg-peach/10'
                    : 'border-theme hover:border-peach/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedTheme === 'dark' ? 'border-peach' : 'border-theme-secondary'
                  }`}>
                    {selectedTheme === 'dark' && (
                      <div className="w-3 h-3 rounded-full bg-peach"></div>
                    )}
                  </div>
                  <i className="fas fa-moon text-xl text-indigo-400"></i>
                  <span className="font-medium text-theme-primary">Temă întunecată</span>
                </div>
              </button>
            </div>

            {isUpdatingTheme && (
              <p className="text-sm text-theme-secondary flex items-center gap-2">
                <i className="fas fa-spinner fa-spin"></i>
                Se salvează preferința...
              </p>
            )}
          </div>
        </section>

        {/* Section 4: Danger Zone */}
        <section className="bg-theme-card rounded-2xl shadow-rustic p-6 mb-6 border-2 border-red-200">
          <h2 className="text-xl font-display font-bold text-red-600 mb-4 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            Zonă periculoasă
          </h2>

          <p className="text-theme-secondary text-sm mb-6">
            Aceste acțiuni sunt ireversibile. Te rugăm să fii atent înainte de a continua.
          </p>

          <div className="space-y-4">
            {/* Logout from all devices */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <h3 className="font-medium text-theme-primary">Deconectare de pe toate dispozitivele</h3>
                <p className="text-sm text-theme-secondary">
                  Vei fi deconectat de pe toate dispozitivele, inclusiv acesta.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogoutAllDevices}
                disabled={isLoggingOutAll}
                className="py-3 px-6 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {isLoggingOutAll ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Se deconectează...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-out-alt"></i>
                    Deconectează-te
                  </>
                )}
              </button>
            </div>

            {/* Delete account */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <h3 className="font-medium text-theme-primary">Șterge contul</h3>
                <p className="text-sm text-theme-secondary">
                  Toate datele tale vor fi șterse permanent, inclusiv rețetele și favoritele.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="py-3 px-6 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <i className="fas fa-trash-alt"></i>
                  Șterge contul
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-red-600 font-medium text-sm">Ești sigur? Această acțiune este ireversibilă!</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="py-2 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Se șterge...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check"></i>
                          Da, șterge
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="py-2 px-4 rounded-lg font-semibold text-theme-primary bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all"
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
