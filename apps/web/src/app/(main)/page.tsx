import HeroSection from '../../components/home/HeroSection';
import FeaturedRecipesSection from '../../components/home/FeaturedRecipesSection';
import QualityIngredientsSection from '../../components/home/QualityIngredientsSection';
import NewsletterSection from '../../components/home/NewsletterSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Culinaria Acasă | Rețete Tradiționale Moldovenești',
  description: 'Descoperă cele mai delicioase rețete tradiționale moldovenești. Rețete autentice cu ingrediente locale, pregătite cu dragoste.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero Section - captures attention with headline and CTAs */}
      <HeroSection />
      
      {/* 2. Featured Recipes - 3x2 grid with filter buttons */}
      <FeaturedRecipesSection />
      
      {/* 3. Quality Ingredients Section - showcases ingredient quality */}
      <QualityIngredientsSection />
      
      {/* 4. Newsletter Section - email subscription */}
      <NewsletterSection />
    </main>
  );
}
