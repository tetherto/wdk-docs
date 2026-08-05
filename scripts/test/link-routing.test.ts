import test from "node:test";
import assert from "node:assert/strict";

import { shouldUseNativeDocumentNavigation } from "../../src/lib/link-routing";

test("uses native document navigation for raw text artifacts", () => {
  assert.equal(shouldUseNativeDocumentNavigation("/llms.txt"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/llms-full.txt"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/llms-full.TXT?source=docs"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/llms-full.txt#contents"), true);
});

test("keeps documentation routes on the client router", () => {
  assert.equal(shouldUseNativeDocumentNavigation("/start-building/build-with-ai/"), false);
  assert.equal(shouldUseNativeDocumentNavigation("/sdk/swidge-modules#documented-modules"), false);
  assert.equal(shouldUseNativeDocumentNavigation("/route?file=manual.txt"), false);
  assert.equal(shouldUseNativeDocumentNavigation("/route#manual.txt"), false);
  assert.equal(shouldUseNativeDocumentNavigation("#section"), false);
  assert.equal(shouldUseNativeDocumentNavigation(undefined), false);
});
