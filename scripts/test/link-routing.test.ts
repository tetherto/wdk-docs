import test from "node:test";
import assert from "node:assert/strict";

import { shouldUseNativeDocumentNavigation } from "../../src/lib/link-routing";
import { rewriteDocsUrl, transformInkeepSource } from "../../src/lib/inkeep";

test("uses native document navigation for raw text and JSON artifacts", () => {
  assert.equal(shouldUseNativeDocumentNavigation("/llms.txt"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/llms-full.txt"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/llms-full.TXT?source=docs"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/llms-full.txt#contents"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/assets/indexer-api/openapi.json"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/assets/indexer-api/openapi.provenance.JSON?download=1"), true);
});

test("keeps documentation routes on the client router", () => {
  assert.equal(shouldUseNativeDocumentNavigation("/start-building/build-with-ai/"), false);
  assert.equal(shouldUseNativeDocumentNavigation("/sdk/swidge-modules#documented-modules"), false);
  assert.equal(shouldUseNativeDocumentNavigation("/route?file=manual.txt"), false);
  assert.equal(shouldUseNativeDocumentNavigation("/route?file=openapi.json"), false);
  assert.equal(shouldUseNativeDocumentNavigation("/route#manual.txt"), false);
  assert.equal(shouldUseNativeDocumentNavigation("#section"), false);
  assert.equal(shouldUseNativeDocumentNavigation(undefined), false);
});

function withDocsOrigin(origin: string, run: () => void) {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { origin } },
  });

  try {
    run();
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

for (const origin of ["https://wdk-docs-preview.kinsta.page", "https://docs.wdk.tether.io"]) {
  test(`preserves main-site contributor links on ${origin}`, () => {
    withDocsOrigin(origin, () => {
      const url = "https://wdk.tether.io/partners";
      assert.equal(rewriteDocsUrl(url), url);
      assert.deepEqual(
        transformInkeepSource(
          { url, title: "Tech Contributors", description: undefined, breadcrumbs: [], type: "site" },
          "searchResultItem",
        ),
        {},
      );
    });
  });

  test(`localizes documentation aliases on ${origin}`, () => {
    withDocsOrigin(origin, () => {
      for (const host of ["wallet.tether.io", "docs.wallet.tether.io", "docs.wdk.tether.io"]) {
        assert.equal(
          rewriteDocsUrl(`https://${host}/tools/create-wdk-module/?source=search#submission`),
          `${origin}/tools/create-wdk-module/?source=search#submission`,
        );
      }
    });
  });
}

test("leaves unrelated, relative and malformed links unchanged", () => {
  for (const url of ["https://example.com/partners", "/tools/create-wdk-module/", "not a URL"]) {
    assert.equal(rewriteDocsUrl(url), url);
  }
});
