import { TAG_NAMES, TAG_PROPERTIES, ATTRIBUTE_NAMES } from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PropList = Record<string, any>;

type PropsList = PropList[];
type AttributeList = string[];

type SeenTags = Record<string, Record<string, boolean>>;

type MatchProps = Record<string, string | AttributeList>;

const HELMET_PROPS = {
  DEFAULT_TITLE: 'defaultTitle',
  DEFER: 'defer',
  ENCODE_SPECIAL_CHARACTERS: 'encodeSpecialCharacters',
  ON_CHANGE_CLIENT_STATE: 'onChangeClientState',
  TITLE_TEMPLATE: 'titleTemplate',
  PRIORITIZE_SEO_TAGS: 'prioritizeSeoTags',
};

const getInnermostProperty = (propsList: PropsList, property: string) => {
  for (let i = propsList.length - 1; i >= 0; i -= 1) {
    const props = propsList[i]!;

    if (Object.prototype.hasOwnProperty.call(props, property)) {
      return props[property] as string;
    }
  }

  return null;
};

const getTitleFromPropsList = (propsList: PropsList) => {
  let innermostTitle = getInnermostProperty(propsList, TAG_NAMES.TITLE);
  const innermostTemplate = getInnermostProperty(propsList, HELMET_PROPS.TITLE_TEMPLATE);
  if (Array.isArray(innermostTitle)) {
    innermostTitle = innermostTitle.join('');
  }
  if (innermostTemplate && innermostTitle) {
    // use function arg to avoid need to escape $ characters
    return innermostTemplate.replace(/%s/g, () => innermostTitle);
  }

  const innermostDefaultTitle = getInnermostProperty(propsList, HELMET_PROPS.DEFAULT_TITLE);

  return innermostTitle ?? innermostDefaultTitle ?? undefined;
};

const getOnChangeClientState = (
  propsList: PropsList,
) => getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE) ?? (() => undefined);

const getAttributesFromPropsList = (
  tagType: string,
  propsList: PropsList,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
) => propsList
  .filter((props) => typeof props[tagType] !== 'undefined')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  .map((props) => props[tagType])
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  .reduce((tagAttrs, current) => ({ ...tagAttrs, ...current }), {});

const getBaseTagFromPropsList = (
  primaryAttributes: AttributeList,
  propsList: PropsList,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
) => propsList
  .filter((props) => typeof props[TAG_NAMES.BASE] !== 'undefined')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  .map((props) => props[TAG_NAMES.BASE])
  .reverse()
  .reduce((innermostBaseTag, tag) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!innermostBaseTag.length) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const keys = Object.keys(tag);

      for (const attributeKey of keys) {
        const lowerCaseAttributeKey = attributeKey.toLowerCase();

        if (
          primaryAttributes.includes(lowerCaseAttributeKey)

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          && tag[lowerCaseAttributeKey]
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
          return innermostBaseTag.concat(tag);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return innermostBaseTag;
  }, []);

const warn = (msg: string) => console && typeof console.warn === 'function' && console.warn(msg);

