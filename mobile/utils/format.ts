export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);

export const formatPercent = (value: number, fractionDigits = 0): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}%${Math.abs(value).toLocaleString('tr-TR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
};

export const formatShortDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatMonthYear = (date = new Date()): string =>
  date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
