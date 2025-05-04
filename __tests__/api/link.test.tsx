/** @jest-environment jsdom */

import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';
import { renderClient } from '../../jest/browser-utils';

describe('link tags', () => {
  describe('API', () => {
    it('updates link tags', () => {
      renderClient(
        <Helmet
          link={[
            {
              href: 'http://localhost/helmet',
              rel: 'canonical',
            },
            {
              href: 'http://localhost/style.css',
              rel: 'stylesheet',
              type: 'text/css',
            },
          ]}
        />,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        // eslint-disable-next-line jest/no-conditional-in-test
        (tag) => (
          // eslint-disable-next-line jest/no-conditional-in-test
          tag.getAttribute('href') === 'http://localhost/style.css'
          && tag.getAttribute('rel') === 'stylesheet'
          && tag.getAttribute('type') === 'text/css'
        ) || (
          // eslint-disable-next-line jest/no-conditional-in-test
          tag.getAttribute('href') === 'http://localhost/helmet'
          && tag.getAttribute('rel') === 'canonical'
        ),
      );

      expect(filteredTags.length).toBeGreaterThanOrEqual(2);
    });

    it('clears all link tags if none are specified', () => {
      renderClient(
        <Helmet
          link={[
            {
              href: 'http://localhost/helmet',
              rel: 'canonical',
            },
          ]}
        />,
      );

      renderClient(<Helmet />);

      const tagNodes = document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'href\' or \'rel\' are not accepted, even if they are valid for other tags', () => {
      // @ts-expect-error "pre-existing"
      renderClient(<Helmet link={[{ httpEquiv: 'won\'t work' }]} />);

      const tagNodes = document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags \'rel\' and \'href\' properly use \'rel\' as the primary identification for this tag, regardless of ordering', () => {
      renderClient(
        <div>
          <Helmet
            link={[
              {
                href: 'http://localhost/helmet',
                rel: 'canonical',
              },
            ]}
          />
          <Helmet
            link={[
              {
                href: 'http://localhost/helmet/new',
                rel: 'canonical',
              },
            ]}
          />
          <Helmet
            link={[
              {
                href: 'http://localhost/helmet/newest',
                rel: 'canonical',
              },
            ]}
          />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet/newest');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('tags with rel=\'stylesheet\' uses the href as the primary identification of the tag, regardless of ordering', () => {
      renderClient(
        <div>
          <Helmet
            link={[
              {
                href: 'http://localhost/style.css',
                media: 'all',
                rel: 'stylesheet',
                type: 'text/css',
              },
            ]}
          />
          <Helmet
            link={[
              {
                href: 'http://localhost/inner.css',
                media: 'all',
                rel: 'stylesheet',
                type: 'text/css',
              },
            ]}
          />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('href', 'http://localhost/style.css');
      expect(firstTag).toHaveAttribute('rel', 'stylesheet');
      expect(firstTag).toHaveAttribute('type', 'text/css');
      expect(firstTag).toHaveAttribute('media', 'all');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('rel', 'stylesheet');
      expect(secondTag).toHaveAttribute('href', 'http://localhost/inner.css');
      expect(secondTag).toHaveAttribute('type', 'text/css');
      expect(secondTag).toHaveAttribute('media', 'all');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('sets link tags based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet
            link={[
              {
                href: 'http://localhost/helmet',
                rel: 'canonical',
              },
              {
                href: 'http://localhost/style.css',
                media: 'all',
                rel: 'stylesheet',
                type: 'text/css',
              },
            ]}
          />
          <Helmet
            link={[
              {
                href: 'http://localhost/helmet/innercomponent',
                rel: 'canonical',
              },
              {
                href: 'http://localhost/inner.css',
                media: 'all',
                rel: 'stylesheet',
                type: 'text/css',
              },
            ]}
          />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag, thirdTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags.length).toBeGreaterThanOrEqual(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('href', 'http://localhost/style.css');
      expect(firstTag).toHaveAttribute('rel', 'stylesheet');
      expect(firstTag).toHaveAttribute('type', 'text/css');
      expect(firstTag).toHaveAttribute('media', 'all');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('href', 'http://localhost/helmet/innercomponent');
      expect(secondTag).toHaveAttribute('rel', 'canonical');
      expect(secondTag?.outerHTML).toMatchSnapshot();

      expect(thirdTag).toBeInstanceOf(Element);
      expect(thirdTag!.getAttribute).toBeDefined();
      expect(thirdTag).toHaveAttribute('href', 'http://localhost/inner.css');
      expect(thirdTag).toHaveAttribute('rel', 'stylesheet');
      expect(thirdTag).toHaveAttribute('type', 'text/css');
      expect(thirdTag).toHaveAttribute('media', 'all');
      expect(thirdTag?.outerHTML).toMatchSnapshot();
    });

    it('allows duplicate link tags if specified in the same component', () => {
      renderClient(
        <Helmet
          link={[
            {
              href: 'http://localhost/helmet',
              rel: 'canonical',
            },
            {
              href: 'http://localhost/helmet/component',
              rel: 'canonical',
            },
          ]}
        />,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags.length).toBeGreaterThanOrEqual(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('rel', 'canonical');
      expect(secondTag).toHaveAttribute('href', 'http://localhost/helmet/component');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('overrides duplicate link tags with a single link tag in a nested component', () => {
      renderClient(
        <div>
          <Helmet
            link={[
              {
                href: 'http://localhost/helmet',
                rel: 'canonical',
              },
              {
                href: 'http://localhost/helmet/component',
                rel: 'canonical',
              },
            ]}
          />
          <Helmet
            link={[
              {
                href: 'http://localhost/helmet/innercomponent',
                rel: 'canonical',
              },
            ]}
          />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet/innercomponent');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('overrides single link tag with duplicate link tags in a nested component', () => {
      renderClient(
        <div>
          <Helmet
            link={[
              {
                href: 'http://localhost/helmet',
                rel: 'canonical',
              },
            ]}
          />
          <Helmet
            link={[
              {
                href: 'http://localhost/helmet/component',
                rel: 'canonical',
              },
              {
                href: 'http://localhost/helmet/innercomponent',
                rel: 'canonical',
              },
            ]}
          />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet/component');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('rel', 'canonical');
      expect(secondTag).toHaveAttribute('href', 'http://localhost/helmet/innercomponent');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('does not render tag when primary attribute is null', () => {
      renderClient(
        <Helmet
          link={[
            // TODO: Note, the order of attributes in this case matter, as both
            // "rel" and "href" are primary attributes, and thus the latter of
            // them is treated as the actual primary attribute. Does not look as
            // a good, intuitive behavior to me... perhaps to be reworked.
            // @ts-expect-error "pre-existing"
            { rel: 'icon', sizes: '192x192', href: null }, // eslint-disable-line sort-keys
            {
              rel: 'canonical',
              href: 'http://localhost/helmet/component', // eslint-disable-line sort-keys
            },
          ]}
        />,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet/component');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });
  });

  describe('Declarative API', () => {
    it('updates link tags', () => {
      renderClient(
        <Helmet>
          <link href="http://localhost/helmet" rel="canonical" />
          <link href="http://localhost/style.css" rel="stylesheet" type="text/css" />
        </Helmet>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        // eslint-disable-next-line jest/no-conditional-in-test
        (tag) => (
          // eslint-disable-next-line jest/no-conditional-in-test
          tag.getAttribute('href') === 'http://localhost/style.css'
          && tag.getAttribute('rel') === 'stylesheet'
          && tag.getAttribute('type') === 'text/css'
        ) || (
          // eslint-disable-next-line jest/no-conditional-in-test
          tag.getAttribute('href') === 'http://localhost/helmet'
          && tag.getAttribute('rel') === 'canonical'
        ),
      );

      expect(filteredTags.length).toBeGreaterThanOrEqual(2);
    });

    it('clears all link tags if none are specified', () => {
      renderClient(
        <Helmet>
          <link href="http://localhost/helmet" rel="canonical" />
        </Helmet>,
      );

      renderClient(<Helmet />);

      const tagNodes = document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'href\' or \'rel\' are not accepted, even if they are valid for other tags', () => {
      renderClient(
        <Helmet>
          <link
            // @ts-expect-error "pre-existing"
            httpEquiv="won't work"
          />
        </Helmet>,
      );

      const tagNodes = document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags \'rel\' and \'href\' properly use \'rel\' as the primary identification for this tag, regardless of ordering', () => {
      renderClient(
        <div>
          <Helmet>
            <link href="http://localhost/helmet" rel="canonical" />
          </Helmet>
          <Helmet>
            <link href="http://localhost/helmet/new" rel="canonical" />
          </Helmet>
          <Helmet>
            <link href="http://localhost/helmet/newest" rel="canonical" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet/newest');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('tags with rel=\'stylesheet\' uses the href as the primary identification of the tag, regardless of ordering', () => {
      renderClient(
        <div>
          <Helmet>
            <link href="http://localhost/style.css" media="all" rel="stylesheet" type="text/css" />
          </Helmet>
          <Helmet>
            <link href="http://localhost/inner.css" media="all"rel="stylesheet" type="text/css" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('href', 'http://localhost/style.css');
      expect(firstTag).toHaveAttribute('rel', 'stylesheet');
      expect(firstTag).toHaveAttribute('type', 'text/css');
      expect(firstTag).toHaveAttribute('media', 'all');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('rel', 'stylesheet');
      expect(secondTag).toHaveAttribute('href', 'http://localhost/inner.css');
      expect(secondTag).toHaveAttribute('type', 'text/css');
      expect(secondTag).toHaveAttribute('media', 'all');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('sets link tags based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <link href="http://localhost/helmet" rel="canonical" />
            <link href="http://localhost/style.css" media="all" rel="stylesheet" type="text/css" />
          </Helmet>
          <Helmet>
            <link href="http://localhost/helmet/innercomponent" rel="canonical" />
            <link href="http://localhost/inner.css" media="all" rel="stylesheet" type="text/css" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag, thirdTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags.length).toBeGreaterThanOrEqual(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('href', 'http://localhost/style.css');
      expect(firstTag).toHaveAttribute('rel', 'stylesheet');
      expect(firstTag).toHaveAttribute('type', 'text/css');
      expect(firstTag).toHaveAttribute('media', 'all');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('href', 'http://localhost/helmet/innercomponent');
      expect(secondTag).toHaveAttribute('rel', 'canonical');
      expect(secondTag?.outerHTML).toMatchSnapshot();

      expect(thirdTag).toBeInstanceOf(Element);
      expect(thirdTag!.getAttribute).toBeDefined();
      expect(thirdTag).toHaveAttribute('href', 'http://localhost/inner.css');
      expect(thirdTag).toHaveAttribute('rel', 'stylesheet');
      expect(thirdTag).toHaveAttribute('type', 'text/css');
      expect(thirdTag).toHaveAttribute('media', 'all');
      expect(thirdTag?.outerHTML).toMatchSnapshot();
    });

    it('allows duplicate link tags if specified in the same component', () => {
      renderClient(
        <Helmet>
          <link href="http://localhost/helmet" rel="canonical" />
          <link href="http://localhost/helmet/component" rel="canonical" />
        </Helmet>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags.length).toBeGreaterThanOrEqual(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('rel', 'canonical');
      expect(secondTag).toHaveAttribute('href', 'http://localhost/helmet/component');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('overrides duplicate link tags with a single link tag in a nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <link href="http://localhost/helmet" rel="canonical" />
            <link href="http://localhost/helmet/component" rel="canonical" />
          </Helmet>
          <Helmet>
            <link href="http://localhost/helmet/innercomponent" rel="canonical" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet/innercomponent');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('overrides single link tag with duplicate link tags in a nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <link href="http://localhost/helmet" rel="canonical" />
          </Helmet>
          <Helmet>
            <link href="http://localhost/helmet/component" rel="canonical" />
            <link href="http://localhost/helmet/innercomponent" rel="canonical" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet/component');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('rel', 'canonical');
      expect(secondTag).toHaveAttribute('href', 'http://localhost/helmet/innercomponent');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('does not render tag when primary attribute is null', () => {
      renderClient(
        <Helmet>
          <link
            rel="icon"
            sizes="192x192"
            // TODO: Note, the order of attributes in this case matter, as both
            // "rel" and "href" are primary attributes, and thus the latter of
            // them is treated as the actual primary attribute. Does not look as
            // a good, intuitive behavior to me... perhaps to be reworked.
            // @ts-expect-error "pre-existing"
            href={null} // eslint-disable-line react/jsx-sort-props, @stylistic/jsx-sort-props
          />
          <link href="http://localhost/helmet/component" rel="canonical" />
        </Helmet>,
      );

      const existingTags = [...document.head.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('rel', 'canonical');
      expect(firstTag).toHaveAttribute('href', 'http://localhost/helmet/component');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });
  });
});
