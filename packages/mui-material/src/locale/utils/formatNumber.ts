export const formatNumber = (value: number, locale?: string): string => {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
    try {
      return new Intl.NumberFormat(locale).format(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

export const buildFormatNumber = (locale: string) => {
  let formatter: Intl.NumberFormat | undefined;
  if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
    try {
      formatter = new Intl.NumberFormat(locale);
    } catch {
      // fallback to String()
    }
  }
  return (value: number) => {
    if (!Number.isFinite(value)) {
      return String(value);
    }
    return formatter ? formatter.format(value) : String(value);
  };
};
