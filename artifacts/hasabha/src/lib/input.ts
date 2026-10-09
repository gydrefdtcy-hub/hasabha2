const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

function convertDigits(value: string, digits: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const index = digits.indexOf(digit);
    if (index >= 0) return String(index);
    return String(persianDigits.indexOf(digit));
  });
}

export function parseLocalizedNumber(value: string, label: string): number {
  if (value.trim() === "") {
    throw new Error(`يرجى إدخال ${label}.`);
  }

  let normalized = convertDigits(value.trim(), arabicDigits)
    .replaceAll("٫", ".")
    .replace(/[−﹣－]/g, "-");

  const integerPart = normalized.split(/[.eE]/, 1)[0];
  if (
    integerPart.includes("٬") &&
    !/^[+-]?\d{1,3}(?:٬\d{3})+$/.test(integerPart)
  ) {
    throw new Error(`تحقق من تنسيق الأرقام في خانة ${label}.`);
  }
  normalized = normalized.replaceAll("٬", "");

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalized)) {
    throw new Error(`يرجى إدخال قيمة رقمية صحيحة في خانة ${label}.`);
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`يرجى إدخال قيمة رقمية صحيحة في خانة ${label}.`);
  }
  return parsed;
}
