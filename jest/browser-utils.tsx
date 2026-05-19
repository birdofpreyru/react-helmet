import {
  type FunctionComponent,
  type ReactNode,
  StrictMode,
  act,
} from 'react';

import { type Root, createRoot } from 'react-dom/client';

import Provider from '../src/Provider';
import type { HelmetServerState } from '../src/types';

let root: Root | null = null;

export const unmount = (): void => {
  act(() => {
    root?.unmount();
    root = null;
  });
};

type WrapperProps = {
  children?: ReactNode;
  onServerState?: (state: HelmetServerState) => void;
};

const Wrapper: FunctionComponent<WrapperProps> = ({
  children,
  onServerState,
}) => (
  <StrictMode>
    <Provider onServerState={onServerState}>{children}</Provider>
  </StrictMode>
);

export const renderClient = (
  node: ReactNode,
  onServerState?: (state: HelmetServerState) => void,
): void => {
  if (!root) {
    const elem = document.getElementById('mount');
    if (!elem) throw Error('Internal error');
    root = createRoot(elem);
  }

  act(() => {
    root?.render(<Wrapper onServerState={onServerState}>{node}</Wrapper>);
  });
};

export const renderContextClient = (
  node: ReactNode,
): HelmetServerState | undefined => {
  let state: HelmetServerState | undefined;
  renderClient(node, (s) => {
    state = s;
  });
  return state;
};

// TODO: Get rid of this method.
export const isArray = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asymmetricMatch: (actual: any): boolean => Array.isArray(actual),
};
