import { TAG_NAMES, TAG_PROPERTIES, ATTRIBUTE_NAMES, HTML_TAG_MAP, SEO_PRIORITY_TAGS } from './constants';

import type {
  AggregatedState,
  AttributeArrayData,
  AttributeData,
  Attributes,
  BaseProps,
  ContextValue,
  Data,
  EmptyObject,
  HelmetPropArrays,
  HelmetPropBooleans,
  HelmetPropObjects,
  HelmetProps,
  HelmetServerState,
  LinkProps,
  MetaProps,
  PropArrayItem,
  RegisteredHelmetPropsArray,
  ScriptProps,
  WrappedData,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PropList = Record<string, any>;

type PropsList = PropList[];
type AttributeList = string[];

type SeenTags<T extends keyof HelmetPropArrays> = {
  [key in keyof PropArrayItem<T>]?: Record<string, boolean>
};

type MatchProps = Record<string, string | AttributeList>;

const HELMET_PROPS = {
  DEFAULT_TITLE: 'defaultTitle',
  DEFER: 'defer',
  ENCODE_SPECIAL_CHARACTERS: 'encodeSpecialCharacters',
  ON_CHANGE_CLIENT_STATE: 'onChangeClientState',
  TITLE_TEMPLATE: 'titleTemplate',
  PRIORITIZE_SEO_TAGS: 'prioritizeSeoTags',
};

/**
 * Finds the last object in the given array of registered props,
 * that has the specified prop defined, and returns the value of
 * that prop in that object. Returns `undefined` if no prop object
 * has that prop defined.
 */
function getInnermostProperty<T extends keyof HelmetProps>(
  props: RegisteredHelmetPropsArray,
  propName: T,
): HelmetProps[T] | undefined {
  for (let i = props.length - 1; i >= 0; --i) {
    const value = props[i]![1][propName];
    if (value !== undefined) return value;
  }
}

export function getTitleFromPropsList(
  props: RegisteredHelmetPropsArray,
): string | undefined {
  let innermostTitle = getInnermostProperty(props, TAG_NAMES.TITLE);

  const innermostTemplate = getInnermostProperty(
    props,
    'titleTemplate',
  );

  if (Array.isArray(innermostTitle)) {
    innermostTitle = innermostTitle.join('');
  }
  if (innermostTemplate && innermostTitle) {
    // use function arg to avoid need to escape $ characters
    return innermostTemplate.replace(/%s/g, innermostTitle);
  }

  const innermostDefaultTitle = getInnermostProperty(
    props,
    'defaultTitle',
  );

  return innermostTitle ?? innermostDefaultTitle ?? undefined;
}

/**
 * Merges together attributes provided for the same element by different Helmet
 * instances. Attributes provided by later registered Helmet instances overwrite
 * the same attributes provided by the earlier registered instances.
 */
export function mergeAttributes<T extends keyof HelmetPropObjects>(
  element: T,
  props: RegisteredHelmetPropsArray,
): HelmetProps[T] {
  const res: HelmetProps[T] = {};
  for (const item of props) {
    const attrs = item[1][element];
    if (attrs) Object.assign(res, attrs);
  }
  return res;
}

/**
 * Finds the latest registered Helmet instance with `base` props provided,
 * and with its `href` value set, and returns those `base` props.
 * NOTE: Based on the legacy getBaseTagFromPropsList().
 */
export function aggregateBaseProps(
  props: RegisteredHelmetPropsArray,
): BaseProps | undefined {
  for (let i = props.length - 1; i >= 0; --i) {
    const res = props[i]![1].base;
    if (res?.href) return res;
  }
}

const warn = (msg: string) => console && typeof console.warn === 'function' && console.warn(msg);

/**
 * Determines the primary key in the given `props` object, accoding to the given
 * array of valid primary keys for the kind of props object.
 * TODO: Rather than passing an array of primaryProps around, it might be more
 * simple to just have a dedicated function for each possible kind of that
 * object.
 */
function getPrimaryProp<T extends keyof HelmetPropArrays>(
  props: PropArrayItem<T>,
  primaryProps: Array<keyof PropArrayItem<T>>,
): keyof PropArrayItem<T> | null {
  // Looks up for the "primary attribute" key.
  let primaryAttributeKey: keyof PropArrayItem<T> | undefined;

  // TODO: Perhaps also check that the value of attribute being selected
  // as primary is actually defined? Right now, it implicitly assumes that
  // in such case the attribute is just not present as a key in `props`.
  for (const [keyString, value] of Object.entries(props)) {
    const key = keyString as keyof PropArrayItem<T>;

    // Special rule with link tags, since rel and href are both primary tags,
    // rel takes priority
    if (primaryProps.includes(key)
      && !(
        key === TAG_PROPERTIES.REL
        && (value as string).toLowerCase() === 'canonical'
      )
      && !(
        key === TAG_PROPERTIES.REL
        && (value as string).toLowerCase() === 'stylesheet'
      )
    ) primaryAttributeKey = key;

    // Special case for innerHTML which doesn't work lowercased
    if (
      primaryProps.includes(key)
      && (key === TAG_PROPERTIES.INNER_HTML
        || key === TAG_PROPERTIES.CSS_TEXT
        || key === TAG_PROPERTIES.ITEM_PROP)
    ) primaryAttributeKey = key;
  }

  return primaryAttributeKey ?? null;
}

export function getTagsFromPropsList<T extends keyof HelmetPropArrays>(
  tagName: T,
  primaryAttributes: Array<keyof PropArrayItem<T>>,
  propsArray: RegisteredHelmetPropsArray,
): HelmetPropArrays[T] {
  // Calculate list of tags, giving priority innermost component
  // (end of the propslist)
  const approvedSeenTags: SeenTags<T> = {};

  // TODO: Well, this is a touch one to refactor, while ensuring it does not
  // change any behavior aspect... let's stick to the legacy implementation,
  // with minimal updates, for now, then refactor it later.
  return propsArray.map(([, props]) => props)
    .filter((props) => {
      if (Array.isArray(props[tagName])) {
        return true;
      }
      if (typeof props[tagName] !== 'undefined') {
        warn(
          `Helmet: ${tagName} should be of type "Array". Instead found type "${typeof props[
            tagName
          ]}"`,
        );
      }
      return false;
    })
    .map((props) => props[tagName])
    .reverse()

    // From last to first.
    .reduce<PropArrayItem<T>[]>((approvedTags, instanceTags) => {
      const instanceSeenTags: SeenTags<T> = {};

      instanceTags!.filter((tag: PropArrayItem<T>) => {
        const primaryAttributeKey = getPrimaryProp(tag, primaryAttributes);

        if (!primaryAttributeKey || !tag[primaryAttributeKey]) {
          return false;
        }

        const value = (tag[primaryAttributeKey] as string).toLowerCase();

        if (!approvedSeenTags[primaryAttributeKey]) {
          approvedSeenTags[primaryAttributeKey] = {};
        }

        if (!instanceSeenTags[primaryAttributeKey]) {
          instanceSeenTags[primaryAttributeKey] = {};
        }

        // essentially we collect every item that haven't been seen so far?

        if (!approvedSeenTags[primaryAttributeKey][value]) {
          instanceSeenTags[primaryAttributeKey][value] = true;
          return true;
        }

        return false;
      }).reverse()

        // so approved tags are accumulated from last to first
        .forEach((tag: PropArrayItem<T>) => approvedTags.push(tag));

      // Update seen tags with tags from this instance
      const keys = Object.keys(instanceSeenTags) as
        Array<keyof PropArrayItem<T>>;

      for (const attributeKey of keys) {
        const tagUnion = {
          ...approvedSeenTags[attributeKey],
          ...instanceSeenTags[attributeKey],
        };

        approvedSeenTags[attributeKey] = tagUnion;
      }

      return approvedTags;
    }, [])

    // then reversed back to the from first-to-last order.
    .reverse() as HelmetPropArrays[T];
}

function getAnyTrueFromPropsArray<T extends keyof HelmetPropBooleans>(
  propsArray: RegisteredHelmetPropsArray,
  propName: T,
): boolean {
  for (const [, props] of propsArray) {
    if (props[propName]) return true;
  }
  return false;
}

export function flattenArray(possibleArray: string[] | string) {
  return Array.isArray(possibleArray) ? possibleArray.join('') : possibleArray;
}

function checkIfPropsMatch<T extends keyof HelmetPropArrays>(
  props: PropArrayItem<T>,
  toMatch: MatchProps,
) {
  for (const key of Object.keys(props)) {
    // e.g. if rel exists in the list of allowed props [amphtml, alternate, etc]
    // TODO: Do a better typing job here.
    if (toMatch[key]?.includes(
      props[key as keyof PropArrayItem<T>] as unknown as string,
    )) return true;
  }
  return false;
}

export function prioritizer<T extends keyof HelmetPropArrays>(
  propsArray: HelmetPropArrays[T],
  propsToMatch: MatchProps,
): {
    default: PropArrayItem<T>[];
    priority: PropArrayItem<T>[];
  } {
  const res = {
    default: Array<PropArrayItem<T>>(),
    priority: Array<PropArrayItem<T>>(),
  };

  if (propsArray) {
    for (const props of propsArray) {
      if (checkIfPropsMatch(props, propsToMatch)) {
        res.priority.push(props);
      } else {
        res.default.push(props);
      }
    }
  }

  return res;
}

export const without = (obj: PropList, key: string) => {
  return {
    ...obj,
    [key]: undefined,
  };
};

type UnknownObject = Record<number | string | symbol, unknown>;

/**
 * Clones given props object deep enough to make it safe to push new items
 * to its array values, and re-assign its non-array values, without a risk
 * to mutate any externally owned objects.
 */
export function cloneProps(props: HelmetProps): HelmetProps {
  const res: UnknownObject = {};
  for (const [key, value] of Object.entries(props)) {
    res[key] = Array.isArray(value) ? value.slice() : value;
  }
  return res;
}

/**
 * Merges `source` props into `target`, mutating the `target` object.
 */
export function mergeProps(target: HelmetProps, source: HelmetProps) {
  const tgt = target as UnknownObject;
  for (const [key, srcValue] of Object.entries(source)) {
    if (Array.isArray(srcValue)) {
      const tgtValue = tgt[key] as unknown[];
      tgt[key] = tgtValue ? tgtValue.concat(srcValue) : srcValue;
    } else tgt[key] = srcValue;
  }
}

/**
 * Adds given item to the specified prop array inside `target`.
 * It mutates the target.
 */
export function pushToPropArray<K extends keyof HelmetPropArrays>(
  target: HelmetProps,
  array: K,
  item: Exclude<HelmetPropArrays[K], undefined>[number],
) {
  type A = Array<typeof item>;
  const tgt = target[array] as A;
  if (tgt) tgt.push(item);
  else (target[array] as A) = [item];
}

export function calcAggregatedState(
  props: RegisteredHelmetPropsArray,
): AggregatedState {
  let links = getTagsFromPropsList(
    TAG_NAMES.LINK,
    [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF],
    props,
  );
  let meta = getTagsFromPropsList(
    'meta',
    [
      // NOTE: In the legacy version "charSet", "httpEquiv", and "itemProp"
      // were given as HTML attributes: charset, http-equiv, itemprop.
      // I believe, it is already fine to replace them here now, but
      // let's be vigilant.
      TAG_PROPERTIES.NAME,
      'charSet',
      'httpEquiv',
      TAG_PROPERTIES.PROPERTY,
      'itemProp',
    ],
    props,
  );
  let script = getTagsFromPropsList(
    'script',
    [TAG_PROPERTIES.SRC, TAG_PROPERTIES.INNER_HTML],
    props,
  );

  const prioritizeSeoTags = getAnyTrueFromPropsArray(props, 'prioritizeSeoTags');

  let priority: {
    links: LinkProps[] | undefined;
    meta: MetaProps[] | undefined;
    script: ScriptProps[] | undefined;
  } | undefined;

  if (prioritizeSeoTags) {
    const linkP = prioritizer<'link'>(links, SEO_PRIORITY_TAGS.link);
    links = linkP.default;

    const metaP = prioritizer<'meta'>(meta, SEO_PRIORITY_TAGS.meta);
    meta = metaP.default;

    const scriptP = prioritizer<'script'>(script, SEO_PRIORITY_TAGS.script);
    script = scriptP.default;

    priority = {
      links: linkP.priority,
      meta: metaP.priority,
      script: scriptP.priority,
    };
  }

  return {
    base: aggregateBaseProps(props),
    bodyAttributes: mergeAttributes('bodyAttributes', props),
    defer: getInnermostProperty(props, 'defer'),
    encodeSpecialCharacters: getInnermostProperty(props, 'encodeSpecialCharacters') ?? true,
    htmlAttributes: mergeAttributes('htmlAttributes', props),
    links,
    meta,
    noscript: getTagsFromPropsList(
      'noscript',
      [TAG_PROPERTIES.INNER_HTML],
      props,
    ),
    onChangeClientState: getInnermostProperty(props, 'onChangeClientState'),
    priority,
    script,
    style: getTagsFromPropsList(
      'style',
      [TAG_PROPERTIES.CSS_TEXT],
      props,
    ),
    title: getTitleFromPropsList(props),
    titleAttributes: mergeAttributes('titleAttributes', props),
  };
}

export function propToAttr(prop: string): string {
  return HTML_TAG_MAP[prop] ?? prop;
}
