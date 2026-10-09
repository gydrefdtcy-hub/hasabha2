import { describe, expect, it } from "vitest";
import { parseLocalizedNumber } from "./input";

describe("localized numeric input", () => {
  it("accepts Arabic and Persian digits with Arabic decimal separators", () => {
    expect(parseLocalizedNumber("١٥٫٥", "النسبة")).toBe(15.5);
    expect(parseLocalizedNumber("۱۲٬۳۴۵.67", "السعر")).toBe(12345.67);
  });

  it("accepts ordinary decimals, signs, and scientific notation", () => {
    expect(parseLocalizedNumber("-12.5", "القيمة")).toBe(-12.5);
    expect(parseLocalizedNumber("1e3", "القيمة")).toBe(1000);
  });

  it("rejects blank values, malformed groups, and non-finite input", () => {
    expect(() => parseLocalizedNumber(" ", "السعر")).toThrow(/إدخال/);
    expect(() => parseLocalizedNumber("١٬٢٣", "السعر")).toThrow(/تنسيق/);
    expect(() => parseLocalizedNumber("Infinity", "السعر")).toThrow(/رقمية/);
    expect(() => parseLocalizedNumber("1e999", "السعر")).toThrow(/رقمية/);
  });
});
