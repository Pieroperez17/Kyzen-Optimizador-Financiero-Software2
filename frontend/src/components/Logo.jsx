import { useId } from 'react';

export default function Logo({ size = 36 }) {
  const identifier = useId().replace(/:/g, '');
  const gradient = `kyzen-gradient-${identifier}`;
  const shine = `kyzen-shine-${identifier}`;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Kyzen">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.55" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={shine} x1="32" y1="0" x2="32" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${gradient})`} />
      <rect width="64" height="32" rx="18" fill={`url(#${shine})`} />
      <rect x="15" y="14" width="9" height="36" rx="4.5" fill="#ffffff" />
      <path d="M28 35.5 L44.5 19" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" />
      <path d="M37 17 H47 V27" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M31.5 37.5 L45 50" stroke="#c7d2fe" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}
