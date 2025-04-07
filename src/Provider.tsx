import {
  type FunctionComponent,
  type ReactNode,
  createContext,
  useRef,
} from 'react';

import type {
  ContextValue,
  HelmetDataContext,
  HelmetProps,
  HelmetProviderHeap,
} from './types';

import { newServerState } from './server';
import { IS_DOM_ENVIRONMENT } from './constants';
import { calcAggregatedState } from './utils';
import { commitTagChanges } from './client';

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
    firstRender: true,
    helmets: [],
    state: undefined,
  });

  const contextValueRef = useRef<ContextValue>(null);

  if (!contextValueRef.current) {
    contextValueRef.current = {
      clientApply() {
        if (IS_DOM_ENVIRONMENT && !heap.state) {
          heap.state = calcAggregatedState(heap.helmets);
          if (heap.state.defer) {
            if (heap.nextAnimFrameId === undefined) {
              heap.nextAnimFrameId = requestAnimationFrame(() => {
                heap.state ??= calcAggregatedState(heap.helmets);
                commitTagChanges(heap.state, heap.firstRender);
                heap.firstRender = false;
                delete heap.nextAnimFrameId;
              });
            }
          } else {
            if (heap.nextAnimFrameId !== undefined) {
              cancelAnimationFrame(heap.nextAnimFrameId);
              delete heap.nextAnimFrameId;
            }
            commitTagChanges(heap.state, heap.firstRender);
            heap.firstRender = false;
          }
        }
      },
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
};

export default HelmetProvider;
