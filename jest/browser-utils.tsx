import { type ReactNode, act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import Provider from '../src/Provider';
import type { HelmetDataContext, HelmetServerState } from '../src/types';

let root: Root | null = null;

export const unmount = (): void => {
  act(() => {
    root?.unmount();
    root = null;
  });
};

export const renderClient = (node: ReactNode, context = {}): void => {
  if (!root) {
    const elem = document.getElementById('mount');
    if (!elem) throw Error('Internal error');
    root = createRoot(elem);
  }

  act(() => {
    root?.render(
      <StrictMode>
        <Provider context={context}>{node}</Provider>
      </StrictMode>,
    );
  });
};

export const renderContextClient = (
  node: ReactNode,
): HelmetServerState | undefined => {
  const context: HelmetDataContext = {};
  renderClient(node, context);
  return context.helmet;
};

// TODO: Get rid of this method.
export const isArray = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asymmetricMatch: (actual: any): boolean => Array.isArray(actual),
};
