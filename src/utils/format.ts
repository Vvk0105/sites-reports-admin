export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatCurrency(amount: number | string, currency: string): string {
  const value = Number(amount);
  try {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(value);
  } catch {
    // Unknown currency code: fall back to plain number with the code.
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatPlanType(plan: string): string {
  const map: Record<string, string> = {
    free: 'Free Trial',
    trial: 'Free Trial',
    yearly: 'Yearly Pro',
    pro: 'Yearly Pro',
  };
  return map[plan?.toLowerCase()] ?? plan;
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    active: 'Active',
    trial: 'Trial',
    expired: 'Expired',
    deactivated: 'Deactivated',
    draft: 'Draft',
    completed: 'Completed',
    sent: 'Sent',
  };
  return map[status?.toLowerCase()] ?? status;
}

export function truncate(str: string | null | undefined, len = 40): string {
  if (!str) return '—';
  return str.length > len ? str.slice(0, len) + '...' : str;
}
