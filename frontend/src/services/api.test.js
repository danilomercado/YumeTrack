import { describe, expect, it, vi } from "vitest";
import api from "./api";

const failingAdapter = (status, counter) => (config) => {
  counter.calls += 1;
  const error = new Error("fail");
  error.config = config;
  error.response = status ? { status, data: {}, config } : undefined;
  return Promise.reject(error);
};

describe("api", () => {
  it("agrega el token Bearer", async () => {
    localStorage.setItem("token", "abc");
    const adapter = vi.fn((config) =>
      Promise.resolve({
        data: {},
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }),
    );

    await api.get("/x", { adapter });

    expect(adapter.mock.calls[0][0].headers.Authorization).toBe("Bearer abc");
  });

  it("expone el mensaje del backend en error.message", async () => {
    const adapter = (config) => {
      const error = new Error("Request failed");
      error.config = config;
      error.response = {
        status: 400,
        data: { message: "Dato inválido" },
        config,
      };
      return Promise.reject(error);
    };

    await expect(api.post("/x", {}, { adapter })).rejects.toThrow(
      "Dato inválido",
    );
  });

  it("no reintenta requests que no son GET", async () => {
    const counter = { calls: 0 };

    await expect(
      api.post("/x", {}, { adapter: failingAdapter(503, counter) }),
    ).rejects.toThrow();

    expect(counter.calls).toBe(1);
  });
});
