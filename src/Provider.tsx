import {
  type FunctionComponent,
  type ReactNode,
  createContext,
  useRef,
} from 'react';

import HelmetData, { isDocument, type HelmetDataContext } from './HelmetData';

const defaultValue = {};

export const Context = createContext(defaultValue);

type ProviderProps = {
  children?: ReactNode;
  context?: Partial<HelmetDataContext>;
}

type HelmetProviderT = FunctionComponent<ProviderProps> & {
  canUseDOM: boolean;
};

const HelmetProvider = (({
  children,
  context,
}) => {
  const helmetDataRef = useRef<HelmetData>(null);

  if (!helmetDataRef.current) {
    helmetDataRef.current = new HelmetData(context ?? {}, HelmetProvider.canUseDOM);
  }

  return <Context value={helmetDataRef.current.value}>{children}</Context>;
}) as HelmetProviderT;

HelmetProvider.canUseDOM = isDocument;

export default HelmetProvider;
