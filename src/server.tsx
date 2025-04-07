import {
  type HTMLAttributes,
  type Key,
  type ReactNode,
  createElement,
} from 'react';

import {
  HELMET_ATTRIBUTE,
  TAG_NAMES,
  REACT_TAG_MAP,
  TAG_PROPERTIES,
  HTML_TAG_MAP,
} from './constants';

import type {
  HelmetProviderHeap,
  HelmetServerState,
  ScriptProps,
  StyleProps,
  TitleProps,
} from './types';

import {
  calcAggregatedState,
  flattenArray,
  propToAttr,
} from './utils';

const SELF_CLOSING_TAGS: string[] = [
  TAG_NAMES.NOSCRIPT,
  TAG_NAMES.SCRIPT,
  TAG_NAMES.STYLE,
];

const encodeSpecialCharacters = (str: string, encode = true) => {
  if (encode === false) {
    return String(str);
  }

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

function generateElementAttributesAsString<T>(
  attrs: HTMLAttributes<T>,
): string {
  let res: string = '';

  for (const [name, value] of Object.entries(attrs)) {
    const attr = propToAttr(name);
    const neu = value === undefined ? attr : `${attr}="${value}"`;
    if (neu && res) res += ' ';
    res += neu;
  }

  return res;
}

const generateTitleAsString = (
  title: string,
  attrs: TitleProps,
  encode: boolean,
) => {
  let attrsStr = generateElementAttributesAsString(attrs);
  if (attrsStr) attrsStr = ` ${attrsStr}`;

  const flattenedTitle = flattenArray(title);

  return `<title ${HELMET_ATTRIBUTE}="true"${attrsStr}>${
    encodeSpecialCharacters(flattenedTitle, encode)
  }</title>`;
};

function generateTagsAsString<T>(
  type: string,
  tags: HTMLAttributes<T>[],
  encode: boolean,
): string {
  let res = '';

  for (const tag of tags) {
    let attributeHtml = '';

    const entries = Object.entries(tag);
    for (const [name, value] of entries) {
      if (!(name === TAG_PROPERTIES.INNER_HTML as string
        || name === TAG_PROPERTIES.CSS_TEXT as string)) {
        const attrName = HTML_TAG_MAP[name] ?? name;
        const attr = value === undefined ? attrName : `${attrName}="${encodeSpecialCharacters(value as string, encode)}"`;
        if (attributeHtml) attributeHtml += ` ${attr}`;
        else attributeHtml = attr;
      }
    }

    const tagContent = (tag as ScriptProps).innerHTML ?? (tag as StyleProps).cssText ?? '';

    const isSelfClosing = !SELF_CLOSING_TAGS.includes(type);

    res += `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${
      isSelfClosing ? '/>' : `>${tagContent}</${type}>`
    }`;
  }

  return res;
}

/**
 * Given a map of element attribute names & values it returns the corresponding
 * map of element properties & values (i.e. replacing some attribute names by
 * their corresponding property names).
 */

function mapElementAttributesToProps<T>(
  attributes: HTMLAttributes<T>,
  ops: { addHelmetDataAttr?: boolean; addKey?: Key } = {},
): Record<string, unknown> {
  const res: Record<string, unknown> = {};
  if (ops.addHelmetDataAttr) res[HELMET_ATTRIBUTE] = true;
  if (ops.addKey !== undefined) res.key = ops.addKey;
  for (const [attrName, value] of Object.entries(attributes)) {
    const propName = REACT_TAG_MAP[attrName] ?? attrName;

    switch (propName) {
      // cssText and innerHTML props get a special treatment to avoid that React
      // escapes their values.
      case 'cssText':
      case 'innerHTML':
        res.dangerouslySetInnerHTML = { __html: value as unknown };
        break;
      default:
        res[propName] = value;
    }
  }
  return res;
}

function renderTitle(title: string, attrs: TitleProps): ReactNode {
  // NOTE: Rendered as array to match legacy behavior.
  return [
    <title
      key={title}
      {...mapElementAttributesToProps(attrs, { addHelmetDataAttr: true })}
    >
      {title}
    </title>,
  ];
}

function renderElement<T>(
  type: string,
  attrs: HTMLAttributes<T>,
  key?: Key,
): ReactNode {
  return createElement(type, mapElementAttributesToProps(attrs, {
    addHelmetDataAttr: true,
    addKey: key,
  }));
}

function renderElements<T>(
  type: string,
  attrs: HTMLAttributes<T>[],
): ReactNode[] {
  const res: ReactNode[] = [];
  for (let i = 0; i < attrs.length; ++i) {
    res.push(renderElement(type, attrs[i]!, i));
  }
  return res;
}

/*

function newHelmetDatumForTitle(
  title: string,
  attrs: Attributes = {},
  encode: boolean,
): HelmetDatum {
  return {

  };
}

const getPriorityMethods = ({
  metaTags,
  linkTags,
  scriptTags,
  encode,
}: MappedServerState) => {
  const meta = prioritizer(metaTags, SEO_PRIORITY_TAGS.meta);
  const link = prioritizer(linkTags, SEO_PRIORITY_TAGS.link);
  const script = prioritizer(scriptTags, SEO_PRIORITY_TAGS.script);

  // need to have toComponent() and toString()
  const priorityMethods = {
    toComponent: () => [
      ...renderElements(TAG_NAMES.META, meta.priority),
      ...renderElements(TAG_NAMES.LINK, link.priority),
      ...renderElements(TAG_NAMES.SCRIPT, script.priority),
    ],

    // generate all the tags as strings and concatenate them
    toString: () => `${
      generateTagsAsString(TAG_NAMES.META, meta.priority, encode)} ${
      generateTagsAsString(TAG_NAMES.LINK, link.priority, encode)} ${
      generateTagsAsString(TAG_NAMES.SCRIPT, script.priority, encode)}`,
  };

  return {
    priorityMethods,
    metaTags: meta.default as HTMLMetaElement[],
    linkTags: link.default as HTMLLinkElement[],
    scriptTags: script.default as HTMLScriptElement[],
  };
};

/*
function mapStateOnServer(props: MappedServerState): HelmetServerState {
  const {
    baseTag,
    bodyAttributes,
    encode = true,
    htmlAttributes,
    noscriptTags,
    prioritizeSeoTags,
    styleTags,
    title = '',
    titleAttributes,
  } = props;
  let { linkTags, metaTags, scriptTags } = props;
  let priorityMethods: HelmetDatum = {
    toComponent: () => null,
    toString: () => '',
  };
  if (prioritizeSeoTags) {
    ({
      priorityMethods,
      linkTags,
      metaTags,
      scriptTags,
    } = getPriorityMethods(props));
  }
  return {
    priority: priorityMethods,
  };
}
*/

// export default mapStateOnServer;

// TODO: So... refactor it, it should be based on the Helmet provider
// heap, and it should calculate its state into that, and then use it.

export function newServerState(heap: HelmetProviderHeap): HelmetServerState {
  // TODO: Should this function to be attached to the heap itself?
  const getState = () => {
    heap.state ??= calcAggregatedState(heap.helmets);
    return heap.state;
  };

  return {
    base: {
      toComponent() {
        const props = getState().base;
        return props ? renderElements('base', [props]) : [];
      },
      toString() {
        const s = getState();
        return s.base ? generateTagsAsString('base', [s.base], s.encodeSpecialCharacters) : '';
      },
    },
    bodyAttributes: {
      toComponent() {
        const props = getState().bodyAttributes;
        return mapElementAttributesToProps(props ?? {});
      },
      toString() {
        const props = getState().bodyAttributes;
        return generateElementAttributesAsString(props ?? {});
      },
    },
    htmlAttributes: {
      toComponent() {
        const props = getState().htmlAttributes;
        return mapElementAttributesToProps(props ?? {});
      },
      toString() {
        const props = getState().htmlAttributes;
        return generateElementAttributesAsString(props ?? {});
      },
    },
    link: {
      toComponent() {
        return renderElements('link', getState().links ?? []);
      },
      toString() {
        const s = getState();
        return generateTagsAsString('link', s.links ?? [], s.encodeSpecialCharacters);
      },
    },
    meta: {
      toComponent() {
        return renderElements('meta', getState().meta ?? []);
      },
      toString() {
        const s = getState();
        return generateTagsAsString('meta', s.meta ?? [], s.encodeSpecialCharacters);
      },
    },
    noscript: {
      toComponent() {
        return renderElements('noscript', getState().noscript ?? []);
      },
      toString() {
        const s = getState();
        return generateTagsAsString('noscript', s.noscript ?? [], s.encodeSpecialCharacters);
      },
    },
    priority: {
      toComponent() {
        const s = getState();
        return [
          ...renderElements('meta', s.priority?.meta ?? []),
          ...renderElements('link', s.priority?.links ?? []),
          ...renderElements('script', s.priority?.script ?? []),
        ];
      },
      toString() {
        const s = getState();
        const meta = generateTagsAsString('meta', s.priority?.meta ?? [], s.encodeSpecialCharacters);
        const link = generateTagsAsString('link', s.priority?.links ?? [], s.encodeSpecialCharacters);
        const script = generateTagsAsString('script', s.priority?.script ?? [], s.encodeSpecialCharacters);

        let res = meta;
        if (link) {
          if (res) res += ' ';
          res += link;
        }
        if (script) {
          if (res) res += ' ';
          res += script;
        }

        return res;
      },
    },
    script: {
      toComponent() {
        return renderElements('script', getState().script ?? []);
      },
      toString() {
        const s = getState();
        return generateTagsAsString('script', s.script ?? [], s.encodeSpecialCharacters);
      },
    },
    style: {
      toComponent() {
        return renderElements('style', getState().style ?? []);
      },
      toString() {
        const s = getState();
        return generateTagsAsString('style', s.style ?? [], s.encodeSpecialCharacters);
      },
    },
    title: {
      toComponent() {
        const s = getState();
        return renderTitle(s.title ?? '', s.titleAttributes ?? {});
      },
      toString() {
        const s = getState();
        return generateTitleAsString(s.title ?? '', s.titleAttributes ?? {}, s.encodeSpecialCharacters);
      },
    },
  };
}
