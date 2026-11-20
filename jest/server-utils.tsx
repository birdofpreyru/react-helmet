// TODO: Remove client-side utils from this module, they belong to browser-utils
// module.

import { type ReactNode, StrictMode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Provider from '../build/Provider.js';
import type { HelmetServerState } from '../build/types.js';

/**
 * Renders the given `node` within the provided `context` into HTML markup,
 * using server-side rendering API.
 */
export function renderServer(
  node: ReactNode,
  onServerState?: (state: HelmetServerState) => void,
): string {
  return renderToStaticMarkup(
    <StrictMode>
      <Provider onServerState={onServerState}>{node}</Provider>
    </StrictMode>,
  );
}

export function renderContextServer(
  node: ReactNode,
): HelmetServerState | undefined {
  let state: HelmetServerState | undefined;
  renderServer(node, (s) => {
    state = s;
  });
  return state;
}

// TODO: Get rid of this method.
export const isArray = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asymmetricMatch: (actual: any): boolean => Array.isArray(actual),
};
