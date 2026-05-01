import {
  type FunctionComponent,
  type ReactNode,
  createContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { commitTagChanges } from './client';
import { newServerState } from './server';

import type {
  ContextValue,
  HelmetProps,
  HelmetServerState,
  RegisteredHelmetPropsArray,
} from './types';

import { calcAggregatedState } from './utils';

export const Context = createContext<ContextValue | undefined>(undefined);

type ProviderProps = {
  children?: ReactNode;
  onStateFactory?: (factory: HelmetServerState) => void;
};

const HelmetProvider: FunctionComponent<ProviderProps> = ({
  children,
  onStateFactory,
}) => {
  // TODO: Temporary, to keep legacy behavior to call onChange client-side
  // callback on the first render.
  const firstRenderRef = useRef(true);

  // Yeah... but then we can't extract their updates from outside
  // after the render!
  const [helmets, setHelmets] = useState<RegisteredHelmetPropsArray>([]);

  useEffect(() => {
    let nextAnimFrameId: number | undefined;
    const state = calcAggregatedState(helmets);
    if (state.defer) {
      nextAnimFrameId = requestAnimationFrame(() => {
        commitTagChanges(state, firstRenderRef.current);
        firstRenderRef.current = false;
        nextAnimFrameId = undefined;
      });
    } else {
      commitTagChanges(state, firstRenderRef.current);
      firstRenderRef.current = false;
    }
    return () => {
      if (nextAnimFrameId !== undefined) cancelAnimationFrame(nextAnimFrameId);
    };
  }, [helmets]);

  // eslint-disable-next-line react/hook-use-state
  const [contextValue] = useState<ContextValue>({
    // And this is mostly called just before .clientApply() in the same
    // useEffect() hooks, but it is also called from a regular render code
    // for server side purposes.
    update(id: string, props: HelmetProps | undefined) {
      setHelmets((prev) => {
        let res = prev;
        const idx = prev.findIndex((item) => item[0] === id);
        if (idx >= 0) {
          res = [...prev];
          if (props) res[idx]![1] = props;
          else res.splice(idx, 1);
        } else if (props) {
          res = [...prev, [id, props]];
        }
        return res;
      });
    },
  });

  // TODO: This useState() just ensures we don't call it more than once...
  // or... perhaps we shouldn't even guard against it?
  // eslint-disable-next-line react/hook-use-state
  useState(() => {
    onStateFactory?.(newServerState(heap));
  });

  if (onStateFactory && !heap.serverState) {
    heap.serverState = newServerState(heap);
    onStateFactory(heap.serverState);
  }

  return <Context value={contextValue}>{children}</Context>;
};

export default HelmetProvider;
