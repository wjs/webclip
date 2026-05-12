import React from 'react';

const size = 18;
const stroke = 1.5;

const iconProps = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const SelectIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path d="M13 13l6 6" />
  </svg>
);

export const RectIcon: React.FC = () => (
  <svg {...iconProps}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

export const CircleIcon: React.FC = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export const ArrowIcon: React.FC = () => (
  <svg {...iconProps}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="14 7 19 12 14 17" />
  </svg>
);

export const TextIcon: React.FC = () => (
  <svg {...iconProps}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

export const LabelIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const PenIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 18.5 3 20l1.5-4.5L17 3z" />
  </svg>
);

export const DeleteIcon: React.FC = () => (
  <svg {...iconProps}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const UndoIcon: React.FC = () => (
  <svg {...iconProps}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export const RedoIcon: React.FC = () => (
  <svg {...iconProps}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

// Weight icons — filled circles of different sizes
const weightIconProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor', stroke: 'none' };

export const WeightSmallIcon: React.FC = () => (
  <svg {...weightIconProps}>
    <circle cx="12" cy="12" r="4" />
  </svg>
);

export const WeightMediumIcon: React.FC = () => (
  <svg {...weightIconProps}>
    <circle cx="12" cy="12" r="7" />
  </svg>
);

export const WeightLargeIcon: React.FC = () => (
  <svg {...weightIconProps}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);