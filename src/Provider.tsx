import {
  type FunctionComponent,
  type ReactNode,
  createContext,
  useRef,
} from 'react';

import type {
  AggregatedState,
  ContextValue,
  HelmetDataContext,
  HelmetProps,
  HelmetProviderHeap,
  HelmetServerState,
} from './types';

import { newServerState } from './server';

export const Context = createContext<ContextValue | undefined>(undefined);

type ProviderProps = {
  children?: ReactNode;
  context?: HelmetDataContext;
};

const HelmetProvider: FunctionComponent<ProviderProps> = ({
  children,
  context,
}) => {
  const { current: heap } = useRef<HelmetProviderHeap>({
    helmets: [],
    state: undefined,
  });

  const contextValueRef = useRef<ContextValue>(null);

  if (!contextValueRef.current) {
    contextValueRef.current = {
      update(id: string, props: HelmetProps | undefined) {
        const idx = heap.helmets.findIndex((item) => item[0] === id);
        if (idx >= 0) {
          delete heap.state;
          if (props) heap.helmets[idx]![1] = props;
          else heap.helmets.splice(idx, 1);
        } else if (props) {
          delete heap.state;
          heap.helmets.push([id, props]);
        }
      },
    };
  }

  if (context && (!context.helmet || context.helmet !== heap.serverState)) {
    heap.serverState ??= newServerState(heap);
    context.helmet = heap.serverState;
  }

  return <Context value={contextValueRef.current}>{children}</Context>;

  /*
  if (!contextValueRef.current) {
    contextValueRef.current = {
      context,
      helmets: [],
      reEvaluate: () => undefined,
    };

    if (context) context.helmet = newServerState(contextValueRef.current);
  }

  */
};

export default HelmetProvider;
