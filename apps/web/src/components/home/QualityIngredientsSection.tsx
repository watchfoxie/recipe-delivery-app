import Image from 'next/image';

export function QualityIngredientsSection() {
  return (
    <section className="py-16 pattern-culinary relative">
      {/* Gradient overlay - mint tinted */}
      <div className="absolute inset-0 bg-gradient-to-r from-cream/90 to-mint/90 dark:from-dark-bg/90 dark:to-dark-bg-secondary/90"></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT COLUMN - Image Grid (2x2 staggered) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-rustic">
                <Image
                  src="/images/features/vibrant-fruits.jpg"
                  alt="Fructe proaspete"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-rustic">
                <Image
                  src="/images/features/agroturism-moldova.jpg"
                  alt="Agroturism Moldova"
                  width={300}
                  height={230}
                  className="w-full h-56 object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              {/* Offset for visual interest */}
              <div className="rounded-2xl overflow-hidden shadow-rustic">
                <Image
                  src="/images/features/kitchen-couple.jpg"
                  alt="Cuplu în bucătărie"
                  width={300}
                  height={230}
                  className="w-full h-56 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-rustic">
                <Image
                  src="/images/features/rich-bread.jpg"
                  alt="Pâine tradițională"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Content */}
          <div className="space-y-6">
            {/* Badge */}
            <span className="inline-block px-4 py-2 rounded-full bg-peach text-brown text-sm font-medium">
              <i className="fas fa-seedling mr-2"></i>Calitate Premium
            </span>

            {/* Title */}
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-brown">
              Ingrediente Locale și Proaspete pentru Rețete Autentice
            </h2>

            {/* Description */}
            <p className="text-brown-light leading-relaxed">
              Credem că secretul unei mâncări delicioase stă în calitatea
              ingredientelor. De aceea, promovăm utilizarea produselor locale,
              proaspete și naturale, cultivate cu grijă de fermierii din
              Moldova.
            </p>

            {/* Feature List */}
            <div className="space-y-4">
              {/* Feature 1 - Natural (mint background) */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-mint flex items-center justify-center shrink-0">
                  <i className="fas fa-check text-brown"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-brown">100% Natural</h4>
                  <p className="text-sm text-brown-light">
                    Fără aditivi chimici sau conservanți artificiali.
                  </p>
                </div>
              </div>

              {/* Feature 2 - Seasonal (pink background) */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-pink flex items-center justify-center shrink-0">
                  <i className="fas fa-calendar-check text-brown"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-brown">Produse de Sezon</h4>
                  <p className="text-sm text-brown-light">
                    Ingrediente culese la momentul optim de maturare.
                  </p>
                </div>
              </div>

              {/* Feature 3 - Passion (peach background) */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-peach flex items-center justify-center shrink-0">
                  <i className="fas fa-heart text-brown"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-brown">Gătit cu Pasiune</h4>
                  <p className="text-sm text-brown-light">
                    Rețete tradiționale transmise din generație în generație.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QualityIngredientsSection;
