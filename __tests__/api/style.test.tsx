/** @jest-environment jsdom */

import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';
import { renderClient } from '../../jest/browser-utils';

describe('style tags', () => {
  it('updates style tags', () => {
    const cssText1 = `
                  body {
                      background-color: green;
                  }
              `;
    const cssText2 = `
                  p {
                      font-size: 12px;
                  }
              `;
    renderClient(
      <Helmet
        style={[
          {
            cssText: cssText1,
            type: 'text/css',
          },
          {
            cssText: cssText2,
          },
        ]}
      />,
    );

    const existingTags = [...document.head.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`)];
    const [firstTag, secondTag] = existingTags;

    expect(existingTags).toBeDefined();
    expect(existingTags).toHaveLength(2);

    expect(firstTag).toBeInstanceOf(Element);
    expect(firstTag!.getAttribute).toBeDefined();
    expect(firstTag).toHaveAttribute('type', 'text/css');
    expect(firstTag?.innerHTML).toStrictEqual(cssText1);
    expect(firstTag?.outerHTML).toMatchSnapshot();

    expect(secondTag).toBeInstanceOf(Element);
    expect(secondTag?.innerHTML).toStrictEqual(cssText2);
    expect(secondTag?.outerHTML).toMatchSnapshot();
  });

  it('clears all style tags if none are specified', () => {
    const cssText = `
                  body {
                      background-color: green;
                  }
              `;
    renderClient(
      <Helmet
        style={[
          {
            cssText,
            type: 'text/css',
          },
        ]}
      />,
    );

    renderClient(<Helmet />);

    const existingTags = document.head.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

    expect(existingTags).toBeDefined();
    expect(existingTags).toHaveLength(0);
  });

  it('tags without \'cssText\' are not accepted', () => {
    renderClient(<Helmet style={[{ property: 'won\'t work' }]} />);

    const existingTags = document.head.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

    expect(existingTags).toBeDefined();
    expect(existingTags).toHaveLength(0);
  });

  it('does not render tag when primary attribute is null', () => {
    renderClient(
      <Helmet
        style={[
          {
            cssText: undefined,
          },
        ]}
      />,
    );

    const tagNodes = document.head.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);
    const existingTags = [].slice.call(tagNodes);

    expect(existingTags).toHaveLength(0);
  });
});

describe('Declarative API', () => {
  it('updates style tags', () => {
    const cssText1 = `
            body {
                background-color: green;
            }
        `;
    const cssText2 = `
            p {
                font-size: 12px;
            }
        `;

    renderClient(
      <Helmet>
        <style type="text/css">{cssText1}</style>
        <style>{cssText2}</style>
      </Helmet>,
    );

    const existingTags = [...document.head.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`)];
    const [firstTag, secondTag] = existingTags;

    expect(existingTags).toBeDefined();
    expect(existingTags).toHaveLength(2);

    expect(firstTag).toBeInstanceOf(Element);
    expect(firstTag!.getAttribute).toBeDefined();
    expect(firstTag).toHaveAttribute('type', 'text/css');
    expect(firstTag?.innerHTML).toStrictEqual(cssText1);
    expect(firstTag?.outerHTML).toMatchSnapshot();

    expect(secondTag).toBeInstanceOf(Element);
    expect(secondTag?.innerHTML).toStrictEqual(cssText2);
    expect(secondTag?.outerHTML).toMatchSnapshot();
  });

  it('clears all style tags if none are specified', () => {
    const cssText = `
            body {
                background-color: green;
            }
        `;
    renderClient(
      <Helmet>
        <style type="text/css">{cssText}</style>
      </Helmet>,
    );

    renderClient(<Helmet />);

    const existingTags = document.head.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

    expect(existingTags).toBeDefined();
    expect(existingTags).toHaveLength(0);
  });

  it('tags without \'cssText\' are not accepted', () => {
    // eslint-disable-next-line no-console
    const origConsoleError = console.error;
    // eslint-disable-next-line no-console
    console.error = () => undefined;
    try {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <style property="won't work" />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      const existingTags = document.head.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    } finally {
      // eslint-disable-next-line no-console
      console.error = origConsoleError;
    }
  });

  it('does not render tag when primary attribute is null', () => {
    // eslint-disable-next-line no-console
    const origConsoleError = console.error;
    // eslint-disable-next-line no-console
    console.error = () => undefined;
    try {
      renderClient(
        <Helmet>
          <style>{undefined}</style>
        </Helmet>,
      );

      const tagNodes = document.head.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    } finally {
      // eslint-disable-next-line no-console
      console.error = origConsoleError;
    }
  });
});
