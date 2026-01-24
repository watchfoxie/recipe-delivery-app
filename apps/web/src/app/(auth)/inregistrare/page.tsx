'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useToast } from '../../../lib/hooks/useToast';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      error('Te rugăm să completezi toate câmpurile');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      error('Parolele nu coincid');
      return;
    }

    if (formData.password.length < 6) {
      error('Parola trebuie să aibă cel puțin 6 caractere');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      success('Cont creat cu succes! Bine ai venit!');
      router.push('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'A apărut o eroare la înregistrare';
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
          <i className="fa-solid fa-user-plus text-peach"></i>
          Creează cont nou
        </h1>
      </div>

      {/* Body */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-theme-secondary text-sm font-medium mb-1">
              Prenume
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Introdu prenumele"
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-theme-secondary text-sm font-medium mb-1">
              Nume
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Introdu numele"
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
            />
          </div>

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
              placeholder="Minimum 6 caractere"
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-theme-secondary text-sm font-medium mb-1">
              Confirmă Parola
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repetă parola"
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
            />
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
                Se creează contul...
              </>
            ) : (
              <>
                <i className="fa-solid fa-user-plus"></i>
                Creează cont
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-theme-secondary text-sm">
          Ai deja un cont?{' '}
          <Link href="/autentificare" className="text-peach hover:underline font-medium">
            Autentifică-te
          </Link>
        </p>
      </div>
    </div>
  );
}
