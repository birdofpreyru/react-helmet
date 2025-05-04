/** @jest-environment jsdom */

import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';
import { renderClient } from '../../jest/browser-utils';

describe('script tags', () => {
  describe('API', () => {
    it('updates script tags', () => {
      const scriptInnerHTML = `
                {
                  "@context": "http://schema.org",
                  "@type": "NewsArticle",
                  "url": "http://localhost/helmet"
                }
              `;
      renderClient(
        <Helmet
          script={[
            {
              src: 'http://localhost/test.js',
              type: 'text/javascript',
            },
            {
              src: 'http://localhost/test2.js',
              type: 'text/javascript',
            },
            {
              innerHTML: scriptInnerHTML,
              type: 'application/ld+json',
            },
          ]}
        />,
      );

      const existingTags = [...document.head.getElementsByTagName('script')];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        // eslint-disable-next-line jest/no-conditional-in-test
        (tag) => (
          // eslint-disable-next-line jest/no-conditional-in-test
          tag.getAttribute('src') === 'http://localhost/test.js'
          && tag.getAttribute('type') === 'text/javascript'
        ) || (
          // eslint-disable-next-line jest/no-conditional-in-test
          tag.getAttribute('src') === 'http://localhost/test2.js'
          && tag.getAttribute('type') === 'text/javascript'
          // eslint-disable-next-line jest/no-conditional-in-test
        ) || (tag.getAttribute('type') === 'application/ld+json' && tag.innerHTML === scriptInnerHTML),
      );

      expect(filteredTags.length).toBeGreaterThanOrEqual(3);
    });

    it('clears all scripts tags if none are specified', () => {
      renderClient(
        <Helmet
          script={[
            {
              src: 'http://localhost/test.js',
              type: 'text/javascript',
            },
          ]}
        />,
      );

      renderClient(<Helmet />);

      const existingTags = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'src\' are not accepted', () => {
      renderClient(<Helmet script={[{ property: 'won\'t work' }]} />);

      const existingTags = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('sets script tags based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet
            script={[
              {
                src: 'http://localhost/test.js',
                type: 'text/javascript',
              },
            ]}
          />
          <Helmet
            script={[
              {
                src: 'http://localhost/test2.js',
                type: 'text/javascript',
              },
            ]}
          />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags.length).toBeGreaterThanOrEqual(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('src', 'http://localhost/test.js');
      expect(firstTag).toHaveAttribute('type', 'text/javascript');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('src', 'http://localhost/test2.js');
      expect(secondTag).toHaveAttribute('type', 'text/javascript');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('sets undefined attribute values to empty strings', () => {
      renderClient(
        <Helmet
          script={[
            {
              async: undefined,
              src: 'foo.js',
            },
          ]}
        />,
      );

      const existingTag = document.head.querySelector(`script[${HELMET_ATTRIBUTE}]`);

      expect(existingTag).toBeDefined();
      expect(existingTag?.outerHTML).toMatchSnapshot();
    });

    it('does not render tag when primary attribute (src) is null', () => {
      renderClient(
        <Helmet
          script={[
            {
              src: undefined,
              type: 'text/javascript',
            },
          ]}
        />,
      );

      const tagNodes = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });

    it('does not render tag when primary attribute (innerHTML) is null', () => {
      renderClient(
        <Helmet
          script={[
            {
              innerHTML: undefined,
            },
          ]}
        />,
      );

      const tagNodes = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });
  });

  describe('Declarative API', () => {
    it('updates script tags', () => {
      const scriptInnerHTML = `
          {
            "@context": "http://schema.org",
            "@type": "NewsArticle",
            "url": "http://localhost/helmet"
          }
        `;
      renderClient(
        <Helmet>
          <script src="http://localhost/test.js" type="text/javascript" />
          <script src="http://localhost/test2.js" type="text/javascript" />
          <script type="application/ld+json">{scriptInnerHTML}</script>
        </Helmet>,
      );

      const existingTags = [...document.head.getElementsByTagName('script')];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        // eslint-disable-next-line jest/no-conditional-in-test
        (tag) => (
          // eslint-disable-next-line jest/no-conditional-in-test
          tag.getAttribute('src') === 'http://localhost/test.js'
          && tag.getAttribute('type') === 'text/javascript'
        ) || (
          // eslint-disable-next-line jest/no-conditional-in-test
          tag.getAttribute('src') === 'http://localhost/test2.js'
          && tag.getAttribute('type') === 'text/javascript'
          // eslint-disable-next-line jest/no-conditional-in-test
        ) || (tag.getAttribute('type') === 'application/ld+json' && tag.innerHTML === scriptInnerHTML),
      );

      expect(filteredTags.length).toBeGreaterThanOrEqual(3);
    });

    it('clears all scripts tags if none are specified', () => {
      renderClient(
        <Helmet>
          <script src="http://localhost/test.js" type="text/javascript" />
        </Helmet>,
      );

      renderClient(<Helmet />);

      const existingTags = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'src\' are not accepted', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <script property="won't work" />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      const existingTags = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('sets script tags based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <script src="http://localhost/test.js" type="text/javascript" />
            <script src="http://localhost/test2.js" type="text/javascript" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags.length).toBeGreaterThanOrEqual(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('src', 'http://localhost/test.js');
      expect(firstTag).toHaveAttribute('type', 'text/javascript');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('src', 'http://localhost/test2.js');
      expect(secondTag).toHaveAttribute('type', 'text/javascript');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('sets undefined attribute values to empty strings', () => {
      renderClient(
        <Helmet>
          <script async={undefined} src="foo.js" />
        </Helmet>,
      );

      const existingTag = document.head.querySelector(`script[${HELMET_ATTRIBUTE}]`);

      expect(existingTag).toBeDefined();
      expect(existingTag?.outerHTML).toMatchSnapshot();
    });

    it('does not render tag when primary attribute (src) is null', () => {
      renderClient(
        <Helmet>
          <script src={undefined} type="text/javascript" />
        </Helmet>,
      );

      const tagNodes = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });

    it('does not render tag when primary attribute (innerHTML) is null', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <script
            // @ts-expect-error "pre-existing"
            innerHTML={undefined}
          />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      const tagNodes = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });
  });
});
