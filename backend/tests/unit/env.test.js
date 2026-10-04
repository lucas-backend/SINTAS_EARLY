import { describe, expect, it } from "vitest";
import { parseEnv } from "../../src/config/env.js";

describe("environment configuration", () => {
  it("rejects malformed environment values", () => {
    expect(() =>
      parseEnv({ DATABASE_URL: "not-a-url", PORT: "invalid" }),
    ).toThrow();
  });

  it("parses the required configuration", () => {
    expect(
      parseEnv({
        DATABASE_URL: "mysql://user:pass@localhost:3306/app",
        PORT: "4000",
      }),
    ).toMatchObject({
      DATABASE_URL: "mysql://user:pass@localhost:3306/app",
      PORT: 4000,
    });
  });

  it("rejects the development secret and localhost CORS in production", () => {
    expect(() =>
      parseEnv({
        NODE_ENV: "production",
        DATABASE_URL: "mysql://user:pass@localhost:3306/app",
      }),
    ).toThrow();
  });

  it("defaults TRUST_PROXY to false so a bare app trusts no proxy hop", () => {
    expect(
      parseEnv({ DATABASE_URL: "mysql://user:pass@localhost:3306/app" }),
    ).toMatchObject({ TRUST_PROXY: false });
  });

  it("parses TRUST_PROXY as a boolean, hop count, or trusted proxy list", () => {
    const base = { DATABASE_URL: "mysql://user:pass@localhost:3306/app" };
    expect(parseEnv({ ...base, TRUST_PROXY: "true" })).toMatchObject({
      TRUST_PROXY: true,
    });
    expect(parseEnv({ ...base, TRUST_PROXY: "1" })).toMatchObject({
      TRUST_PROXY: 1,
    });
    expect(
      parseEnv({ ...base, TRUST_PROXY: "10.0.0.1, 192.168.0.0/16" }),
    ).toMatchObject({ TRUST_PROXY: ["10.0.0.1", "192.168.0.0/16"] });
  });
});
