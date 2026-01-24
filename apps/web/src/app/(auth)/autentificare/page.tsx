'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useToast } from '../../../lib/hooks/useToast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      error('Te rugăm să completezi toate câmpurile');
      return;
    }

    setIsLoading(true);

    try {
      await login({ email: formData.email, password: formData.password });
      success('Autentificare reușită! Bine ai revenit!');
      router.push('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Email sau parolă incorectă';
      error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-theme-card rounded-2xl w-full max-w-md overflow-hidden shadow-rustic">
      {/* Header */}
      <div className="p-6 border-b border-theme">
        <h1 className="text-2xl font-display font-bold text-theme-primary flex items-center gap-2">
          <i className="fa-solid fa-sign-in-alt text-peach"></i>
          Autentificare
        </h1>
      </div>

      {/* Body */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-theme-secondary text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemplu@email.com"
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-theme-secondary text-sm font-medium mb-1">
              Parolă
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Introdu parola"
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link href="/recuperare-parola" className="text-peach hover:underline text-sm">
              Ai uitat parola?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-brown hover:bg-brown/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Se autentifică...
              </>
            ) : (
              <>
                <i className="fa-solid fa-sign-in-alt"></i>
                Autentifică-te
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-theme-secondary text-sm">
          Nu ai un cont?{' '}
          <Link href="/inregistrare" className="text-peach hover:underline font-medium">
            Creează unul acum
          </Link>
        </p>
      </div>
    </div>
  );
}
