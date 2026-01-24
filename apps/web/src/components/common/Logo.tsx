import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ variant = 'default', size = 'md' }: LogoProps) {
  const sizeConfig = {
    sm: { image: 32, text: 'text-lg' },
    md: { image: 48, text: 'text-2xl' },
    lg: { image: 60, text: 'text-3xl' },
  };
  
  const colorClasses = variant === 'light' 
    ? 'text-cream' 
    : 'text-brown';
  
  return (
    <Link href="/" className={`font-heading font-bold ${sizeConfig[size].text} ${colorClasses} flex items-center gap-2`}>
      <Image 
        src="/images/logo/home-cooking-logo.png"
        alt="Culinaria Logo"
        width={sizeConfig[size].image}
        height={sizeConfig[size].image}
        className="rounded-full"
        priority
      />
      <span>Culinaria</span>
    </Link>
  );
}
