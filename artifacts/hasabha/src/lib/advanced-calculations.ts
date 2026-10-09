export type CourseGrade = {
  gradePoints: number;
  creditHours: number;
};

export type GpaResult = {
  gpa: number;
  weightedPoints: number;
  totalCreditHours: number;
};

export type RequiredFinalResult = {
  requiredExamPercent: number;
  possible: boolean;
  alreadyMet: boolean;
};

export type CalendarDuration = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalYears: number;
};

export type DateDifferenceResult = CalendarDuration & {
  reversed: boolean;
};

export type InstallmentResult = {
  monthlyPayment: number;
  totalPayments: number;
  totalProfit: number;
};

export type SellingPriceResult = {
  sellingPrice: number;
  profit: number;
  marginPercent: number;
};

export type EndOfServiceReason = "resignation" | "other";

export type EndOfServiceResult = {
  baseAward: number;
  payableAward: number;
  resignationMultiplier: number;
  duration: CalendarDuration;
};

export type NetSalaryResult = {
  deduction: number;
  netSalary: number;
  rateApplied: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`أدخل قيمة رقمية صحيحة في خانة ${label}.`);
  }
}

function toUtcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function parseDateParts(value: string, label: string): {
  year: number;
  month: number;
  day: number;
  utc: Date;
} {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new RangeError(`اختر ${label} بصيغة تاريخ صحيحة.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = toUtcDate(year, month, day);
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() + 1 !== month ||
    utc.getUTCDate() !== day
  ) {
    throw new RangeError(`تاريخ ${label} غير صالح.`);
  }
  return { year, month, day, utc };
}

export function isValidDateOnly(value: string): boolean {
  try {
    parseDateParts(value, "المحدد");
    return true;
  } catch {
    return false;
  }
}

function daysInMonth(year: number, month: number): number {
  return toUtcDate(year, month + 1, 0).getUTCDate();
}

function addMonthsClamped(
  date: { year: number; month: number; day: number },
  amount: number,
) {
  const absoluteMonth = date.year * 12 + (date.month - 1) + amount;
  const year = Math.floor(absoluteMonth / 12);
  const month = ((absoluteMonth % 12) + 12) % 12 + 1;
  return {
    year,
    month,
    day: Math.min(date.day, daysInMonth(year, month)),
  };
}

function utcTimestamp(date: { year: number; month: number; day: number }): number {
  return toUtcDate(date.year, date.month, date.day).getTime();
}

function compareCalendarDates(
  left: { year: number; month: number; day: number },
  right: { year: number; month: number; day: number },
): number {
  return utcTimestamp(left) - utcTimestamp(right);
}

function getCalendarDuration(
  start: { year: number; month: number; day: number },
  end: { year: number; month: number; day: number },
): CalendarDuration {
  const totalDays = Math.round((utcTimestamp(end) - utcTimestamp(start)) / DAY_MS);
  let years = end.year - start.year;
  let anniversary = addMonthsClamped(start, years * 12);
  if (compareCalendarDates(anniversary, end) > 0) {
    years -= 1;
    anniversary = addMonthsClamped(start, years * 12);
  }

  let months = (end.year - anniversary.year) * 12 + end.month - anniversary.month;
  let monthMark = addMonthsClamped(anniversary, months);
  if (compareCalendarDates(monthMark, end) > 0) {
    months -= 1;
    monthMark = addMonthsClamped(anniversary, months);
  }

  const days = Math.round((utcTimestamp(end) - utcTimestamp(monthMark)) / DAY_MS);
  const totalYears = years + months / 12 + days / 365;

  return { years, months, days, totalDays, totalYears };
}

function assertFiniteResult(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`تعذر حساب ${label} بسبب كبر القيم المدخلة.`);
  }
  return value;
}

export function calculateGpa(
  courses: CourseGrade[],
  maximumGradePoints: 4 | 5,
): GpaResult {
  if (maximumGradePoints !== 4 && maximumGradePoints !== 5) {
    throw new RangeError("اختر مقياسًا دراسيًا من 4 أو 5 نقاط.");
  }
  if (!Array.isArray(courses) || courses.length === 0) {
    throw new RangeError("أضف مادة واحدة على الأقل لحساب المعدل.");
  }

  let weightedPoints = 0;
  let totalCreditHours = 0;
  for (const [index, course] of courses.entries()) {
    assertFinite(course.gradePoints, `نقاط المادة ${index + 1}`);
    assertFinite(course.creditHours, `ساعات المادة ${index + 1}`);
    if (course.gradePoints < 0 || course.gradePoints > maximumGradePoints) {
      throw new RangeError(
        `نقاط المادة ${index + 1} يجب أن تكون بين 0 و${maximumGradePoints}.`,
      );
    }
    if (course.creditHours <= 0) {
      throw new RangeError(`ساعات المادة ${index + 1} يجب أن تكون أكبر من صفر.`);
    }
    weightedPoints += course.gradePoints * course.creditHours;
    totalCreditHours += course.creditHours;
  }

  const gpa = assertFiniteResult(
    weightedPoints / totalCreditHours,
    "المعدل التراكمي",
  );
  return { gpa, weightedPoints, totalCreditHours };
}

export function calculateRequiredFinalScore(
  currentPoints: number,
  finalExamWeight: number,
  targetPoints: number,
): RequiredFinalResult {
  assertFinite(currentPoints, "الدرجة الحالية");
  assertFinite(finalExamWeight, "وزن الاختبار النهائي");
  assertFinite(targetPoints, "الدرجة المستهدفة");
  if (finalExamWeight <= 0 || finalExamWeight > 100) {
    throw new RangeError("وزن الاختبار النهائي يجب أن يكون أكبر من 0 وحتى 100.");
  }
  if (currentPoints < 0 || currentPoints > 100 - finalExamWeight) {
    throw new RangeError(
      "الدرجة الحالية يجب أن تكون بين 0 والحد الأعلى لأعمال السنة.",
    );
  }
  if (targetPoints < 0 || targetPoints > 100) {
    throw new RangeError("الدرجة المستهدفة يجب أن تكون بين 0 و100.");
  }

  const pointsNeeded = Math.max(0, targetPoints - currentPoints);
  const requiredExamPercent = assertFiniteResult(
    (pointsNeeded / finalExamWeight) * 100,
    "الدرجة المطلوبة",
  );
  return {
    requiredExamPercent,
    possible: requiredExamPercent <= 100,
    alreadyMet: targetPoints <= currentPoints,
  };
}

export function calculateDateDifference(
  firstDateISO: string,
  secondDateISO: string,
): DateDifferenceResult {
  const first = parseDateParts(firstDateISO, "التاريخ الأول");
  const second = parseDateParts(secondDateISO, "التاريخ الثاني");
  const reversed = compareCalendarDates(first, second) > 0;
  const start = reversed ? second : first;
  const end = reversed ? first : second;
  return { ...getCalendarDuration(start, end), reversed };
}

export function calculateMonthlyInstallment(
  principal: number,
  annualRatePercent: number,
  numberOfMonths: number,
): InstallmentResult {
  assertFinite(principal, "مبلغ التمويل");
  assertFinite(annualRatePercent, "النسبة السنوية");
  assertFinite(numberOfMonths, "مدة التمويل");
  if (principal <= 0) {
    throw new RangeError("مبلغ التمويل يجب أن يكون أكبر من صفر.");
  }
  if (annualRatePercent < 0) {
    throw new RangeError("النسبة السنوية لا يمكن أن تكون سالبة.");
  }
  if (!Number.isSafeInteger(numberOfMonths) || numberOfMonths <= 0) {
    throw new RangeError("مدة التمويل يجب أن تكون عددًا صحيحًا من الأشهر.");
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? principal / numberOfMonths
      : (principal * monthlyRate) /
        (1 - (1 + monthlyRate) ** -numberOfMonths);
  const checkedPayment = assertFiniteResult(monthlyPayment, "القسط الشهري");
  const totalPayments = assertFiniteResult(
    checkedPayment * numberOfMonths,
    "إجمالي المدفوعات",
  );
  return {
    monthlyPayment: checkedPayment,
    totalPayments,
    totalProfit: totalPayments - principal,
  };
}

export function calculateSellingPriceForMargin(
  cost: number,
  marginPercent: number,
): SellingPriceResult {
  assertFinite(cost, "التكلفة");
  assertFinite(marginPercent, "هامش الربح");
  if (cost < 0) {
    throw new RangeError("التكلفة لا يمكن أن تكون سالبة.");
  }
  if (marginPercent < 0 || marginPercent >= 100) {
    throw new RangeError("هامش الربح يجب أن يكون من 0 وأقل من 100.");
  }

  const sellingPrice = assertFiniteResult(
    cost / (1 - marginPercent / 100),
    "سعر البيع",
  );
  return {
    sellingPrice,
    profit: sellingPrice - cost,
    marginPercent,
  };
}

export function calculateEndOfServiceBenefit(
  monthlyWage: number,
  serviceStartISO: string,
  serviceEndISO: string,
  reason: EndOfServiceReason,
): EndOfServiceResult {
  assertFinite(monthlyWage, "الأجر الشهري الأخير");
  if (monthlyWage < 0) {
    throw new RangeError("الأجر الشهري لا يمكن أن يكون سالبًا.");
  }
  if (reason !== "resignation" && reason !== "other") {
    throw new RangeError("اختر سبب انتهاء الخدمة.");
  }

  const start = parseDateParts(serviceStartISO, "بداية الخدمة");
  const end = parseDateParts(serviceEndISO, "نهاية الخدمة");
  if (compareCalendarDates(start, end) > 0) {
    throw new RangeError("تاريخ نهاية الخدمة يجب ألا يسبق تاريخ بدايتها.");
  }

  const duration = getCalendarDuration(start, end);
  const years = duration.totalYears;
  const baseAward =
    monthlyWage *
    (0.5 * Math.min(years, 5) + Math.max(years - 5, 0));
  let resignationMultiplier = 1;
  if (reason === "resignation") {
    if (years < 2) resignationMultiplier = 0;
    else if (years <= 5) resignationMultiplier = 1 / 3;
    else if (years < 10) resignationMultiplier = 2 / 3;
  }

  return {
    baseAward: assertFiniteResult(baseAward, "مكافأة نهاية الخدمة"),
    payableAward: assertFiniteResult(
      baseAward * resignationMultiplier,
      "مكافأة نهاية الخدمة",
    ),
    resignationMultiplier,
    duration,
  };
}

export function calculateSaudiNetSalary(
  monthlySalary: number,
  isSaudi: boolean,
  employeeRatePercent = 9.75,
): NetSalaryResult {
  assertFinite(monthlySalary, "الراتب الشهري");
  assertFinite(employeeRatePercent, "نسبة الاستقطاع");
  if (monthlySalary < 0) {
    throw new RangeError("الراتب الشهري لا يمكن أن يكون سالبًا.");
  }
  if (employeeRatePercent < 0 || employeeRatePercent > 100) {
    throw new RangeError("نسبة الاستقطاع يجب أن تكون بين 0 و100.");
  }

  const rateApplied = isSaudi ? employeeRatePercent : 0;
  const deduction = assertFiniteResult(
    monthlySalary * (rateApplied / 100),
    "استقطاع التأمينات",
  );
  return {
    deduction,
    netSalary: monthlySalary - deduction,
    rateApplied,
  };
}
