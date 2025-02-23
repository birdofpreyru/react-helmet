import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React, { Component } from 'react';
import fastCompare from 'react-fast-compare';
import invariant from 'invariant';

import { Context } from './Provider';
import type { HelmetDataType } from './HelmetData';
import HelmetData from './HelmetData';
import type { DispatcherContextProp } from './Dispatcher';
import Dispatcher from './Dispatcher';
import { without } from './utils';
import { TAG_NAMES, VALID_TAG_NAMES, HTML_TAG_MAP } from './constants';
import type { HelmetProps } from './types';

export * from './types';

export { default as HelmetData } from './HelmetData';
export { default as HelmetProvider } from './Provider';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = Record<string, any>;

export class Helmet extends Component<PropsWithChildren<HelmetProps>> {
  static defaultProps = {
    defer: true,
    encodeSpecialCharacters: true,
    prioritizeSeoTags: false,
  };

  shouldComponentUpdate(nextProps: HelmetProps) {
    return !fastCompare(without(this.props, 'helmetData'), without(nextProps, 'helmetData'));
  }

  mapNestedChildrenToProps(child: ReactElement, nestedChildren: ReactNode) {
    if (!nestedChildren) {
      return null;
    }

    switch (child.type) {
      case TAG_NAMES.SCRIPT:
      case TAG_NAMES.NOSCRIPT:
        return {
          innerHTML: nestedChildren,
        };

      case TAG_NAMES.STYLE:
        return {
          cssText: nestedChildren,
        };
      default: {
        throw new Error(
          `<${typeof child.type === 'string'
            ? child.type
            : 'N/A'} /> elements are self-closing and can not contain children. Refer to our API for more information.`,
        );
      }
    }
  }

  flattenArrayTypeChildren(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    child: ReactElement<any, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arrayTypeChildren: Record<string, ReactElement<any, any>[]>,
    newChildProps: Props,
    nestedChildren: ReactNode,
  ) {
    return {
      ...arrayTypeChildren,
      [child.type]: [
        ...arrayTypeChildren[child.type as string] ?? [],
        {
          ...newChildProps,
          ...this.mapNestedChildrenToProps(child as ReactElement, nestedChildren),
        },
      ],
    };
  }

  mapObjectTypeChildren(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    child: ReactElement<any, any>,
    newProps: Props,
    newChildProps: Props,
    nestedChildren: ReactNode,
  ) {
    switch (child.type) {
      case TAG_NAMES.TITLE:
        return {
          ...newProps,
          [child.type]: nestedChildren,
          titleAttributes: { ...newChildProps },
        };

      case TAG_NAMES.BODY:
        return {
          ...newProps,
          bodyAttributes: { ...newChildProps },
        };

      case TAG_NAMES.HTML:
        return {
          ...newProps,
          htmlAttributes: { ...newChildProps },
        };
      default:
        return {
          ...newProps,
          [child.type]: { ...newChildProps },
        };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapArrayTypeChildrenToProps(arrayTypeChildren: Record<string, ReactElement<any, any>>, newProps: Props) {
    let newFlattenedProps = { ...newProps };

    Object.keys(arrayTypeChildren).forEach((arrayChildName) => {
      newFlattenedProps = {
        ...newFlattenedProps,
        [arrayChildName]: arrayTypeChildren[arrayChildName],
      };
    });

    return newFlattenedProps;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warnOnInvalidChildren(child: ReactElement<any, any>, nestedChildren: ReactNode) {
    invariant(
      VALID_TAG_NAMES.some((name) => child.type === name),
      typeof child.type === 'function'
        ? 'You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.'
        : `Only elements types ${VALID_TAG_NAMES.join(
          ', ',
        )} are allowed. Helmet does not support rendering <${
          child.type
        }> elements. Refer to our API for more information.`,
    );

    invariant(
      !nestedChildren
      || typeof nestedChildren === 'string'
      || (
        Array.isArray(nestedChildren)
        && !nestedChildren.some((nestedChild) => typeof nestedChild !== 'string')),
      `Helmet expects a string as a child of <${child.type}>. Did you forget to wrap your children in braces? ( <${child.type}>{\`\`}</${child.type}> ) Refer to our API for more information.`,
    );

    return true;
  }

  mapChildrenToProps(children: ReactNode, newProps: Props) {
    let arrayTypeChildren = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.Children.forEach(children as ReactElement<any, any>, (child: ReactElement) => {
      if (!child?.props) return;

      // @ts-expect-error "pre-existing"
      const { children: nestedChildren, ...childProps } = child.props;
      // convert React props to HTML attributes
      const newChildProps = Object.keys(childProps).reduce((obj: Props, key) => {
        // @ts-expect-error "pre-existing"
        obj[HTML_TAG_MAP[key] ?? key] = childProps[key]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        return obj;
      }, {});

      let { type } = child;
      if (typeof type === 'symbol') {
        type = (type as 'symbol').toString();
      } else {
        this.warnOnInvalidChildren(child, nestedChildren as ReactNode);
      }

      switch (type) {
        case TAG_NAMES.FRAGMENT:
          newProps = this.mapChildrenToProps(nestedChildren as ReactNode, newProps);
          break;

        case TAG_NAMES.LINK:
        case TAG_NAMES.META:
        case TAG_NAMES.NOSCRIPT:
        case TAG_NAMES.SCRIPT:
        case TAG_NAMES.STYLE:
          arrayTypeChildren = this.flattenArrayTypeChildren(
            child,
            arrayTypeChildren,
            newChildProps,
            nestedChildren as ReactNode,
          );
          break;

        default:
          newProps = this.mapObjectTypeChildren(child, newProps, newChildProps, nestedChildren as ReactNode);
          break;
      }
    });

    return this.mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
  }

  render() {
    const { children, ...props } = this.props;
    let newProps = { ...props };
    let { helmetData } = props;

    if (children) {
      newProps = this.mapChildrenToProps(children, newProps);
    }

    if (helmetData && !(helmetData instanceof HelmetData)) {
      const data = helmetData as HelmetDataType;
      helmetData = new HelmetData(data.context, true);
      delete newProps.helmetData;
    }

    return helmetData
      ? <Dispatcher {...newProps} context={helmetData.value} />
      : (
        <Context.Consumer>
          {(context) => <Dispatcher {...newProps} context={context as DispatcherContextProp} />}
        </Context.Consumer>
      );
  }
}
