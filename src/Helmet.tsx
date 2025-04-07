import {
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
  Children,
  use,
  useEffect,
  useId,
} from 'react';

import { REACT_TAG_MAP, TAG_NAMES, VALID_TAG_NAMES } from './constants';

import { Context } from './Provider';

import type {
  BaseProps,
  BodyProps,
  HelmetChildProps,
  HelmetProps,
  HtmlProps,
  LinkProps,
  MetaProps,
  NoscriptProps,
  ScriptProps,
  StyleProps,
  TitleProps,
} from './types';
import { cloneProps, mergeProps, pushToPropArray } from './utils';

function assertChildType(
  childType: ReactElement['type'],
  nestedChildren: ReactNode,
): asserts childType is TAG_NAMES {
  if (typeof childType !== 'string') throw Error(
    'You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.',
  );

  if (!(VALID_TAG_NAMES as string[]).includes(childType)) throw Error(
    `Only elements types ${VALID_TAG_NAMES.join(', ')} are allowed. Helmet does not support rendering <${childType}> elements. Refer to our API for more information.`,
  );

  if (
    !nestedChildren
    || typeof nestedChildren === 'string'
    || Array.isArray(nestedChildren)
    // TODO: This piece of the check is wrong when parent is a fragment,
    // and thus children may not be an array of strings.
    // && nestedChildren.every((item) => typeof item === 'string')
  ) return;

  throw Error(
    `Helmet expects a string as a child of <${childType}>. Did you forget to wrap your children in braces? ( <${childType}>{\`\`}</${childType}> ) Refer to our API for more information.`,
  );
}

/**
 * Given a string key, it checks it against the legacy mapping between supported
 * HTML attribute names and their corresponding React prop names (for the names
 * that are different). If found in the mapping, it prints a warning to console
 * and returns the mapped prop name. Otherwise, it just returns the key as is,
 * assuming it is already a valid React prop name.
 */
function getPropName(key: string): keyof HelmetChildProps {
  const res = REACT_TAG_MAP[key];
  if (res) console.warn(
    `"${key}" is not a valid JSX prop, replace it by "${res}"`,
  );
  return (res ?? key) as keyof HelmetChildProps;
}

/**
 * Given children and props of a <Helmet> component, it reduces them to a single
 * props object.
 *
 * TODO: I guess, it should be further refactored, to make it cleaner...
 * though, it should perfectly work as is, so not a huge priority for now.
 */
function reduceChildrenAndProps(props: HelmetProps): Omit<HelmetProps, 'children'> {
  // NOTE: `props` are clonned, thus it is safe to push additional items to
  // array values of `res`, and to re-assign non-array values of `res`, without
  // the risk to mutate the original `props` object.
  const res: HelmetProps = cloneProps(props);

  // TODO: This is a temporary block, for compatibility with legacy library.
  for (const item of Object.values(props)) {
    if (Array.isArray(item)) {
      for (const it of item) {
        if (it) {
          for (const key of Object.keys(it)) {
            const p = getPropName(key);
            if (p !== key) {
              it[p] = it[key as keyof HelmetChildProps] as unknown;
              delete it[key as keyof HelmetChildProps];
            }
          }
        }
      }
    } else if (item && typeof item === 'object') {
      const it = item as HelmetChildProps;
      for (const key of Object.keys(it)) {
        const p = getPropName(key);
        if (p !== key) {
          it[p] = it[key as keyof HelmetChildProps] as unknown;
          delete it[key as keyof HelmetChildProps];
        }
      }
    }
  }

  Children.forEach(props.children, (child) => {
    if (child === undefined || child === null) return;

    if (typeof child !== 'object' || !('props' in child)) throw Error(
      `"${typeof child}" is not a valid <Helmet> descendant`,
    );

    let nestedChildren: ReactNode;
    const childProps: HelmetChildProps = {};
    if (child.props) {
      for (const [key, value] of Object.entries(child.props)) {
        if (key === 'children') nestedChildren = value as ReactNode;
        else childProps[getPropName(key)] = value as unknown;
      }
    }

    let { type } = child;
    if (typeof type === 'symbol') type = (type as 'symbol').toString();
    assertChildType(type, nestedChildren);

    function assertStringChild(child: ReactNode): asserts child is string {
      if (typeof child !== 'string') {
        // TODO: We want to throw, but the legacy code did not, so we won't for
        // now.
        console.error(`child of ${type as string} element should be a string`);

        /*
        throw Error(
          // NOTE: assertChildType() above guarantees that `type` is a string,
          // although it is not expressed in a way TypeScript can automatically
          // pick up.
        );
        */
      }
    }

    switch (type) {
      case TAG_NAMES.BASE:
        res.base = childProps as BaseProps;
        break;

      case TAG_NAMES.BODY:
        res.bodyAttributes = childProps as BodyProps;
        break;

      case TAG_NAMES.FRAGMENT:
        mergeProps(res, reduceChildrenAndProps({ children: nestedChildren }));
        break;

      case TAG_NAMES.HTML:
        res.htmlAttributes = childProps as HtmlProps;
        break;

      case TAG_NAMES.LINK:
      case TAG_NAMES.META:
        if (nestedChildren) throw Error(
          `<${type} /> elements are self-closing and can not contain children. Refer to our API for more information.`,
        );
        pushToPropArray(res, type, childProps as LinkProps | MetaProps);
        break;

      case TAG_NAMES.NOSCRIPT:
      case TAG_NAMES.SCRIPT:
        if (nestedChildren !== undefined) {
          assertStringChild(nestedChildren);
          (childProps as NoscriptProps | ScriptProps)
            .innerHTML = nestedChildren;
        }
        pushToPropArray(res, type, childProps);
        break;

      case TAG_NAMES.STYLE:
        assertStringChild(nestedChildren);
        (childProps as StyleProps).cssText = nestedChildren;
        pushToPropArray(res, type, childProps as StyleProps);
        break;

      case TAG_NAMES.TITLE:
        res.titleAttributes = childProps as TitleProps;

        if (typeof nestedChildren === 'string') res.title = nestedChildren;

        // When title contains {} expressions the children are an array of
        // strings, and other values.
        else if (Array.isArray(nestedChildren)) res.title = nestedChildren.join('');
        break;

      default: {
        // TODO: Perhaps, we should remove HEAD entry from TAG_NAMES?
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const bad: TAG_NAMES.HEAD = type;
      }
    }
  });

  delete res.children;
  return res;
}

const Helmet: FunctionComponent<HelmetProps> = (props) => {
  const context = use(Context);

  if (!context) throw Error(
    '<Helmet> component must be within a <HelmetProvider> children tree',
  );

  const id = useId();

  // TODO: Agh... we need it here to ensure that it works server-side,
  // and we need the same in the useEffect() below to ensure it works
  // client-side in strict mode (and, thus completely correctly from React's
  // pure component / side effect logic). It clearly should be optimized,
  // but let's care about it later.
  context.update(id, reduceChildrenAndProps(props));

  // TODO: I guess, these two useEffect() can be merged together, which should
  // also allow to simplify and optimize the client-side management of attrs and
  // elements managed by these. Though, keeping them separate is an easier way
  // for now to ensure backward compatibility.
  useEffect(() => {
    context.update(id, reduceChildrenAndProps(props));
    context.clientApply();
  });

  useEffect(() => () => context.update(id, undefined), [context, id]);

  return null;
};

export default Helmet;
