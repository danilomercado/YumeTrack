import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./formatRelativeTime";

const secondsAgo = (seconds) => new Date(Date.now() - seconds * 1000);

describe("formatRelativeTime", () => {
  it("devuelve vacío para valores vacíos o inválidos", () => {
    expect(formatRelativeTime(null)).toBe("");
    expect(formatRelativeTime(undefined)).toBe("");
    expect(formatRelativeTime("no-es-fecha")).toBe("");
  });

  it("formatea minutos, horas y días en español", () => {
    expect(formatRelativeTime(secondsAgo(5 * 60))).toBe("hace 5 minutos");
    expect(formatRelativeTime(secondsAgo(3 * 3600))).toBe("hace 3 horas");
    expect(formatRelativeTime(secondsAgo(2 * 86400))).toBe("anteayer");
  });

  it("acepta strings ISO", () => {
    expect(formatRelativeTime(secondsAgo(2 * 3600).toISOString())).toBe(
      "hace 2 horas",
    );
  });
});
