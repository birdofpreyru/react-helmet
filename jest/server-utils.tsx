// TODO: Remove client-side utils from this module, they belong to browser-utils
// module.

import { type ReactNode, StrictMode } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';

import Provider from '../src/Provider';
import type { HelmetDataContext } from '../src/types';

/**
 * Renders the given `node` within the provided `context` into HTML markup,
 * using server-side rendering API.
 */
export function renderServer(node: ReactNode, context = {}) {
  return renderToStaticMarkup(
    <StrictMode>
      <Provider context={context}>{node}</Provider>
    </StrictMode>,
  );
}

export function renderContextServer(node: ReactNode) {
  const context: HelmetDataContext = {};
  renderServer(node, context);
  return context.helmet;
}

// TODO: Get rid of this method.
export const isArray = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asymmetricMatch: (actual: any) => Array.isArray(actual),
};
