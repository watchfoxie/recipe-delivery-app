import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-3 hover:opacity-80 transition-opacity">
        <Image
          src="/images/logo/home-cooking-logo.png"
          alt="Culinaria Acasă Logo"
          width={60}
          height={60}
          className="rounded-full"
        />
        <span className="text-2xl font-display font-bold text-brown">
          Culinaria Acasă
        </span>
      </Link>
      
      {/* Auth content */}
      {children}
    </div>
  );
}
