import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-theme-card border-t border-theme mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 4-Column Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo/home-cooking-logo.png"
                alt="Culinaria Acasă Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-heading text-xl font-semibold text-theme-primary">
                Culinaria Acasă
              </span>
            </div>
            <p className="text-theme-secondary text-sm leading-relaxed mb-4">
              Descoperă bucătăria tradițională moldovenească cu rețete autentice, 
              ingrediente de calitate și dragoste pentru gătit.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 bg-pink rounded-full flex items-center justify-center text-brown hover:scale-110 transition-transform duration-200"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-mint rounded-full flex items-center justify-center text-brown hover:scale-110 transition-transform duration-200"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-peach rounded-full flex items-center justify-center text-brown hover:scale-110 transition-transform duration-200"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-cream rounded-full flex items-center justify-center text-brown hover:scale-110 transition-transform duration-200"
                aria-label="Pinterest"
              >
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-theme-primary mb-4">
              Navigare Rapidă
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-theme-secondary hover:text-peach transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                  Acasă
                </Link>
              </li>
              <li>
                <Link
                  href="/retete"
                  className="text-theme-secondary hover:text-peach transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                  Rețete
                </Link>
              </li>
              <li>
                <Link
                  href="/selectii"
                  className="text-theme-secondary hover:text-peach transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                  Selecții
                </Link>
              </li>
              <li>
                <Link
                  href="/ingrediente"
                  className="text-theme-secondary hover:text-peach transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                  Ingrediente
                </Link>
              </li>
              <li>
                <Link
                  href="/video"
                  className="text-theme-secondary hover:text-peach transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                  Video
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Categories */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-theme-primary mb-4">
              Categorii Populare
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/retete/carne"
                  className="text-theme-secondary hover:text-peach transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-drumstick-bite text-xs"></i>
                  Mâncăruri cu Carne
                </Link>
              </li>
              <li>
                <Link
                  href="/retete/salate"
                  className="text-theme-secondary hover:text-peach transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-leaf text-xs"></i>
                  Salate
                </Link>
              </li>
              <li>
                <Link
                  href="/retete/placinte"
                  className="text-theme-secondary hover:text-peach transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-circle text-xs"></i>
                  Plăcinte
                </Link>
              </li>
              <li>
                <Link
                  href="/selectii/dietice"
                  className="text-theme-secondary hover:text-peach transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-heart text-xs"></i>
                  Mâncăruri Dietice
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-theme-primary mb-4">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <i className="fas fa-envelope text-peach"></i>
                <span className="text-theme-secondary text-sm">
                  culinariacasa@gmail.com
                </span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-phone text-peach"></i>
                <span className="text-theme-secondary text-sm">
                  +373 12 345 678
                </span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-map-marker-alt text-peach"></i>
                <span className="text-theme-secondary text-sm">
                  Bălți, Moldova
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-theme pt-8 text-center">
          <p className="text-theme-secondary text-sm mb-2">
            © 2026 Culinaria Acasă. Toate drepturile rezervate.
          </p>
          <div className="text-sm">
            <Link
              href="/privacy"
              className="text-theme-secondary hover:text-peach transition-colors duration-200"
            >
              Politica de Confidențialitate
            </Link>
            <span className="mx-2 text-theme-secondary">|</span>
            <Link
              href="/terms"
              className="text-theme-secondary hover:text-peach transition-colors duration-200"
            >
              Termeni și Condiții
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
