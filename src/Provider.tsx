import {
  type FunctionComponent,
  type ReactNode,
  createContext,
  useRef,
  useState,
} from 'react';

import { commitTagChanges } from './client';

import { IS_DOM_ENVIRONMENT } from './constants';
import { newServerState } from './server';

import type {
  ContextValue,
  HelmetProps,
  HelmetProviderHeap,
  HelmetServerState,
} from './types';

import { calcAggregatedState } from './utils';

export const Context = createContext<ContextValue | undefined>(undefined);

type ProviderProps = {
  children?: ReactNode;
  onServerState?: (state: HelmetServerState) => void;
};

const HelmetProvider: FunctionComponent<ProviderProps> = ({
  children,
  onServerState,
}) => {
  const heapRef = useRef<HelmetProviderHeap>(null);

  if (heapRef.current === null) {
    const heap: HelmetProviderHeap = {
      firstRender: true,
      helmets: [],
      state: undefined,
    };

    if (onServerState) {
      heap.serverState ??= newServerState(heap);
      onServerState(heap.serverState);
    }

    heapRef.current = heap;
  }

  const heap = heapRef.current;

  // eslint-disable-next-line react/hook-use-state
  const [contextValue] = useState<ContextValue>(() => ({
    clientApply() {
      if (IS_DOM_ENVIRONMENT && !heap.state) {
        heap.state = calcAggregatedState(heap.helmets);
        if (heap.state.defer) {
          heap.nextAnimFrameId ??= requestAnimationFrame(() => {
            heap.state ??= calcAggregatedState(heap.helmets);
            commitTagChanges(heap.state, heap.firstRender);
            heap.firstRender = false;
            delete heap.nextAnimFrameId;
          });
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
  }));

  return <Context value={contextValue}>{children}</Context>;
};

export default HelmetProvider;
