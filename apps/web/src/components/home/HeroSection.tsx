import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative min-h-[600px] pattern-culinary flex items-center">
      {/* Gradient overlay */}
      <div className="absolute inset-0 hero-gradient-light dark:hero-gradient-dark"></div>

      {/* Content container */}
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            {/* Hashtag Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-pink mb-6">
              <i className="fas fa-heart text-brown mr-2"></i>
              <span className="text-brown font-medium">Rețete cu dragoste</span>
            </div>

            {/* Hero Title */}
            <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-bold text-theme-primary leading-tight mb-6">
              Descoperă <span className="text-peach">Aromele</span> Bucătăriei
              Tradiționale
            </h1>

            {/* Description */}
            <p className="text-lg text-theme-secondary font-body leading-relaxed mb-8">
              Colecția noastră de rețete culinare tradiționale moldovenești te
              invită într-o călătorie gastronomică plină de gusturi autentice,
              arome îmbietoare și amintiri din copilărie.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/retete"
                className="px-8 py-3 rounded-full bg-brown text-white font-semibold hover:scale-105 hover:shadow-lg transition-all duration-200"
              >
                <i className="fas fa-book-open mr-2"></i>Explorează Rețete
              </Link>
              <Link
                href="/video"
                className="px-8 py-3 rounded-full border-2 border-brown text-brown font-semibold hover:scale-105 transition-all duration-200"
              >
                <i className="fas fa-play mr-2"></i>Vezi Tutoriale
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-brown">
                  500+
                </div>
                <div className="text-sm text-theme-secondary">Rețete</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-brown">
                  50+
                </div>
                <div className="text-sm text-theme-secondary">Categorii</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-brown">
                  10k+
                </div>
                <div className="text-sm text-theme-secondary">Utilizatori</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-rustic-lg">
              <Image
                src="/images/hero/moldovan-mamaliga.png"
                alt="Mămăligă tradițională moldovenească"
                width={600}
                height={500}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            {/* Floating badge - bottom left */}
            <div className="absolute bottom-4 left-4 bg-mint px-4 py-2 rounded-full flex items-center gap-2 shadow-rustic">
              <i className="fas fa-leaf text-brown"></i>
              <span className="text-brown font-medium text-sm">
                100% Natural
              </span>
            </div>
            {/* Floating badge - top right */}
            <div className="absolute top-4 right-4 bg-peach w-12 h-12 rounded-full flex items-center justify-center shadow-rustic">
              <i className="fas fa-award text-brown text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
