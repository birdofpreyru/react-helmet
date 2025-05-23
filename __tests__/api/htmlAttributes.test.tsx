/** @jest-environment jsdom */

import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';
import { renderClient } from '../../jest/browser-utils';

describe('html attributes', () => {
  describe('API', () => {
    it('updates html attributes', () => {
      renderClient(
        <Helmet
          htmlAttributes={{
            className: 'myClassName',
            lang: 'en',
          }}
        />,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('class', 'myClassName');
      expect(htmlTag).toHaveAttribute('lang', 'en');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'class,lang');
    });

    it('sets attributes based on the deepest nested component', () => {
      renderClient(
        <div>
          <Helmet
            htmlAttributes={{
              lang: 'en',
            }}
          />
          <Helmet
            htmlAttributes={{
              lang: 'ja',
            }}
          />
        </div>,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('lang', 'ja');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'lang');
    });

    it('handles valueless attributes', () => {
      renderClient(
        <Helmet
          htmlAttributes={{
            // @ts-expect-error "pre-existing"
            amp: undefined,
          }}
        />,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('amp', '');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'amp');
    });

    it('clears html attributes that are handled within helmet', () => {
      renderClient(
        <Helmet
          htmlAttributes={{
            // @ts-expect-error "pre-existing"
            amp: undefined,
            lang: 'en',
          }}
        />,
      );

      renderClient(<Helmet />);

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('lang');
      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
    });

    it('updates with multiple additions and removals - overwrite and new', () => {
      renderClient(
        <Helmet
          htmlAttributes={{
            // @ts-expect-error "pre-existing"
            amp: undefined,
            lang: 'en',
          }}
        />,
      );

      renderClient(
        <Helmet
          htmlAttributes={{
            id: 'html-tag',
            lang: 'ja',
            title: 'html tag',
          }}
        />,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).toHaveAttribute('lang', 'ja');
      expect(htmlTag).toHaveAttribute('id', 'html-tag');
      expect(htmlTag).toHaveAttribute('title', 'html tag');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'id,lang,title');
    });

    it('updates with multiple additions and removals - all new', () => {
      renderClient(
        <Helmet
          htmlAttributes={{
            // @ts-expect-error "pre-existing"
            amp: undefined,
            lang: 'en',
          }}
        />,
      );

      renderClient(
        <Helmet
          htmlAttributes={{
            id: 'html-tag',
            title: 'html tag',
          }}
        />,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).not.toHaveAttribute('lang');
      expect(htmlTag).toHaveAttribute('id', 'html-tag');
      expect(htmlTag).toHaveAttribute('title', 'html tag');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'id,title');
    });

    describe('initialized outside of helmet', () => {
      beforeEach(() => {
        const htmlTag = document.documentElement;
        htmlTag.setAttribute('test', 'test');
      });

      it('attributes are not cleared', () => {
        renderClient(<Helmet />);

        const htmlTag = document.documentElement;

        expect(htmlTag).toHaveAttribute('test', 'test');
        expect(htmlTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
      });

      it('attributes are overwritten if specified in helmet', () => {
        renderClient(
          <Helmet
            htmlAttributes={{
              // @ts-expect-error "pre-existing"
              test: 'helmet-attr',
            }}
          />,
        );

        const htmlTag = document.documentElement;

        expect(htmlTag).toHaveAttribute('test', 'helmet-attr');
        expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'test');
      });

      it('attributes are cleared once managed in helmet', () => {
        renderClient(
          <Helmet
            htmlAttributes={{
              // @ts-expect-error "pre-existing"
              test: 'helmet-attr',
            }}
          />,
        );

        renderClient(<Helmet />);

        const htmlTag = document.documentElement;

        expect(htmlTag).not.toHaveAttribute('test');
        expect(htmlTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
      });
    });
  });

  describe('Declarative API', () => {
    it('updates html attributes', () => {
      renderClient(
        <Helmet>
          <html className="myClassName" lang="en" />
        </Helmet>,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('class', 'myClassName');
      expect(htmlTag).toHaveAttribute('lang', 'en');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'class,lang');
    });

    it('sets attributes based on the deepest nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <html lang="en" />
          </Helmet>
          <Helmet>
            <html lang="ja" />
          </Helmet>
        </div>,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('lang', 'ja');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'lang');
    });

    it('handles valueless attributes', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          {/* eslint-disable jsx-a11y/html-has-lang */}
          <html
            // @ts-expect-error "pre-existing"
            amp
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('amp', 'true');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'amp');
    });

    it('clears html attributes that are handled within helmet', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <html
            // @ts-expect-error "pre-existing"
            amp
            lang="en"
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      renderClient(<Helmet />);

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('lang');
      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
    });

    it('updates with multiple additions and removals - overwrite and new', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <html
            // @ts-expect-error "pre-existing"
            amp
            lang="en"
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      renderClient(
        <Helmet>
          <html id="html-tag" lang="ja" title="html tag" />
        </Helmet>,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).toHaveAttribute('lang', 'ja');
      expect(htmlTag).toHaveAttribute('id', 'html-tag');
      expect(htmlTag).toHaveAttribute('title', 'html tag');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'id,lang,title');
    });

    it('updates with multiple additions and removals - all new', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <html
            // @ts-expect-error "pre-existing"
            amp
            lang="en"
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      renderClient(
        <Helmet>
          <html id="html-tag" title="html tag" />
        </Helmet>,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).not.toHaveAttribute('lang');
      expect(htmlTag).toHaveAttribute('id', 'html-tag');
      expect(htmlTag).toHaveAttribute('title', 'html tag');
      expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'id,title');
    });

    describe('initialized outside of helmet', () => {
      beforeEach(() => {
        const htmlTag = document.documentElement;
        htmlTag.setAttribute('test', 'test');
      });

      it('are not cleared', () => {
        renderClient(<Helmet />);

        const htmlTag = document.documentElement;

        expect(htmlTag).toHaveAttribute('test', 'test');
        expect(htmlTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
      });

      it('overwritten if specified in helmet', () => {
        /* eslint-disable react/no-unknown-property */
        renderClient(
          <Helmet>
            <html
              // @ts-expect-error "pre-existing"
              test="helmet-attr"
            />
          </Helmet>,
        );
        /* eslint-enable react/no-unknown-property */

        const htmlTag = document.documentElement;

        expect(htmlTag).toHaveAttribute('test', 'helmet-attr');
        expect(htmlTag).toHaveAttribute(HELMET_ATTRIBUTE, 'test');
      });

      it('cleared once it is managed in helmet', () => {
        /* eslint-disable react/no-unknown-property */
        renderClient(
          <Helmet>
            <html
              // @ts-expect-error "pre-existing"
              test="helmet-attr"
            />
          </Helmet>,
        );
        /* eslint-enable react/no-unknown-property */

        renderClient(<Helmet />);

        const htmlTag = document.documentElement;

        expect(htmlTag).not.toHaveAttribute('test');
        expect(htmlTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
      });
    });
  });
});
