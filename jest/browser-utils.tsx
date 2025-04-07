import { type ReactNode, act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';

import Provider from '../src/Provider';
import type { HelmetDataContext } from '../src/types';

let root: Root | null = null;

export const unmount = () => {
  act(() => {
    root?.unmount();
    root = null;
  });
};

export const renderClient = (node: ReactNode, context = {}) => {
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

export const renderContextClient = (node: ReactNode) => {
  const context: HelmetDataContext = {};
  renderClient(node, context);
  return context.helmet;
};

// TODO: Get rid of this method.
export const isArray = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asymmetricMatch: (actual: any) => Array.isArray(actual),
};