const getTagsFromPropsList = (
  tagName: string,
  primaryAttributes: AttributeList,
  propsList: PropsList,
) => {
  // Calculate list of tags, giving priority innermost component (end of the propslist)
  const approvedSeenTags: SeenTags = {};

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return propsList
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .map((props) => props[tagName])
    .reverse()
    .reduce((approvedTags, instanceTags) => {
      const instanceSeenTags: SeenTags = {};

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      instanceTags
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .filter((tag: PropList) => {
          let primaryAttributeKey;
          const keys = Object.keys(tag);
          for (const attributeKey of keys) {
            const lowerCaseAttributeKey = attributeKey.toLowerCase();

            // Special rule with link tags, since rel and href are both primary tags, rel takes priority
            if (
              primaryAttributes.includes(lowerCaseAttributeKey)
              && !(
                primaryAttributeKey === TAG_PROPERTIES.REL
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                && tag[primaryAttributeKey].toLowerCase() === 'canonical'
              ) && !(
                lowerCaseAttributeKey === TAG_PROPERTIES.REL as string
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                && tag[lowerCaseAttributeKey].toLowerCase() === 'stylesheet'
              )
            ) {
              primaryAttributeKey = lowerCaseAttributeKey;
            }
            // Special case for innerHTML which doesn't work lowercased
            if (
              primaryAttributes.includes(attributeKey)
              && (
                attributeKey === TAG_PROPERTIES.INNER_HTML as string
                || attributeKey === TAG_PROPERTIES.CSS_TEXT as string
                || attributeKey === TAG_PROPERTIES.ITEM_PROP as string
              )
            ) {
              primaryAttributeKey = attributeKey;
            }
          }

          if (!primaryAttributeKey || !tag[primaryAttributeKey]) {
            return false;
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const value = tag[primaryAttributeKey].toLowerCase();

          if (!approvedSeenTags[primaryAttributeKey]) {
            approvedSeenTags[primaryAttributeKey] = {};
          }

          if (!instanceSeenTags[primaryAttributeKey]) {
            instanceSeenTags[primaryAttributeKey] = {};
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (!approvedSeenTags[primaryAttributeKey]![value]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            instanceSeenTags[primaryAttributeKey]![value] = true;
            return true;
          }

          return false;
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .reverse()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        .forEach((tag: PropList) => approvedTags.push(tag));

      // Update seen tags with tags from this instance
      const keys = Object.keys(instanceSeenTags);
      for (const attributeKey of keys) {
        const tagUnion = {
          ...approvedSeenTags[attributeKey],
          ...instanceSeenTags[attributeKey],
        };

        approvedSeenTags[attributeKey] = tagUnion;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return approvedTags;
    }, [])
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .reverse();
};

const getAnyTrueFromPropsList = (propsList: PropsList, checkedTag: string) => {
  if (Array.isArray(propsList) && propsList.length) {
    for (const prop of propsList) {
      if (prop[checkedTag]) {
        return true;
      }
    }
  }
  return false;
};

const reducePropsToState = (propsList: PropsList) => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  baseTag: getBaseTagFromPropsList([TAG_PROPERTIES.HREF], propsList),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  bodyAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.BODY, propsList),
  defer: getInnermostProperty(propsList, HELMET_PROPS.DEFER),
  encode: getInnermostProperty(propsList, HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  htmlAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.HTML, propsList),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  linkTags: getTagsFromPropsList(
    TAG_NAMES.LINK,
    [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF],
    propsList,
  ),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  metaTags: getTagsFromPropsList(
    TAG_NAMES.META,
    [
      TAG_PROPERTIES.NAME,
      TAG_PROPERTIES.CHARSET,
      TAG_PROPERTIES.HTTPEQUIV,
      TAG_PROPERTIES.PROPERTY,
      TAG_PROPERTIES.ITEM_PROP,
    ],
    propsList,
  ),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  noscriptTags: getTagsFromPropsList(TAG_NAMES.NOSCRIPT, [TAG_PROPERTIES.INNER_HTML], propsList),
  onChangeClientState: getOnChangeClientState(propsList),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  scriptTags: getTagsFromPropsList(
    TAG_NAMES.SCRIPT,
    [TAG_PROPERTIES.SRC, TAG_PROPERTIES.INNER_HTML],
    propsList,
  ),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  styleTags: getTagsFromPropsList(TAG_NAMES.STYLE, [TAG_PROPERTIES.CSS_TEXT], propsList),
  title: getTitleFromPropsList(propsList),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  titleAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.TITLE, propsList),
  prioritizeSeoTags: getAnyTrueFromPropsList(propsList, HELMET_PROPS.PRIORITIZE_SEO_TAGS),
});

export const flattenArray = (possibleArray: string[] | string) => (
  Array.isArray(possibleArray) ? possibleArray.join('') : possibleArray
);

export { reducePropsToState };

const checkIfPropsMatch = (props: PropList, toMatch: MatchProps) => {
  const keys = Object.keys(props);
  for (const key of keys) {
    // e.g. if rel exists in the list of allowed props [amphtml, alternate, etc]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (toMatch[key]?.includes(props[key])) {
      return true;
    }
  }
  return false;
};

export const prioritizer = (elementsList: HTMLElement[], propsToMatch: MatchProps) => {
  if (Array.isArray(elementsList)) {
    return elementsList.reduce(
      (acc, elementAttrs) => {
        if (checkIfPropsMatch(elementAttrs, propsToMatch)) {
          acc.priority.push(elementAttrs);
        } else {
          acc.default.push(elementAttrs);
        }
        return acc;
      },
      { priority: [] as HTMLElement[], default: [] as HTMLElement[] },
    );
  }
  return { default: elementsList, priority: [] };
};

export const without = (obj: PropList, key: string) => {
  return {
    ...obj,
    [key]: undefined,
  };
};
