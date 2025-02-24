import type { HTMLAttributes, JSX, ReactNode } from 'react';

import type HelmetData from './HelmetData';

export type Attributes = Record<string, string>;

type OtherElementAttributes = Record<string, string | number | boolean | null | undefined>;

export type HtmlProps = JSX.IntrinsicElements['html'] & OtherElementAttributes;

export type BodyProps = JSX.IntrinsicElements['body'] & OtherElementAttributes;

export type LinkProps = JSX.IntrinsicElements['link'];

export type MetaProps = JSX.IntrinsicElements['meta'] & {
  charset?: string | undefined;
  'http-equiv'?: string | undefined;
  itemprop?: string | undefined;
};

export type TitleProps = HTMLAttributes<HTMLTitleElement>;

export type HelmetTags = {
  baseTag: HTMLBaseElement[];
  linkTags: HTMLLinkElement[];
  metaTags: HTMLMetaElement[];
  noscriptTags: HTMLElement[];
  scriptTags: HTMLScriptElement[];
  styleTags: HTMLStyleElement[];
}

export type HelmetDatum<T = ReactNode> = {
  toString(): string;
  toComponent(): T;
}

export type HelmetHTMLBodyDatum = HelmetDatum<HTMLAttributes<HTMLBodyElement>>;
export type HelmetHTMLElementDatum = HelmetDatum<HTMLAttributes<HTMLHtmlElement>>;

export type HelmetServerState = {
  base: HelmetDatum;
  bodyAttributes: HelmetHTMLBodyDatum;
  htmlAttributes: HelmetHTMLElementDatum;
  link: HelmetDatum;
  meta: HelmetDatum;
  noscript: HelmetDatum;
  script: HelmetDatum;
  style: HelmetDatum;
  title: HelmetDatum;

  // TODO: Why is it needed? Can't it be a part of `title` value?
  titleAttributes?: HelmetDatum;

  priority: HelmetDatum;
}

export type TagList = Record<string, HTMLElement[]>;

export type StateUpdate = HelmetTags & {
  bodyAttributes: BodyProps;
  defer: boolean;
  htmlAttributes: HtmlProps;
  onChangeClientState: (newState: StateUpdate, addedTags: TagList, removedTags: TagList) => void;
  title: string;
  titleAttributes: TitleProps;
}

export type OnChangeClientState = (
  newState: StateUpdate,
  addedTags: HelmetTags,
  removedTags: HelmetTags
) => void;

export type HelmetProps = {
  async?: boolean;
  base?: Attributes; // {"target": "_blank", "href": "http://mysite.com/"}
  bodyAttributes?: BodyProps; // {"className": "root"}
  defaultTitle?: string; // "Default Title"
  defer?: boolean; // Default: true
  encodeSpecialCharacters?: boolean; // Default: true
  helmetData?: HelmetData;
  htmlAttributes?: HtmlProps; // {"lang": "en", "amp": undefined}
  // "(newState) => console.log(newState)"
  onChangeClientState?: OnChangeClientState;
  link?: LinkProps[]; // [{"rel": "canonical", "href": "http://mysite.com/example"}]
  meta?: MetaProps[]; // [{"name": "description", "content": "Test description"}]
  noscript?: Attributes[]; // [{"innerHTML": "<img src='http://mysite.com/js/test.js'"}]
  script?: Attributes[]; // [{"type": "text/javascript", "src": "http://mysite.com/js/test.js"}]
  style?: Attributes[]; // [{"type": "text/css", "cssText": "div { display: block; color: blue; }"}]
  title?: string; // "Title"
  titleAttributes?: Attributes; // {"itemprop": "name"}
  titleTemplate?: string; // "MySite.com - %s"
  prioritizeSeoTags?: boolean; // Default: false
}

export type MappedServerState = HelmetProps & HelmetTags & { encode?: boolean };
