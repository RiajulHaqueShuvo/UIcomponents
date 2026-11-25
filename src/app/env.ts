/**
 * Where the site runs.
 * - BASE: path prefix without a trailing slash ('' at the domain root,
 *   '/UIcomponents' on GitHub Pages). Comes from Vite's `base`.
 * - STATIC: built for a static host (GitHub Pages) with no server, so there
 *   is no admin, no uploaded components and no documents; only the built-in library.
 */
export const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');
export const STATIC = import.meta.env.VITE_STATIC === '1';
