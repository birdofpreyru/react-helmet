import { type Key, type ReactNode, createElement } from 'react';

import {
  HELMET_DATA_ATTRIBUTE,
  TAG_NAMES,
  REACT_TAG_MAP,
  TAG_PROPERTIES,
  SEO_PRIORITY_TAGS,
} from './constants';

import { flattenArray, prioritizer } from './utils';

import type {
  BodyProps,
  HelmetDatum,
  HelmetHTMLBodyDatum,
  HelmetHTMLElementDatum,
  HelmetServerState,
  HtmlProps,
  MappedServerState,
} from './types';

const SELF_CLOSING_TAGS: string[] = [TAG_NAMES.NOSCRIPT, TAG_NAMES.SCRIPT, TAG_NAMES.STYLE];

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

type Attributes = Record<string, string | null | number | boolean | undefined>;

function generateElementAttributesAsString(attrs: Attributes): string {
  let res: string = '';

  for (const [name, value] of Object.entries(attrs)) {
    const neu = value === undefined ? name : `${name}="${value}"`;
    if (neu && res) res += ' ';
    res += neu;
  }

  return res;
}

const generateTitleAsString = (
  title: string,
  attrs: Attributes,
  encode: boolean,
) => {
  let attrsStr = generateElementAttributesAsString(attrs);
  if (attrsStr) attrsStr = ` ${attrsStr}`;

  const flattenedTitle = flattenArray(title);

  return `<title ${HELMET_DATA_ATTRIBUTE}="true"${attrsStr}>${
    encodeSpecialCharacters(flattenedTitle, encode)
  }</title>`;
};

// TODO: Refactor!
const generateTagsAsString = (
  type: string,
  tags: HTMLElement[],
  encode = true,
) => tags.reduce((str, t) => {
  const tag = t as unknown as Attributes;
  const attributeHtml = Object.keys(tag)
    .filter(
      (attribute) => !(attribute === TAG_PROPERTIES.INNER_HTML as string || attribute === TAG_PROPERTIES.CSS_TEXT as string),
    )
    .reduce((string, attribute) => {
      const attr = typeof tag[attribute] === 'undefined'
        ? attribute
        : `${attribute}="${encodeSpecialCharacters(tag[attribute] as string, encode)}"`;
      return string ? `${string} ${attr}` : attr;
    }, '');

  const tagContent = tag.innerHTML ?? tag.cssText ?? '';

  const isSelfClosing = !SELF_CLOSING_TAGS.includes(type);

  return `${str}<${type} ${HELMET_DATA_ATTRIBUTE}="true" ${attributeHtml}${
    isSelfClosing ? '/>' : `>${tagContent}</${type}>`
  }`;
}, '');

/**
 * Given a map of element attribute names & values it returns the corresponding
 * map of element properties & values (i.e. replacing some attribute names by
 * their corresponding property names).
 */
function mapElementAttributesToProps(
  attributes: Attributes | HTMLElement,
  ops: { addHelmetDataAttr?: boolean; addKey?: Key } = {},
): Record<string, unknown> {
  const res: Record<string, unknown> = {};
  if (ops.addHelmetDataAttr) res[HELMET_DATA_ATTRIBUTE] = true;
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

function renderTitle(title: string, attrs: Attributes): ReactNode {
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

function renderElement(type: string, attrs: HTMLElement, key?: Key): ReactNode {
  return createElement(type, mapElementAttributesToProps(attrs, {
    addHelmetDataAttr: true,
    addKey: key,
  }));
}

function renderElements(type: string, attrs: HTMLElement[]): ReactNode[] {
  const res: ReactNode[] = [];
  for (let i = 0; i < attrs.length; ++i) {
    res.push(renderElement(type, attrs[i]!, i));
  }
  return res;
}

function newHelmetDatumForAttrs(attrs: BodyProps): HelmetHTMLBodyDatum;
function newHelmetDatumForAttrs(attrs: HtmlProps): HelmetHTMLElementDatum;

function newHelmetDatumForAttrs(
  attrs: BodyProps | HtmlProps,
): HelmetHTMLBodyDatum | HelmetHTMLElementDatum {
  return {
    toComponent: () => mapElementAttributesToProps(attrs),
    toString: () => generateElementAttributesAsString(attrs),
  };
}

function newHelmetDatumForTags(
  type: string,
  attrs: HTMLElement[],
  encode: boolean,
): HelmetDatum {
  return {
    toComponent: () => renderElements(type, attrs),
    toString: () => generateTagsAsString(type, attrs, encode),
  };
}

function newHelmetDatumForTitle(
  title: string,
  attrs: Attributes = {},
  encode: boolean,
): HelmetDatum {
  return {
    toComponent: () => renderTitle(title, attrs),
    toString: () => generateTitleAsString(title, attrs, encode),
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
    base: newHelmetDatumForTags(TAG_NAMES.BASE, baseTag, encode),
    bodyAttributes: newHelmetDatumForAttrs(bodyAttributes ?? {}),
    htmlAttributes: newHelmetDatumForAttrs(htmlAttributes ?? {}),
    link: newHelmetDatumForTags(TAG_NAMES.LINK, linkTags, encode),
    meta: newHelmetDatumForTags(TAG_NAMES.META, metaTags, encode),
    noscript: newHelmetDatumForTags(TAG_NAMES.NOSCRIPT, noscriptTags, encode),
    script: newHelmetDatumForTags(TAG_NAMES.SCRIPT, scriptTags, encode),
    style: newHelmetDatumForTags(TAG_NAMES.STYLE, styleTags, encode),
    title: newHelmetDatumForTitle(title, titleAttributes, encode),
  };
}

export default mapStateOnServer;
