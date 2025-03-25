import { HELMET_ATTRIBUTE, TAG_NAMES, TAG_PROPERTIES } from './constants';
import type { Attributes, StateUpdate, TagList } from './types';
import { flattenArray } from './utils';

type TagUpdates = {
  oldTags: HTMLElement[];
  newTags: HTMLElement[];
}

type TagUpdateList = Record<string, TagUpdates>;

/**
 * Replaces HTML elements previously added to the DOM's head by React Helmet
 * by the set of given elements (tags). For any given element that matches
 * exactly an element already present in the head no actual DOM modification
 * happens, it just keeps already present element. Returns arrays of newly
 * added (newTags) and removed (oldTags) elements.
 */
function updateTags(type: string, tags: HTMLElement[]) {
  // TODO: Do we really need the fallback here? document.head is supposed to be
  // always defined.
  const headElement = document.head || document.querySelector(TAG_NAMES.HEAD);

  const tagNodes = headElement.querySelectorAll<HTMLElement>(`${type}[${HELMET_ATTRIBUTE}]`);
  const oldTags: HTMLElement[] = [...tagNodes];
  const newTags: HTMLElement[] = [];

  for (const tag of tags) {
    const newElement = document.createElement(type);

    for (const attribute in tag) {
      if (tag.hasAttribute(attribute)) {
        if (attribute as TAG_PROPERTIES === TAG_PROPERTIES.INNER_HTML) {
          newElement.innerHTML = tag.innerHTML;
        } else if (attribute as TAG_PROPERTIES === TAG_PROPERTIES.CSS_TEXT) {
          // TODO: Not sure when this is true?
          // @ts-expect-error "pre-existing"
          if (newElement.styleSheet) {
            // @ts-expect-error "pre-existing"
            (newElement.styleSheet as CSSStyleDeclaration).cssText = (tag as CSSStyleDeclaration).cssText;
          } else {
            // @ts-expect-error "pre-existing"
            newElement.appendChild(document.createTextNode((tag as CSSStyleDeclaration).cssText));
          }
        } else {
          newElement.setAttribute(attribute, tag.getAttribute(attribute) ?? '');
        }
      }
    }

    newElement.setAttribute(HELMET_ATTRIBUTE, 'true');

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
    oldTags,
    newTags,
  };
}

function updateAttributes(tagName: string, attributes: Attributes) {
  const elementTag = document.getElementsByTagName(tagName)[0];

  if (!elementTag) {
    return;
  }

  const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
  const helmetAttributes = helmetAttributeString ? helmetAttributeString.split(',') : [];
  const attributesToRemove = [...helmetAttributes];
  const attributeKeys = Object.keys(attributes);

  for (const attribute of attributeKeys) {
    const value = attributes[attribute] ?? '';

    if (elementTag.getAttribute(attribute) !== value) {
      elementTag.setAttribute(attribute, value);
    }

    if (!helmetAttributes.includes(attribute)) {
      helmetAttributes.push(attribute);
    }

    const indexToSave = attributesToRemove.indexOf(attribute);
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

function updateTitle(title: string, attributes: Attributes) {
  if (typeof title !== 'undefined' && document.title !== title) {
    document.title = flattenArray(title);
  }

  updateAttributes(TAG_NAMES.TITLE, attributes);
}

type Cb = () => number | null | void;

function commitTagChanges(newState: StateUpdate, cb?: Cb) {
  const {
    baseTag,
    bodyAttributes,
    htmlAttributes,
    linkTags,
    metaTags,
    noscriptTags,
    onChangeClientState,
    scriptTags,
    styleTags,
    title,
    titleAttributes,
  } = newState;
  updateAttributes(TAG_NAMES.BODY, bodyAttributes as Attributes);
  updateAttributes(TAG_NAMES.HTML, htmlAttributes as Attributes);

  updateTitle(title, titleAttributes as Attributes);

  const tagUpdates: TagUpdateList = {
    baseTag: updateTags(TAG_NAMES.BASE, baseTag),
    linkTags: updateTags(TAG_NAMES.LINK, linkTags),
    metaTags: updateTags(TAG_NAMES.META, metaTags),
    noscriptTags: updateTags(TAG_NAMES.NOSCRIPT, noscriptTags),
    scriptTags: updateTags(TAG_NAMES.SCRIPT, scriptTags),
    styleTags: updateTags(TAG_NAMES.STYLE, styleTags),
  };

  const addedTags: TagList = {};
  const removedTags: TagList = {};

  Object.keys(tagUpdates).forEach((tagType) => {
    const { newTags, oldTags } = tagUpdates[tagType]!;

    if (newTags.length) {
      addedTags[tagType] = newTags;
    }
    if (oldTags.length) {
      removedTags[tagType] = tagUpdates[tagType]!.oldTags;
    }
  });

  if (cb) {
    cb();
  }

  onChangeClientState(newState, addedTags, removedTags);
}

// TODO: Right now it does the update in the next animation frame...
// if "defer" update is opted in... do we really need it? Is that "defer"
// is just a side-effect of poor engineering of the legacy code?

let _helmetCallback: number | null = null;

const handleStateChangeOnClient = (newState: StateUpdate) => {
  if (_helmetCallback) cancelAnimationFrame(_helmetCallback);

  if (newState.defer) {
    _helmetCallback = requestAnimationFrame(() => {
      commitTagChanges(newState, () => {
        _helmetCallback = null;
      });
    });
  } else {
    commitTagChanges(newState);
    _helmetCallback = null;
  }
};

export default handleStateChangeOnClient;
