import type { ContractRecurrenceMonths } from "./index";

export type ContractVisitPreview = {
  expectedDate: string;
  sequence: number;
};

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  const originalDay = next.getDate();

  next.setMonth(next.getMonth() + months);

  if (next.getDate() < originalDay) {
    next.setDate(0);
  }

  return next;
}

export function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function previewContractVisits(params: {
  startDate: string;
  recurrenceMonths: ContractRecurrenceMonths;
  occurrences: number;
}): ContractVisitPreview[] {
  const start = new Date(`${params.startDate}T00:00:00.000Z`);

  return Array.from({ length: params.occurrences }, (_, index) => {
    const expectedDate = addMonths(start, params.recurrenceMonths * index);

    return {
      expectedDate: formatDateOnly(expectedDate),
      sequence: index + 1,
    };
  });
}
