import { HELMET_ATTRIBUTE, HTML_TAG_MAP, TAG_NAMES, TAG_PROPERTIES } from './constants';
import type { AggregatedState, Attributes, BodyProps, HelmetChildProps, HtmlProps, StateUpdate, TagList } from './types';
import { flattenArray } from './utils';

type TagUpdates = {
  oldTags: HTMLElement[];
  newTags: HTMLElement[];
};

type TagUpdateList = Record<string, TagUpdates>;

/**
 * Replaces HTML elements previously added to the DOM's head by React Helmet
 * by the set of given elements (tags). For any given element that matches
 * exactly an element already present in the head no actual DOM modification
 * happens, it just keeps already present element. Returns arrays of newly
 * added (newTags) and removed (oldTags) elements.
 */
function updateTags(type: string, tags: HelmetChildProps[]) {
  // TODO: Do we really need the fallback here? document.head is supposed to be
  // always defined.
  const headElement = document.head || document.querySelector(TAG_NAMES.HEAD);

  const tagNodes = headElement.querySelectorAll<HTMLElement>(`${type}[${HELMET_ATTRIBUTE}]`);
  const allTags: HTMLElement[] = [];
  const oldTags: HTMLElement[] = [...tagNodes];
  const newTags: HTMLElement[] = [];

  for (const tag of tags) {
    const newElement = document.createElement(type);

    // TODO: Well, the typing within this block is bad, and should be improved.
    for (const [key, value] of Object.entries(tag)) {
      if (Object.prototype.hasOwnProperty.call(tag, key)) {
        const name = HTML_TAG_MAP[key] ?? key;
        if (name as TAG_PROPERTIES === TAG_PROPERTIES.INNER_HTML) {
          newElement.innerHTML = value as string;
        } else if (name as TAG_PROPERTIES === TAG_PROPERTIES.CSS_TEXT) {
          // TODO: Not sure when this is true?
          // @ts-expect-error "pre-existing"
          if (newElement.styleSheet) {
            // @ts-expect-error "pre-existing"
            (newElement.styleSheet as CSSStyleDeclaration).cssText = (
              tag as CSSStyleDeclaration).cssText;
          } else {
            newElement.appendChild(document.createTextNode(
              (tag as CSSStyleDeclaration).cssText,
            ));
          }
        } else {
          newElement.setAttribute(name, (value as string) ?? '');
        }
      }
    }

    newElement.setAttribute(HELMET_ATTRIBUTE, 'true');

    const attrs = {};
    for (const { name, value } of newElement.attributes) {
      attrs[name] = value;
    }
    allTags.push(attrs);

    // Remove a duplicate tag from domTagstoRemove, so it isn't cleared.
    for (let i = 0; ; ++i) {
      if (newElement.isEqualNode(oldTags[i]!)) {
        oldTags.splice(i, 1);
        break;
      }
      if (i >= oldTags.length) {
        newTags.push(newElement);
        break;
      }
    }
  }

  oldTags.forEach((tag: Node) => tag.parentNode?.removeChild(tag));
  newTags.forEach((tag) => headElement.appendChild(tag));

  // TODO: Do we really need this return value anywhere? Especially `oldTags`
  // that have been removed from DOM already?
  return {
    allTags,
    oldTags,
    newTags,
  };
}

function updateAttributes(tagName: string, props: BodyProps | HtmlProps) {
  const elementTag = document.getElementsByTagName(tagName)[0];

  if (!elementTag) {
    return;
  }

  const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
  const helmetAttributes = helmetAttributeString ? helmetAttributeString.split(',') : [];
  const attributesToRemove = [...helmetAttributes];

  const attributeKeys: string[] = [];
  for (const prop of Object.keys(props)) {
    // TODO: See a comment below.
    attributeKeys.push(HTML_TAG_MAP[prop] ?? prop);
  }

  for (const [key, value] of Object.entries(props)) {
    // TODO: Get rid of the mapping later. It is not really needed, as HTML
    // attribute names are case-insensitive. However, our related logic may
    // still be case dependent - we should be careful about it.
    const attr = HTML_TAG_MAP[key] ?? key;
    if (elementTag.getAttribute(attr) !== value) {
      // TODO: That ?? '' piece is here to keep the legacy behavior for now,
      // I guess later we should prefer to consider attrbiutes with "undefined"
      // value as not set.
      elementTag.setAttribute(attr, value as string ?? '');
    }

    if (!helmetAttributes.includes(attr)) {
      helmetAttributes.push(attr);
    }

    const indexToSave = attributesToRemove.indexOf(attr);
    if (indexToSave !== -1) {
      attributesToRemove.splice(indexToSave, 1);
    }
  }

  for (let i = attributesToRemove.length - 1; i >= 0; i -= 1) {
    elementTag.removeAttribute(attributesToRemove[i]!);
  }

  if (helmetAttributes.length === attributesToRemove.length) {
    elementTag.removeAttribute(HELMET_ATTRIBUTE);
  } else if (elementTag.getAttribute(HELMET_ATTRIBUTE) !== attributeKeys.join(',')) {
    elementTag.setAttribute(HELMET_ATTRIBUTE, attributeKeys.join(','));
  }
}

function updateTitle(title: string | undefined, attributes: Attributes) {
  if (title !== undefined && document.title !== title) {
    document.title = flattenArray(title);
  }

  updateAttributes(TAG_NAMES.TITLE, attributes);
}

export function commitTagChanges(
  newState: AggregatedState,
  firstRender: boolean,
) {
  const {
    base,
    bodyAttributes,
    htmlAttributes,
    links,
    meta,
    noscript,
    onChangeClientState,
    script,
    style,
    title,
    titleAttributes,
  } = newState;
  updateAttributes(TAG_NAMES.BODY, bodyAttributes ?? {});
  updateAttributes(TAG_NAMES.HTML, htmlAttributes ?? {});

  updateTitle(title, titleAttributes as Attributes);

  const tagUpdates: TagUpdateList = {
    baseTag: updateTags(TAG_NAMES.BASE, base ? [base] : []),
    linkTags: updateTags(TAG_NAMES.LINK, links ?? []),
    metaTags: updateTags(TAG_NAMES.META, meta ?? []),
    noscriptTags: updateTags(TAG_NAMES.NOSCRIPT, noscript ?? []),
    scriptTags: updateTags(TAG_NAMES.SCRIPT, script ?? []),
    styleTags: updateTags(TAG_NAMES.STYLE, style ?? []),
  };

  const resultTags: TagList = {
    title,
  };
  const addedTags: TagList = {};
  const removedTags: TagList = {};

  Object.keys(tagUpdates).forEach((tagType) => {
    const { allTags, newTags, oldTags } = tagUpdates[tagType]!;

    resultTags[tagType] = allTags;

    if (newTags.length) {
      addedTags[tagType] = newTags;
    }
    if (oldTags.length) {
      removedTags[tagType] = tagUpdates[tagType]!.oldTags;
    }
  });

  if (firstRender || Object.keys(addedTags).length || Object.keys(removedTags).length) {
    newState?.onChangeClientState?.(resultTags, addedTags, removedTags);
  }
}
