import type {
  BaseHTMLAttributes,
  HtmlHTMLAttributes,
  HTMLAttributes,
  LinkHTMLAttributes,
  MetaHTMLAttributes,
  ReactNode,
  ScriptHTMLAttributes,
  StyleHTMLAttributes,
} from 'react';

export type BaseProps = BaseHTMLAttributes<HTMLBaseElement>;
export type BodyProps = HTMLAttributes<HTMLBodyElement>;
export type HtmlProps = HtmlHTMLAttributes<HTMLHtmlElement>;
export type LinkProps = LinkHTMLAttributes<HTMLLinkElement>;
export type MetaProps = MetaHTMLAttributes<HTMLMetaElement>;

export type NoscriptProps = HTMLAttributes<HTMLElement> & {
  innerHTML?: string;
};

export type ScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & {
  innerHTML?: string;
};

export type StyleProps = StyleHTMLAttributes<HTMLStyleElement> & {
  cssText?: string;
};

export type TitleProps = HTMLAttributes<HTMLTitleElement>;

export type HelmetChildProps =
  | BaseProps | BodyProps | HtmlProps | LinkProps | MetaProps | NoscriptProps
  | ScriptProps | StyleProps | TitleProps;

/**
 * Attribute arrays of the elements that may be present in DOM multiple times.
 */
export type AttributeArrayData = {
  link?: Attributes[];
  meta?: Attributes[];
  noscript?: Attributes[];
  script?: Attributes[];
  style?: Attributes[];
};

/**
 * Attributes of the elements that may be present in DOM only once.
 */
export type AttributeData = {
  base?: Attributes;
  bodyAttributes?: Attributes;
  htmlAttributes?: Attributes;
  titleAttributes?: Attributes;
};

/**
 * String data for title.
 */
export type StringData = {
  title?: string;
  titleTemplate?: string;
};

/**
 * Collection of all data for elements managed by a <Helmet> component.
 */
export type Data = AttributeArrayData & AttributeData & StringData;

export type WrappedData = { data: Data; encode: boolean };

export type HelmetTags = {
  baseTag: HTMLBaseElement[];
  linkTags: HTMLLinkElement[];
  metaTags: HTMLMetaElement[];
  noscriptTags: HTMLElement[];
  scriptTags: HTMLScriptElement[];
  styleTags: HTMLStyleElement[];
};

export type HelmetDatum<T = ReactNode> = {
  toString(): string;
  toComponent(): T;
};

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
};

// TODO: This is essentially the same type as HelmetTags, just with less detailed.
export type TagList = Record<string, HTMLElement[]>;

export type StateUpdate = HelmetTags & {
  bodyAttributes: BodyProps;
  defer: boolean;
  htmlAttributes: HtmlProps;

  // TODO: The signature of this callback is essentially the same as
  // OnChangeClientState, declared inside Helmet module; and there is
  // a circular dependency between that declaration and this StateUpdate type.
  // Also, not sure this field is really necessary inside StateUpdate?
  onChangeClientState: (newState: StateUpdate, addedTags: TagList, removedTags: TagList) => void;

  title: string;
  titleAttributes: TitleProps;
};

// TODO: Rewise the typing!
export type OnChangeClientState = (
  // TODO: So... the new state should be a map of attribute/value maps
  // for all children elements.
  newState: StateUpdate,
  addedTags: HelmetTags,
  removedTags: HelmetTags
) => void;

/**
 * A subset of <Helmet> properties, corresponding to prop arrays for
 * elements that may be present in DOM multiple times.
 */
export type HelmetPropArrays = {
  link?: LinkProps[];
  meta?: MetaProps[];
  noscript?: NoscriptProps[];
  script?: ScriptProps[];
  style?: StyleProps[];
};

export type PropArrayItem<T extends keyof HelmetPropArrays>
  = Exclude<HelmetPropArrays[T], undefined>[number];

/**
 * A subset of <Helmet> properties, corresponding to props for elements
 * that may be present in DOM a single time at most.
 */
export type HelmetPropObjects = {
  bodyAttributes?: BodyProps;
  htmlAttributes?: HtmlProps;
  titleAttributes?: TitleProps;
};

export type HelmetPropBooleans = {
  prioritizeSeoTags?: boolean;
};

/**
 * Properties accepted by <Helmet> components.
 */
export type HelmetProps = HelmetPropArrays
  & HelmetPropObjects
  & HelmetPropBooleans
  & {
    base?: BaseProps;
    children?: ReactNode;
    defaultTitle?: string;
    defer?: boolean;
    encodeSpecialCharacters?: boolean;
    onChangeClientState?: OnChangeClientState;
    title?: string;
    titleTemplate?: string;
  };

export type RegisteredHelmetPropsArray
  = Array<[id: string, props: HelmetProps]>;

/**
 * The overall Helmet state, aggregated from props of all <Helmet> instances
 * registered with the Helmet context provider.
 */
export type AggregatedState = {
  base: BaseProps | undefined;
  bodyAttributes: BodyProps | undefined;
  defer: boolean | undefined;
  encodeSpecialCharacters: boolean;
  htmlAttributes: HtmlProps | undefined;
  links: LinkProps[] | undefined;
  meta: MetaProps[] | undefined;
  noscript: NoscriptProps[] | undefined;
  onChangeClientState: OnChangeClientState | undefined;
  priority: {
    links: LinkProps[] | undefined;
    meta: MetaProps[] | undefined;
    script: ScriptProps[] | undefined;
  } | undefined;
  script: ScriptProps[] | undefined;
  style: StyleProps[] | undefined;
  title: string | undefined;
  titleAttributes: TitleProps | undefined;
};

export type MappedServerState = HelmetTags & { encode?: boolean };

/**
 * Server-side rendering context.
 */
export type HelmetDataContext = {
  helmet?: HelmetServerState;
};

/** User-provided server-side rendering context, if any. */
// context?: HelmetDataContext;

// helmets: WrappedData[];
// reEvaluate: () => void;

/**
 * The value of internal context used by Helmet to communicate between its
 * context provider and <Helmet> components within its children tree.
 */
export type ContextValue = {
  clientApply: () => void;

  /** One function to register, update, and un-register <Helmet> instances
   *  (or, more precisely their current aggregated props, aggregated between
   *  the actual props of <Helmet> instance and its children). */
  update: (id: string, props: HelmetProps | undefined) => void;
};

export type HelmetProviderHeap = {
  helmets: RegisteredHelmetPropsArray;
  nextAnimFrameId?: number;
  serverState?: HelmetServerState;
  state: AggregatedState | undefined;
};
