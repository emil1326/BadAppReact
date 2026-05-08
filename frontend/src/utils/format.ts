const FR_CA_FORMATTER = new Intl.NumberFormat('fr-CA');

export function formatNumberFr(value: number): string {
  return FR_CA_FORMATTER.format(value);
}
