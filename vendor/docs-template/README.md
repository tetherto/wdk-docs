# Vendored docs-template packages

The four `@tetherto/docs-seo-*` packages in `packages/` are copied from
[tetherto/docs-template](https://github.com/tetherto/docs-template/tree/fe7c47f9f1cb60b2dd46df4ea3c7406602897080/packages)
at commit `fe7c47f9f1cb60b2dd46df4ea3c7406602897080`, retrieved on 2026-10-27.
The upstream [Apache-2.0 license](LICENSE) is included here.

The package manifests and TypeScript configurations are unmodified. The root
npm workspaces and local file dependencies resolve the
packages and their internal dependencies without GitHub Packages credentials.
Existing package imports, Next.js transpilation and the TSX build loader remain
in use; these packages export TypeScript directly.

This snapshot includes the upstream OG image-format fix, which is newer than the
previously installed `docs-seo-og@1.1.1` artifact despite sharing its version.
WDK uses the default WebP format.

Local patch: `packages/docs-seo-og/src/og-image-format.ts` accepts the installed
Takumi renderer's format type and rejects formats other than WebP, PNG and JPEG.
This keeps the snapshot type-compatible with the renderer while preventing an
unsupported output format from producing an incorrect image filename. All other
copied package files are unmodified.

To update the snapshot, copy these four package directories and the applicable
license and notices from a reviewed upstream commit. Update the source revision
above, regenerate the root lockfile with the project Node/npm versions, and run
`npm ci` and `npm run quality`. Keep project-specific changes outside the copied
package files where possible.
