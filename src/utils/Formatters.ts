export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) {
    return '';
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export function formatDate(value: string | undefined): string {
  if (!value) {
    return '';
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}
