interface BrandMarkProps {
  className?: string;
  size?: number;
  loading?: 'eager' | 'lazy';
  variant?: 'symbol' | 'full';
}

export default function BrandMark({
  className = '',
  size = 40,
  loading = 'eager',
  variant = 'symbol',
}: BrandMarkProps) {
  const source = variant === 'full'
    ? '/assets/techland-official-logo-v2.webp'
    : '/assets/techland-symbol-v2.png';

  return (
    <img
      className={className}
      src={source}
      alt=""
      width={size}
      height={size}
      loading={loading}
      decoding="async"
    />
  );
}
