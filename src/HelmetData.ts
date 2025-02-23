import type HelmetDispatcher from './Dispatcher';
import mapStateOnServer from './server';
import type { HelmetServerState, MappedServerState } from './types';

const instances: HelmetDispatcher[] = [];

export function clearInstances() {
  instances.length = 0;
}

type HelmetDataContext = {
  helmet: HelmetServerState;
}

export type HelmetDataType = {
  instances: HelmetDispatcher[];
  context: HelmetDataContext;
}

export const isDocument: boolean = !!(
  typeof window !== 'undefined'
  && window.document.createElement
);

export default class HelmetData implements HelmetDataType {
  instances = [];

  canUseDOM = isDocument;

  context: HelmetDataContext;

  value = {
    setHelmet: (serverState: HelmetServerState) => {
      this.context.helmet = serverState;
    },
    helmetInstances: {
      get: () => (this.canUseDOM ? instances : this.instances),
      add: (instance: HelmetDispatcher) => {
        (this.canUseDOM ? instances : this.instances).push(instance);
      },
      remove: (instance: HelmetDispatcher) => {
        const index = (this.canUseDOM ? instances : this.instances).indexOf(instance);
        (this.canUseDOM ? instances : this.instances).splice(index, 1);
      },
    },
  };

  constructor(context: HelmetDataContext, canUseDOM?: boolean) {
    this.context = context;
    this.canUseDOM = canUseDOM ?? false;

    if (!canUseDOM) {
      context.helmet = mapStateOnServer({
        baseTag: [],
        bodyAttributes: {},
        encodeSpecialCharacters: true,
        htmlAttributes: {},
        linkTags: [],
        metaTags: [],
        noscriptTags: [],
        scriptTags: [],
        styleTags: [],
        title: '',
        titleAttributes: {},
      } as MappedServerState);
    }
  }
}
