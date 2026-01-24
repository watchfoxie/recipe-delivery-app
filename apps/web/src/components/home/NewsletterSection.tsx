'use client';
import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
      setEmail('');
    } catch {
      setError('A apărut o eroare. Vă rugăm încercați din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-brown">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          {/* Icon Circle */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-peach mb-6">
            <i className="fas fa-envelope text-3xl text-brown"></i>
          </div>

          {/* Title (White) */}
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">
            Abonează-te la Newsletter
          </h2>

          {/* Description (Cream) */}
          <p className="text-cream max-w-xl mx-auto">
            Primește săptămânal cele mai noi rețete, sfaturi culinare și
            inspirație gastronomică direct în inbox-ul tău.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
        >
          {/* Email Input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adresa ta de email"
            required
            className="flex-1 px-6 py-3 rounded-full text-brown placeholder:text-brown-light bg-white focus:outline-none focus:ring-4 focus:ring-peach/50"
          />

          {/* Submit Button (Peach) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full bg-peach text-brown font-semibold hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin"></i>
                Se trimite...
              </span>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Abonează-te
              </>
            )}
          </button>
        </form>

        {/* Privacy Note (Mint text) */}
        <p className="text-sm text-mint mt-4">
          <i className="fas fa-lock mr-2"></i>
          Datele tale sunt în siguranță. Nu trimitem spam.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/20 text-red-200">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="mt-6 p-4 rounded-lg bg-mint/20 text-mint">
            <i className="fas fa-check-circle mr-2"></i>
            Mulțumim pentru abonare! Vei primi curând primul nostru email.
          </div>
        )}
      </div>
    </section>
  );
}
