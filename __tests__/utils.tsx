import React, { type ReactNode, act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';

import Provider from '../src/Provider';

let root: Root | null = null;

export const unmount = () => {
  act(() => {
    root?.unmount();
    root = null;
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const render = (node: ReactNode, context = {} as any) => {
  if (!root) {
    const elem = document.getElementById('mount') as HTMLElement;
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

export const renderContext = (node: ReactNode) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = {} as any;
  render(node, context);
  return context.helmet;
};

export const isArray = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asymmetricMatch: (actual: any) => Array.isArray(actual),
};
