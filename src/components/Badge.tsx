import React from 'react';

type BadgeVariant = 'active' | 'trial' | 'expired' | 'deactivated' | 'draft' | 'completed' | 'sent' | 'pro' | 'free' | 'admin' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, string> = {
  active:      'badge badge--active',
  trial:       'badge badge--trial',
  expired:     'badge badge--expired',
  deactivated: 'badge badge--deactivated',
  draft:       'badge badge--draft',
  completed:   'badge badge--completed',
  sent:        'badge badge--sent',
  pro:         'badge badge--pro',
  free:        'badge badge--free',
  admin:       'badge badge--admin',
  default:     'badge badge--default',
};

function getVariant(status: string): BadgeVariant {
  const s = status?.toLowerCase() as BadgeVariant;
  return s in variantMap ? s : 'default';
}

export function Badge({ label, variant }: BadgeProps) {
  const v = variant ?? getVariant(label);
  return <span className={variantMap[v]}>{label}</span>;
}
