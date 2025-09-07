/** @jest-environment jsdom */

import { type BodyProps, Helmet } from '../../src';
import { HELMET_ATTRIBUTE, HTML_TAG_MAP } from '../../src/constants';
import { renderClient } from '../../jest/browser-utils';

describe('body attributes', () => {
  describe('valid attributes', () => {
    const attributeList: BodyProps = {
      accessKey: 'c',
      className: 'test',
      contentEditable: 'true',
      contextMenu: 'mymenu',
      'data-animal-type': 'lion',
      dir: 'rtl',
      draggable: 'true',
      dropzone: 'copy',
      // @ts-expect-error "pre-existing expection"
      hidden: 'true',
      id: 'test',
      lang: 'fr',
      spellcheck: 'true',
      // @ts-expect-error "pre-existing expection"
      style: 'color: green',
      // @ts-expect-error "pre-existing expection"
      tabIndex: '-1',
      title: 'test',
      translate: 'no',
    };

    Object.keys(attributeList).forEach((attribute) => {
      // TODO: Revisit.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-template-expression
      it(`${attribute}`, () => {
        // TODO: Revisit.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-template-expression
        const attrValue = attributeList[`${attribute}` as keyof BodyProps] as string;

        const attr = {
          [attribute]: attrValue,
        };

        renderClient(
          <Helmet>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <body {...attr} />
          </Helmet>,
        );

        const bodyTag = document.body;

        // TODO: Revisit.
        // eslint-disable-next-line jest/no-conditional-in-test
        const reactCompatAttr = HTML_TAG_MAP[attribute] ?? attribute;

        expect(bodyTag).toHaveAttribute(reactCompatAttr, attrValue);
        expect(bodyTag).toHaveAttribute(HELMET_ATTRIBUTE, reactCompatAttr);
      });
    });
  });

  it('updates multiple body attributes', () => {
    renderClient(
      <Helmet>
        <body className="myClassName" tabIndex={-1} />
      </Helmet>,
    );

    const bodyTag = document.body;

    expect(bodyTag).toHaveAttribute('class', 'myClassName');
    expect(bodyTag).toHaveAttribute('tabindex', '-1');
    expect(bodyTag).toHaveAttribute(HELMET_ATTRIBUTE, 'class,tabindex');
  });

  it('sets attributes based on the deepest nested component', () => {
    renderClient(
      <div>
        <Helmet>
          <body lang="en" />
        </Helmet>
        <Helmet>
          <body lang="ja" />
        </Helmet>
      </div>,
    );

    const bodyTag = document.body;

    expect(bodyTag).toHaveAttribute('lang', 'ja');
    expect(bodyTag).toHaveAttribute(HELMET_ATTRIBUTE, 'lang');
  });

  it('handles valueless attributes', () => {
    renderClient(
      <Helmet>
        <body hidden />
      </Helmet>,
    );

    const bodyTag = document.body;

    expect(bodyTag).toHaveAttribute('hidden', 'true');
    expect(bodyTag).toHaveAttribute(HELMET_ATTRIBUTE, 'hidden');
  });

  it('clears body attributes that are handled within helmet', () => {
    renderClient(
      <Helmet>
        <body hidden lang="en" />
      </Helmet>,
    );

    const bodyTag = document.body;

    expect(bodyTag).toHaveAttribute('lang');
    expect(bodyTag).toHaveAttribute('hidden');
    expect(bodyTag).toHaveAttribute(HELMET_ATTRIBUTE);

    // NOTE: Originally an empty <Helmet /> component was rendered here,
    // and it actually cleaned-up the DOM on its mount, thus we now render
    // just a <div /> to verify that unmounting <Helmet /> does the clean-up.
    renderClient(<div />);

    expect(bodyTag).not.toHaveAttribute('lang');
    expect(bodyTag).not.toHaveAttribute('hidden');
    expect(bodyTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
  });

  it('updates with multiple additions and removals - overwrite and new', () => {
    renderClient(
      <Helmet>
        <body hidden lang="en" />
      </Helmet>,
    );

    renderClient(
      <Helmet>
        <body id="body-tag" lang="ja" title="body tag" />
      </Helmet>,
    );

    const bodyTag = document.body;

    expect(bodyTag).not.toHaveAttribute('hidden');
    expect(bodyTag).toHaveAttribute('lang', 'ja');
    expect(bodyTag).toHaveAttribute('id', 'body-tag');
    expect(bodyTag).toHaveAttribute('title', 'body tag');
    expect(bodyTag).toHaveAttribute(HELMET_ATTRIBUTE, 'id,lang,title');
  });

  it('updates with multiple additions and removals - all new', () => {
    renderClient(
      <Helmet>
        <body hidden lang="en" />
      </Helmet>,
    );

    renderClient(
      <Helmet>
        <body id="body-tag" title="body tag" />
      </Helmet>,
    );

    const bodyTag = document.body;

    expect(bodyTag).not.toHaveAttribute('hidden');
    expect(bodyTag).not.toHaveAttribute('lang');
    expect(bodyTag).toHaveAttribute('id', 'body-tag');
    expect(bodyTag).toHaveAttribute('title', 'body tag');
    expect(bodyTag).toHaveAttribute(HELMET_ATTRIBUTE, 'id,title');
  });

  describe('initialized outside of helmet', () => {
    beforeEach(() => {
      const bodyTag = document.body;
      bodyTag.setAttribute('test', 'test');
    });

    it('attributes are not cleared', () => {
      renderClient(<Helmet />);

      const bodyTag = document.body;

      expect(bodyTag).toHaveAttribute('test', 'test');
      expect(bodyTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
    });

    it('attributes are overwritten if specified in helmet', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <body
            // @ts-expect-error "pre-existing expection"
            test="helmet-attr"
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      const bodyTag = document.body;

      expect(bodyTag).toHaveAttribute('test', 'helmet-attr');
      expect(bodyTag).toHaveAttribute(HELMET_ATTRIBUTE, 'test');
    });

    it('attributes are cleared once managed in helmet', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <body
            // @ts-expect-error "pre-existing expection"
            test="helmet-attr"
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      renderClient(<Helmet />);

      const bodyTag = document.body;

      expect(bodyTag).not.toHaveAttribute('test');
      expect(bodyTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
    });
  });
});
