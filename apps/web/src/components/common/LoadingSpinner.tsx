interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <i className={`fas fa-spinner fa-spin ${sizeClasses[size]} text-brown`}></i>
      {text && <p className="text-brown/70">{text}</p>}
    </div>
  );
}
