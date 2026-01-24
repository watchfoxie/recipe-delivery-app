'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/hooks/useAuth';

// Navigation data
const recipeCategories = [
  { name: 'Mâncăruri cu Carne', href: '/retete/carne', icon: 'fa-drumstick-bite' },
  { name: 'Mâncăruri cu Pește', href: '/retete/peste', icon: 'fa-fish' },
  { name: 'Salate', href: '/retete/salate', icon: 'fa-leaf' },
  { name: 'Mâncăruri cu Legume', href: '/retete/legume', icon: 'fa-carrot' },
  { name: 'Plăcinte', href: '/retete/placinte', icon: 'fa-circle' },
  { name: 'Pizza', href: '/retete/pizza', icon: 'fa-pizza-slice' },
];

const selectionCategories = [
  { name: 'Mâncăruri de Crăciun', href: '/selectii/craciun', icon: 'fa-tree' },
  { name: 'Mâncăruri de Paști', href: '/selectii/pasti', icon: 'fa-egg' },
  { name: 'Mâncăruri de Post', href: '/selectii/post', icon: 'fa-seedling' },
  { name: 'Mâncăruri Dietice', href: '/selectii/dietice', icon: 'fa-heart' },
];

const ingredientCategories = [
  { name: 'Cereale', href: '/ingrediente/cereale', icon: 'fa-wheat-awn' },
  { name: 'Legume', href: '/ingrediente/legume', icon: 'fa-carrot' },
  { name: 'Condimente și ierburi', href: '/ingrediente/condimente', icon: 'fa-mortar-pestle' },
  { name: 'Fructe', href: '/ingrediente/fructe', icon: 'fa-apple-whole' },
  { name: 'Dulciuri și zahăr', href: '/ingrediente/dulciuri', icon: 'fa-candy-cane' },
  { name: 'Carne', href: '/ingrediente/carne', icon: 'fa-drumstick-bite' },
  { name: 'Pește', href: '/ingrediente/peste', icon: 'fa-fish' },
  { name: 'Lactate și ouă', href: '/ingrediente/lactate', icon: 'fa-cheese' },
  { name: 'Grăsimi și uleiuri', href: '/ingrediente/grasimi', icon: 'fa-oil-can' },
  { name: 'Nuci și semințe', href: '/ingrediente/nuci', icon: 'fa-seedling' },
  { name: 'Băuturi', href: '/ingrediente/bauturi', icon: 'fa-wine-glass' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAccountOpen(false);
    closeMenu();
    logout();
  }, [closeMenu, logout]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!isAccountOpen) return;
    
    const handleClickOutside = () => {
      setIsAccountOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAccountOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-secondary border-b-2 border-theme shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-18">
            
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/images/logo/home-cooking-logo.png"
                alt="Culinaria Acasă"
                width={64}
                height={64}
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover"
              />
              <span 
                className="hidden sm:block text-xl lg:text-2xl font-bold font-heading text-theme-primary group-hover:text-peach transition-colors duration-200"
              >
                Culinaria Acasă
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              
              {/* Rețete Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 text-theme-primary hover:text-peach transition-colors duration-200 font-medium">
                  <i className="fas fa-book-open"></i>
                  <span>Rețete</span>
                  <i className="fas fa-chevron-down text-xs ml-1 group-hover:rotate-180 transition-transform duration-200"></i>
                </button>
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 ease-out">
                  <div className="bg-theme-card border border-theme rounded-lg shadow-rustic-lg py-2 min-w-[220px]">
                    {recipeCategories.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-2.5 text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                      >
                        <i className={`fas ${item.icon} w-5 text-center`}></i>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selecții Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 text-theme-primary hover:text-mint transition-colors duration-200 font-medium">
                  <i className="fas fa-star"></i>
                  <span>Selecții</span>
                  <i className="fas fa-chevron-down text-xs ml-1 group-hover:rotate-180 transition-transform duration-200"></i>
                </button>
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 ease-out">
                  <div className="bg-theme-card border border-theme rounded-lg shadow-rustic-lg py-2 min-w-[220px]">
                    {selectionCategories.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-2.5 text-theme-primary hover:bg-mint/20 hover:text-mint transition-colors duration-200"
                      >
                        <i className={`fas ${item.icon} w-5 text-center`}></i>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ingrediente Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 text-theme-primary hover:text-pink transition-colors duration-200 font-medium">
                  <i className="fas fa-apple-whole"></i>
                  <span>Ingrediente</span>
                  <i className="fas fa-chevron-down text-xs ml-1 group-hover:rotate-180 transition-transform duration-200"></i>
                </button>
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 ease-out">
                  <div className="bg-theme-card border border-theme rounded-lg shadow-rustic-lg py-2 min-w-[220px] max-h-[400px] overflow-y-auto">
                    {ingredientCategories.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-2.5 text-theme-primary hover:bg-pink/20 hover:text-pink transition-colors duration-200"
                      >
                        <i className={`fas ${item.icon} w-5 text-center`}></i>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Link (no dropdown) */}
              <Link 
                href="/video" 
                className="flex items-center space-x-2 px-4 py-2 text-theme-primary hover:text-peach transition-colors duration-200 font-medium"
              >
                <i className="fas fa-video"></i>
                <span>Video</span>
              </Link>
            </nav>

            {/* Right Section: Search, Theme Toggle, Account, Mobile Menu */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              
              {/* Search Field (hidden on mobile) */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Caută rețete..."
                    className="w-48 lg:w-64 pl-10 pr-10 py-2 rounded-full bg-theme-input border border-theme text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-peach transition-colors duration-200"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary transition-colors"
                    aria-label="Filtre"
                  >
                    <i className="fas fa-sliders"></i>
                  </button>
                </div>
              </form>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-theme-card border border-theme flex items-center justify-center text-theme-primary hover:rotate-180 transition-all duration-300"
                aria-label={isDarkMode ? 'Schimbă la modul luminos' : 'Schimbă la modul întunecat'}
              >
                {isDarkMode ? (
                  <i className="fas fa-moon text-lg"></i>
                ) : (
                  <i className="fas fa-sun text-lg text-peach"></i>
                )}
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAccountOpen(!isAccountOpen);
                  }}
                  className="w-10 h-10 rounded-full bg-theme-card border border-theme flex items-center justify-center text-theme-primary hover:border-peach transition-colors duration-200"
                  aria-label="Cont utilizator"
                  aria-expanded={isAccountOpen}
                >
                  <i className="fas fa-user"></i>
                </button>
                
                <div 
                  className={`absolute right-0 top-full mt-2 transition-all duration-300 ease-out ${
                    isAccountOpen 
                      ? 'opacity-100 visible translate-y-0' 
                      : 'opacity-0 invisible translate-y-[-10px]'
                  }`}
                >
                  <div className="bg-theme-card border border-theme rounded-lg shadow-rustic-lg py-2 min-w-[180px]">
                    {isAuthenticated && user ? (
                      <>
                        <div className="px-4 py-2 border-b border-theme">
                          <p className="text-theme-primary font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-theme-secondary text-sm truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/profil"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                        >
                          <i className="fas fa-user w-5 text-center"></i>
                          <span>Profilul meu</span>
                        </Link>
                        <Link
                          href="/profil/retete"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                        >
                          <i className="fas fa-utensils w-5 text-center"></i>
                          <span>Rețetele mele</span>
                        </Link>
                        <Link
                          href="/profil/favorite"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                        >
                          <i className="fas fa-heart w-5 text-center"></i>
                          <span>Favorite</span>
                        </Link>
                        <Link
                          href="/profil/setari"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                        >
                          <i className="fas fa-cog w-5 text-center"></i>
                          <span>Setări</span>
                        </Link>
                        <hr className="my-1 border-theme" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2.5 w-full text-left text-theme-primary hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
                        >
                          <i className="fas fa-sign-out-alt w-5 text-center"></i>
                          <span>Deconectare</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/autentificare"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                        >
                          <i className="fas fa-sign-in-alt w-5 text-center"></i>
                          <span>Autentificare</span>
                        </Link>
                        <Link
                          href="/inregistrare"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-theme-primary hover:bg-mint/20 hover:text-mint transition-colors duration-200"
                        >
                          <i className="fas fa-user-plus w-5 text-center"></i>
                          <span>Înregistrare</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-full bg-theme-card border border-theme flex items-center justify-center text-theme-primary hover:border-peach transition-colors duration-200"
                aria-label={isMenuOpen ? 'Închide meniul' : 'Deschide meniul'}
                aria-expanded={isMenuOpen}
              >
                <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16 lg:h-18"></div>

      {/* Mobile menu backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <nav 
        className={`fixed top-16 left-0 right-0 bottom-0 bg-theme-secondary z-40 lg:hidden transform transition-transform duration-300 ease-out overflow-y-auto ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="container mx-auto px-4 py-6">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută rețete..."
                className="w-full pl-12 pr-12 py-3 rounded-full bg-theme-input border border-theme text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-peach transition-colors duration-200"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary transition-colors"
                aria-label="Filtre"
              >
                <i className="fas fa-sliders"></i>
              </button>
            </div>
          </form>

          {/* Mobile Navigation Sections */}
          <div className="space-y-6">
            
            {/* Rețete Section */}
            <div>
              <h3 className="flex items-center space-x-2 text-theme-primary font-bold text-lg mb-3">
                <i className="fas fa-book-open text-peach"></i>
                <span>Rețete</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {recipeCategories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-theme-card text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                  >
                    <i className={`fas ${item.icon} w-4 text-center`}></i>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Selecții Section */}
            <div>
              <h3 className="flex items-center space-x-2 text-theme-primary font-bold text-lg mb-3">
                <i className="fas fa-star text-mint"></i>
                <span>Selecții</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {selectionCategories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-theme-card text-theme-primary hover:bg-mint/20 hover:text-mint transition-colors duration-200"
                  >
                    <i className={`fas ${item.icon} w-4 text-center`}></i>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ingrediente Section */}
            <div>
              <h3 className="flex items-center space-x-2 text-theme-primary font-bold text-lg mb-3">
                <i className="fas fa-apple-whole text-pink"></i>
                <span>Ingrediente</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ingredientCategories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-theme-card text-theme-primary hover:bg-pink/20 hover:text-pink transition-colors duration-200"
                  >
                    <i className={`fas ${item.icon} w-4 text-center`}></i>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Video Link */}
            <div>
              <Link
                href="/video"
                onClick={closeMenu}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-theme-card text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200 font-medium"
              >
                <i className="fas fa-video text-peach"></i>
                <span>Video Rețete</span>
              </Link>
            </div>

            {/* Mobile Auth Section */}
            <div className="border-t border-theme pt-6">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="px-4 py-3 rounded-lg bg-theme-card">
                    <p className="text-theme-primary font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-theme-secondary text-sm">{user.email}</p>
                  </div>
                  <Link
                    href="/profil"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                  >
                    <i className="fas fa-user"></i>
                    <span>Profilul meu</span>
                  </Link>
                  <Link
                    href="/profil/retete"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                  >
                    <i className="fas fa-utensils"></i>
                    <span>Rețetele mele</span>
                  </Link>
                  <Link
                    href="/profil/favorite"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                  >
                    <i className="fas fa-heart"></i>
                    <span>Favorite</span>
                  </Link>
                  <Link
                    href="/profil/setari"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-theme-primary hover:bg-peach/20 hover:text-peach transition-colors duration-200"
                  >
                    <i className="fas fa-cog"></i>
                    <span>Setări</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left text-theme-primary hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Deconectare</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/autentificare"
                    onClick={closeMenu}
                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-brown text-white hover:bg-brown-dark transition-colors duration-200 font-medium"
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Autentificare</span>
                  </Link>
                  <Link
                    href="/inregistrare"
                    onClick={closeMenu}
                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-mint text-brown hover:bg-mint/80 transition-colors duration-200 font-medium"
                  >
                    <i className="fas fa-user-plus"></i>
                    <span>Înregistrare</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
