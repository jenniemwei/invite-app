import { describe, expect, it } from "vitest";
import { guardOrigin } from "../src/lib/server/http";
describe("mutation origin checks", () => {
  it("accepts a same-origin request when Next normalizes the internal hostname", () => {
    expect(() =>
      guardOrigin(
        new Request("http://localhost:3100/api/events", {
          headers: { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100" },
        }),
      ),
    ).not.toThrow();
  });
  it("accepts same-origin HTTPS through the hosting proxy", () => {
    expect(() =>
      guardOrigin(
        new Request("http://localhost/api/events", {
          headers: {
            host: "invite.example.com",
            origin: "https://invite.example.com",
            "x-forwarded-proto": "https",
          },
        }),
      ),
    ).not.toThrow();
  });
  it("rejects cross-origin or missing-origin browser mutations", () => {
    for (const origin of ["https://unrelated.example", ""]) {
      expect(() =>
        guardOrigin(
          new Request("http://localhost:3100/api/events", {
            headers: { host: "localhost:3100", origin },
          }),
        ),
      ).toThrow(/verified/);
    }
  });
});
