export enum TAG_PROPERTIES {
  CHARSET = 'charset',
  CSS_TEXT = 'cssText',
  HREF = 'href',
  HTTPEQUIV = 'http-equiv',
  INNER_HTML = 'innerHTML',
  ITEM_PROP = 'itemprop',
  NAME = 'name',
  PROPERTY = 'property',
  REL = 'rel',
  SRC = 'src',
}

export enum ATTRIBUTE_NAMES {
  BODY = 'bodyAttributes',
  HTML = 'htmlAttributes',
  TITLE = 'titleAttributes',
}

export enum TAG_NAMES {
  BASE = 'base',
  BODY = 'body',
  HEAD = 'head',
  HTML = 'html',
  LINK = 'link',
  META = 'meta',
  NOSCRIPT = 'noscript',
  SCRIPT = 'script',
  STYLE = 'style',
  TITLE = 'title',
  FRAGMENT = 'Symbol(react.fragment)',
}

export const SEO_PRIORITY_TAGS = {
  link: { rel: ['amphtml', 'canonical', 'alternate'] },
  script: { type: ['application/ld+json'] },
  meta: {
    charset: '',
    name: ['generator', 'robots', 'description'],
    property: [
      'og:type',
      'og:title',
      'og:url',
      'og:image',
      'og:image:alt',
      'og:description',
      'twitter:url',
      'twitter:title',
      'twitter:description',
      'twitter:image',
      'twitter:image:alt',
      'twitter:card',
      'twitter:site',
    ],
  },
};

export const VALID_TAG_NAMES = Object.values(TAG_NAMES);

/**
 * The mapping of HTML attribute names to the corresponding element properties,
 * for the names that do not match their corresponding properties.
 */
export const REACT_TAG_MAP: Record<string, string> = {
  accesskey: 'accessKey',
  charset: 'charSet',
  class: 'className',
  contenteditable: 'contentEditable',
  contextmenu: 'contextMenu',
  'http-equiv': 'httpEquiv',
  itemprop: 'itemProp',
  tabindex: 'tabIndex',
};

/**
 * The mapping reverse of REACT_TAG_MAP.
 */
export const HTML_TAG_MAP = (() => {
  const res: Record<string, string> = {};
  for (const [key, value] of Object.entries(REACT_TAG_MAP)) {
    res[value] = key;
  }
  return res;
})();

export const HELMET_ATTRIBUTE = 'data-rh';

export const IS_DOM_ENVIRONMENT = !!(
  typeof window !== 'undefined'
  && window.document.createElement
);
