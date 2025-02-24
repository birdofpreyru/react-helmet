import { Helmet } from '../../src';
import { HELMET_DATA_ATTRIBUTE } from '../../src/constants';
import { render } from '../../config/jest/utils';

Helmet.defaultProps.defer = false;

describe('html attributes', () => {
  describe('API', () => {
    it('updates html attributes', () => {
      render(
        <Helmet
          htmlAttributes={{
            class: 'myClassName',
            lang: 'en',
          }}
        />,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('class', 'myClassName');
      expect(htmlTag).toHaveAttribute('lang', 'en');
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'class,lang');
    });

    it('sets attributes based on the deepest nested component', () => {
      render(
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
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'lang');
    });

    it('handles valueless attributes', () => {
      render(
        <Helmet
          htmlAttributes={{
            amp: undefined,
          }}
        />,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('amp', '');
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'amp');
    });

    it('clears html attributes that are handled within helmet', () => {
      render(
        <Helmet
          htmlAttributes={{
            lang: 'en',
            amp: undefined,
          }}
        />,
      );

      render(<Helmet />);

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('lang');
      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).not.toHaveAttribute(HELMET_DATA_ATTRIBUTE);
    });

    it('updates with multiple additions and removals - overwrite and new', () => {
      render(
        <Helmet
          htmlAttributes={{
            lang: 'en',
            amp: undefined,
          }}
        />,
      );

      render(
        <Helmet
          htmlAttributes={{
            lang: 'ja',
            id: 'html-tag',
            title: 'html tag',
          }}
        />,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).toHaveAttribute('lang', 'ja');
      expect(htmlTag).toHaveAttribute('id', 'html-tag');
      expect(htmlTag).toHaveAttribute('title', 'html tag');
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'lang,id,title');
    });

    it('updates with multiple additions and removals - all new', () => {
      render(
        <Helmet
          htmlAttributes={{
            lang: 'en',
            amp: undefined,
          }}
        />,
      );

      render(
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
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'id,title');
    });

    describe('initialized outside of helmet', () => {
      beforeEach(() => {
        const htmlTag = document.documentElement;
        htmlTag.setAttribute('test', 'test');
      });

      it('attributes are not cleared', () => {
        render(<Helmet />);

        const htmlTag = document.documentElement;

        expect(htmlTag).toHaveAttribute('test', 'test');
        expect(htmlTag).not.toHaveAttribute(HELMET_DATA_ATTRIBUTE);
      });

      it('attributes are overwritten if specified in helmet', () => {
        render(
          <Helmet
            htmlAttributes={{
              test: 'helmet-attr',
            }}
          />,
        );

        const htmlTag = document.documentElement;

        expect(htmlTag).toHaveAttribute('test', 'helmet-attr');
        expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'test');
      });

      it('attributes are cleared once managed in helmet', () => {
        render(
          <Helmet
            htmlAttributes={{
              test: 'helmet-attr',
            }}
          />,
        );

        render(<Helmet />);

        const htmlTag = document.documentElement;

        expect(htmlTag).not.toHaveAttribute('test');
        expect(htmlTag).not.toHaveAttribute(HELMET_DATA_ATTRIBUTE);
      });
    });
  });

  describe('Declarative API', () => {
    it('updates html attributes', () => {
      render(
        <Helmet>
          <html className="myClassName" lang="en" />
        </Helmet>,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('class', 'myClassName');
      expect(htmlTag).toHaveAttribute('lang', 'en');
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'class,lang');
    });

    it('sets attributes based on the deepest nested component', () => {
      render(
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
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'lang');
    });

    it('handles valueless attributes', () => {
      /* eslint-disable react/no-unknown-property */
      render(
        <Helmet>
          <html
            // @ts-expect-error "pre-existing"
            amp
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      const htmlTag = document.documentElement;

      expect(htmlTag).toHaveAttribute('amp', 'true');
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'amp');
    });

    it('clears html attributes that are handled within helmet', () => {
      /* eslint-disable react/no-unknown-property */
      render(
        <Helmet>
          <html
            lang="en"
            // @ts-expect-error "pre-existing"
            amp
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      render(<Helmet />);

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('lang');
      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).not.toHaveAttribute(HELMET_DATA_ATTRIBUTE);
    });

    it('updates with multiple additions and removals - overwrite and new', () => {
      /* eslint-disable react/no-unknown-property */
      render(
        <Helmet>
          <html
            lang="en"
            // @ts-expect-error "pre-existing"
            amp
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      render(
        <Helmet>
          <html lang="ja" id="html-tag" title="html tag" />
        </Helmet>,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).toHaveAttribute('lang', 'ja');
      expect(htmlTag).toHaveAttribute('id', 'html-tag');
      expect(htmlTag).toHaveAttribute('title', 'html tag');
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'lang,id,title');
    });

    it('updates with multiple additions and removals - all new', () => {
      /* eslint-disable react/no-unknown-property */
      render(
        <Helmet>
          <html
            lang="en"
            // @ts-expect-error "pre-existing"
            amp
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      render(
        <Helmet>
          <html id="html-tag" title="html tag" />
        </Helmet>,
      );

      const htmlTag = document.documentElement;

      expect(htmlTag).not.toHaveAttribute('amp');
      expect(htmlTag).not.toHaveAttribute('lang');
      expect(htmlTag).toHaveAttribute('id', 'html-tag');
      expect(htmlTag).toHaveAttribute('title', 'html tag');
      expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'id,title');
    });

    describe('initialized outside of helmet', () => {
      beforeEach(() => {
        const htmlTag = document.documentElement;
        htmlTag.setAttribute('test', 'test');
      });

      it('are not cleared', () => {
        render(<Helmet />);

        const htmlTag = document.documentElement;

        expect(htmlTag).toHaveAttribute('test', 'test');
        expect(htmlTag).not.toHaveAttribute(HELMET_DATA_ATTRIBUTE);
      });

      it('overwritten if specified in helmet', () => {
        /* eslint-disable react/no-unknown-property */
        render(
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
        expect(htmlTag).toHaveAttribute(HELMET_DATA_ATTRIBUTE, 'test');
      });

      it('cleared once it is managed in helmet', () => {
        /* eslint-disable react/no-unknown-property */
        render(
          <Helmet>
            <html
              // @ts-expect-error "pre-existing"
              test="helmet-attr"
            />
          </Helmet>,
        );
        /* eslint-enable react/no-unknown-property */

        render(<Helmet />);

        const htmlTag = document.documentElement;

        expect(htmlTag).not.toHaveAttribute('test');
        expect(htmlTag).not.toHaveAttribute(HELMET_DATA_ATTRIBUTE);
      });
    });
  });
});
