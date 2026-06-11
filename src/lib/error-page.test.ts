/**
 * Tests for src/lib/error-page.ts — renderErrorPage().
 *
 * The function returns a static HTML string that is served when the
 * application crashes before React mounts. Tests act as a contract so
 * the page remains a valid HTML document and preserves the key UX
 * elements (reload button, home link).
 */
import { describe, expect, it } from "vitest";
import { renderErrorPage } from "./error-page";

describe("renderErrorPage()", () => {
  let html: string;

  it("returns a string", () => {
    html = renderErrorPage();
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(100);
  });

  it("is a valid HTML5 document (has doctype, html, head, body)", () => {
    html = renderErrorPage();
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toMatch(/<html/i);
    expect(html).toMatch(/<head>/i);
    expect(html).toMatch(/<body>/i);
    expect(html).toMatch(/<\/html>/i);
  });

  it("contains a <title> tag", () => {
    expect(renderErrorPage()).toMatch(/<title>/);
  });

  it("contains a reload (Try again) interactive element", () => {
    expect(renderErrorPage()).toMatch(/location\.reload\(\)/);
  });

  it("contains a link back to the home route", () => {
    expect(renderErrorPage()).toMatch(/href="\/"/);
  });

  it("sets charset and viewport meta tags", () => {
    const page = renderErrorPage();
    expect(page).toMatch(/charset/i);
    expect(page).toMatch(/viewport/i);
  });

  it("is deterministic — two calls produce identical output", () => {
    expect(renderErrorPage()).toBe(renderErrorPage());
  });
});
