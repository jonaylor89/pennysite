import { describe, expect, it } from "vitest";
import {
  calculateCreditsFromTokens,
  estimateGenerationCredits,
} from "./config";

describe("calculateCreditsFromTokens", () => {
  it("should include base cost with zero tokens", () => {
    const credits = calculateCreditsFromTokens(0, 0);
    expect(credits).toBe(5); // BASE_CREDITS_PER_GENERATION
  });

  it("should calculate correctly for typical generation", () => {
    // 2000 input tokens * 0.001 = 2 credits
    // 8000 output tokens * 0.005 = 40 credits
    // Base = 5 credits
    // Total = 47 credits
    const credits = calculateCreditsFromTokens(2000, 8000);
    expect(credits).toBe(47);
  });

  it("should round up fractional credits", () => {
    // 100 input * 0.001 = 0.1
    // 100 output * 0.005 = 0.5
    // Base = 5
    // Total = 5.6 -> rounds to 6
    const credits = calculateCreditsFromTokens(100, 100);
    expect(credits).toBe(6);
  });

  it("should handle large generations", () => {
    // 10000 input * 0.001 = 10
    // 20000 output * 0.005 = 100
    // Base = 5
    // Total = 115
    const credits = calculateCreditsFromTokens(10000, 20000);
    expect(credits).toBe(115);
  });

  it("should never return less than base cost", () => {
    const credits = calculateCreditsFromTokens(0, 0);
    expect(credits).toBeGreaterThanOrEqual(5);
  });
});

describe("estimateGenerationCredits", () => {
  it("should return min, typical, and max estimates", () => {
    const estimates = estimateGenerationCredits();

    expect(estimates.min).toBeGreaterThan(0);
    expect(estimates.typical).toBeGreaterThan(estimates.min);
    expect(estimates.max).toBeGreaterThan(estimates.typical);
  });

  it("should have reasonable bounds", () => {
    const estimates = estimateGenerationCredits();

    expect(estimates.min).toBeLessThan(50);
    expect(estimates.typical).toBeLessThan(100);
    expect(estimates.max).toBeLessThanOrEqual(150);
  });
});
