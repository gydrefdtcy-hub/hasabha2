import { describe, expect, it } from "vitest";
import {
  calculateAge,
  calculateDiscount,
  calculatePercentageChange,
  calculatePercentageOf,
  calculateValueForPercentage,
} from "./calculations";

describe("percentage calculations", () => {
  it("calculates a percentage of a number", () => {
    expect(calculatePercentageOf(15, 200)).toBe(30);
  });

  it("finds the whole when a value and its percentage are known", () => {
    expect(calculateValueForPercentage(30, 15)).toBe(200);
    expect(calculateValueForPercentage(30, 150)).toBe(20);
  });

  it("rejects a zero percentage when solving for the whole", () => {
    expect(() => calculateValueForPercentage(10, 0)).toThrow(/صفر/);
  });

  it("rejects an overflow result", () => {
    expect(() => calculatePercentageOf(200, Number.MAX_VALUE)).toThrow(
      /كبيرة جدًا/,
    );
  });

  it("calculates positive, negative, and zero change", () => {
    expect(calculatePercentageChange(80, 100)).toBe(25);
    expect(calculatePercentageChange(80, 60)).toBe(-25);
    expect(calculatePercentageChange(80, 80)).toBe(0);
  });

  it("rejects a zero starting value and non-finite values", () => {
    expect(() => calculatePercentageChange(0, 10)).toThrow(/صفر/);
    expect(() => calculatePercentageOf(Number.NaN, 10)).toThrow(/صحيحة/);
  });
});

describe("age calculation", () => {
  it("returns years, months, and days for a completed birthday", () => {
    expect(calculateAge("2000-05-10", new Date(2024, 4, 10))).toEqual({
      years: 24,
      months: 0,
      days: 0,
    });
  });

  it("adjusts the result when the birthday has not yet occurred this year", () => {
    expect(calculateAge("2000-05-10", new Date(2024, 4, 9))).toEqual({
      years: 23,
      months: 11,
      days: 29,
    });
  });

  it("handles the end of a short month and leap-day birthdays", () => {
    expect(calculateAge("2023-01-31", new Date(2023, 1, 28))).toEqual({
      years: 0,
      months: 0,
      days: 28,
    });
    expect(calculateAge("2000-02-29", new Date(2023, 2, 1))).toEqual({
      years: 23,
      months: 0,
      days: 0,
    });
  });

  it("rejects impossible, malformed, future, and invalid reference dates", () => {
    expect(() => calculateAge("2023-02-29", new Date(2024, 0, 1))).toThrow(
      /غير صالح/,
    );
    expect(() => calculateAge("not-a-date", new Date(2024, 0, 1))).toThrow(
      /صيغة صحيحة/,
    );
    expect(() => calculateAge("2025-01-01", new Date(2024, 0, 1))).toThrow(
      /المستقبل/,
    );
    expect(() => calculateAge("2000-01-01", new Date(Number.NaN))).toThrow(
      /اليوم/,
    );
  });
});

describe("discount calculations", () => {
  it("returns the discount and final price", () => {
    expect(calculateDiscount(200, 25)).toEqual({
      discountAmount: 50,
      finalPrice: 150,
    });
  });

  it("handles zero and full discounts", () => {
    expect(calculateDiscount(40, 0)).toEqual({
      discountAmount: 0,
      finalPrice: 40,
    });
    expect(calculateDiscount(40, 100)).toEqual({
      discountAmount: 40,
      finalPrice: 0,
    });
    expect(calculateDiscount(0, 20)).toEqual({
      discountAmount: 0,
      finalPrice: 0,
    });
  });

  it("rejects negative prices and percentages outside the allowed range", () => {
    expect(() => calculateDiscount(-1, 20)).toThrow(/سالب/);
    expect(() => calculateDiscount(100, -1)).toThrow(/بين 0 و100/);
    expect(() => calculateDiscount(100, 100.01)).toThrow(/بين 0 و100/);
  });
});
