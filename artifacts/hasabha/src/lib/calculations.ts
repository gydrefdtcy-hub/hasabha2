export type AgeBreakdown = {
  years: number;
  months: number;
  days: number;
};

export type DiscountResult = {
  discountAmount: number;
  finalPrice: number;
};

function assertFinite(value: number, fieldName: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`أدخل قيمة رقمية صحيحة في حقل ${fieldName}.`);
  }
}

function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function daysInMonth(year: number, month: number): number {
  return utcDate(year, month + 1, 0).getUTCDate();
}

function parseISODate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new RangeError("أدخل تاريخ الميلاد بصيغة صحيحة.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    throw new RangeError("تاريخ الميلاد غير صالح.");
  }

  const parsed = utcDate(year, month, day);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    throw new RangeError("تاريخ الميلاد غير صالح.");
  }

  return { year, month, day };
}

export function calculatePercentageOf(percent: number, total: number): number {
  assertFinite(percent, "النسبة المئوية");
  assertFinite(total, "العدد");
  const result = (percent / 100) * total;
  if (!Number.isFinite(result)) {
    throw new RangeError("القيم كبيرة جدًا لإجراء هذا الحساب.");
  }
  return result;
}

export function calculateValueForPercentage(
  value: number,
  percent: number,
): number {
  assertFinite(value, "القيمة");
  assertFinite(percent, "النسبة المئوية");
  if (percent === 0) {
    throw new RangeError("لا يمكن إيجاد العدد عندما تكون النسبة صفرًا.");
  }

  const result = (value * 100) / percent;
  if (!Number.isFinite(result)) {
    throw new RangeError("القيمة كبيرة جدًا لإجراء هذا الحساب.");
  }
  return result;
}

export function calculatePercentageChange(from: number, to: number): number {
  assertFinite(from, "القيمة الأولى");
  assertFinite(to, "القيمة الثانية");
  if (from === 0) {
    throw new RangeError("لا يمكن حساب نسبة التغير عندما تكون القيمة الأولى صفرًا.");
  }

  const result = ((to - from) / Math.abs(from)) * 100;
  if (!Number.isFinite(result)) {
    throw new RangeError("القيم كبيرة جدًا لإجراء هذا الحساب.");
  }
  return result;
}

export function calculateAge(
  birthDateISO: string,
  today: Date = new Date(),
): AgeBreakdown {
  const birth = parseISODate(birthDateISO);
  if (!(today instanceof Date) || !Number.isFinite(today.getTime())) {
    throw new RangeError("تعذر التحقق من تاريخ اليوم.");
  }

  const current = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  if (
    utcDate(birth.year, birth.month, birth.day).getTime() >
    utcDate(current.year, current.month, current.day).getTime()
  ) {
    throw new RangeError("تاريخ الميلاد لا يمكن أن يكون في المستقبل.");
  }

  let years = current.year - birth.year;
  let months = current.month - birth.month;
  let days = current.day - birth.day;

  if (days < 0) {
    months -= 1;
    const previousMonth = current.month === 1 ? 12 : current.month - 1;
    const previousMonthYear =
      current.month === 1 ? current.year - 1 : current.year;
    days += daysInMonth(previousMonthYear, previousMonth);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export function calculateDiscount(
  price: number,
  percent: number,
): DiscountResult {
  assertFinite(price, "السعر الأصلي");
  assertFinite(percent, "نسبة الخصم");

  if (price < 0) {
    throw new RangeError("السعر الأصلي لا يمكن أن يكون سالبًا.");
  }
  if (percent < 0 || percent > 100) {
    throw new RangeError("نسبة الخصم يجب أن تكون بين 0 و100.");
  }

  const discountAmount = price * (percent / 100);
  return { discountAmount, finalPrice: price - discountAmount };
}
