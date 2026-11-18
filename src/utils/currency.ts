import { CurrencyCode } from '../types/store';

const BDT_PER_USD = 120;

export function convertFromBaseBdt(amountBdt: number, currency: CurrencyCode): number {
  if (currency === 'USD') {
    return Math.round((amountBdt / BDT_PER_USD) * 100) / 100;
  }
  return Math.round(amountBdt);
}

export function formatMoney(amountBdt: number, currency: CurrencyCode): string {
  const val = convertFromBaseBdt(amountBdt, currency);
  if (currency === 'USD') {
    return `$${val.toLocaleString('en-US', {
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `৳${val.toLocaleString('en-US')}`;
}

export function getFreeDeliveryThresholdBdt(): number {
  return 8000;
}

export function getStandardDeliveryFeeBdt(): number {
  return 120;
}
