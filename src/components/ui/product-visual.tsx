import { useState } from 'react';
import { Cable, Keyboard, Laptop, Monitor, Package } from 'lucide-react';

function productIcon(name: string) {
  const value = name.toLowerCase();
  if (value.includes('keyboard')) return Keyboard;
  if (value.includes('monitor')) return Monitor;
  if (value.includes('stand')) return Laptop;
  if (value.includes('hub') || value.includes('usb')) return Cable;
  return Package;
}

export function ProductVisual({
  name,
  size = 'sm',
  src,
}: {
  name: string;
  size?: 'sm' | 'lg';
  src?: string;
}) {
  const Icon = productIcon(name);
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return (
      <div className={`product-visual product-visual-${size} has-product-image`}>
        <img src={src} alt={name} onError={() => setBroken(true)} />
      </div>
    );
  }

  return (
    <div className={`product-visual product-visual-${size}`} aria-label={`${name} preview`}>
      <div className="product-visual-glow" />
      <Icon aria-hidden="true" />
      <span>{name.split(' ').slice(0, 2).join(' ')}</span>
    </div>
  );
}
