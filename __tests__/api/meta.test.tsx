/** @jest-environment jsdom */

import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';
import { renderClient } from '../../jest/browser-utils';

describe('meta tags', () => {
  describe('API', () => {
    it('updates meta tags', () => {
      renderClient(
        <Helmet
          meta={[
            { charSet: 'utf-8' },
            {
              content: 'Test description',
              name: 'description',
            },
            {
              content: 'text/html',
              httpEquiv: 'content-type',
            },
            { content: 'article', property: 'og:type' },
            {
              content: 'Test name itemprop',
              itemProp: 'name',
            },
          ]}
        />,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        // eslint-disable-next-line jest/no-conditional-in-test
        (tag) => tag.getAttribute('charset') === 'utf-8'
          || (
            // eslint-disable-next-line jest/no-conditional-in-test
            tag.getAttribute('name') === 'description'
            && tag.getAttribute('content') === 'Test description'
          )
          || (
            // eslint-disable-next-line jest/no-conditional-in-test
            tag.getAttribute('http-equiv') === 'content-type'
            && tag.getAttribute('content') === 'text/html'
          )
          || (
            // eslint-disable-next-line jest/no-conditional-in-test
            tag.getAttribute('itemprop') === 'name'
            && tag.getAttribute('content') === 'Test name itemprop'
          ),
      );

      expect(filteredTags.length).toBeGreaterThanOrEqual(4);
    });

    it('clears all meta tags if none are specified', () => {
      renderClient(<Helmet meta={[{ content: 'Test description', name: 'description' }]} />);

      renderClient(<Helmet />);

      const existingTags = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'name\', \'http-equiv\', \'property\', \'charset\', or \'itemprop\' are not accepted', () => {
      renderClient(
        <Helmet
          meta={[
            {
              // @ts-expect-error "pre-existing"
              href: 'won\'t work',
            },
          ]}
        />,
      );

      const existingTags = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('sets meta tags based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet
            meta={[
              { charSet: 'utf-8' },
              {
                content: 'Test description',
                name: 'description',
              },
            ]}
          />
          <Helmet
            meta={[
              {
                content: 'Inner description',
                name: 'description',
              },
              { content: 'test,meta,tags', name: 'keywords' },
            ]}
          />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag, thirdTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(3);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('charset', 'utf-8');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('name', 'description');
      expect(secondTag).toHaveAttribute('content', 'Inner description');
      expect(secondTag?.outerHTML).toMatchSnapshot();

      expect(thirdTag).toBeInstanceOf(Element);
      expect(thirdTag!.getAttribute).toBeDefined();
      expect(thirdTag).toHaveAttribute('name', 'keywords');
      expect(thirdTag).toHaveAttribute('content', 'test,meta,tags');
      expect(thirdTag?.outerHTML).toMatchSnapshot();
    });

    it('allows duplicate meta tags if specified in the same component', () => {
      renderClient(
        <Helmet
          meta={[
            {
              content: 'Test description',
              name: 'description',
            },
            {
              content: 'Duplicate description',
              name: 'description',
            },
          ]}
        />,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('name', 'description');
      expect(firstTag).toHaveAttribute('content', 'Test description');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('name', 'description');
      expect(secondTag).toHaveAttribute('content', 'Duplicate description');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('overrides duplicate meta tags with single meta tag in a nested component', () => {
      renderClient(
        <div>
          <Helmet
            meta={[
              {
                content: 'Test description',
                name: 'description',
              },
              {
                content: 'Duplicate description',
                name: 'description',
              },
            ]}
          />
          <Helmet
            meta={[
              {
                content: 'Inner description',
                name: 'description',
              },
            ]}
          />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('name', 'description');
      expect(firstTag).toHaveAttribute('content', 'Inner description');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('overrides single meta tag with duplicate meta tags in a nested component', () => {
      renderClient(
        <div>
          <Helmet
            meta={[
              {
                content: 'Test description',
                name: 'description',
              },
            ]}
          />
          <Helmet
            meta={[
              {
                content: 'Inner description',
                name: 'description',
              },
              {
                content: 'Inner duplicate description',
                name: 'description',
              },
            ]}
          />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('name', 'description');
      expect(firstTag).toHaveAttribute('content', 'Inner description');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('name', 'description');
      expect(secondTag).toHaveAttribute('content', 'Inner duplicate description');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('does not render tag when primary attribute is null', () => {
      renderClient(
        <Helmet
          meta={[
            {
              content: 'Inner duplicate description',
              name: undefined,
            },
          ]}
        />,
      );

      const tagNodes = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });

    it('fails gracefully when meta is wrong shape', () => {
      const originalConsole = global.console;
      // TODO: Revise.
      // eslint-disable-next-line jest/prefer-spy-on
      global.console.warn = jest.fn();

      renderClient(
        <Helmet
          meta={
            // @ts-expect-error "pre-existing"
            { content: 'some title', name: 'title' }
          }
        />,
      );

      const tagNodes = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);

      // TODO: Revise.
      // eslint-disable-next-line no-console, jest/prefer-called-with
      expect(console.warn).toHaveBeenCalled();

      // TODO: Revise
      // eslint-disable-next-line no-console, jest/prefer-jest-mocked
      expect((console.warn as jest.Mock<unknown, unknown[]>).mock.calls[0]?.[0])
        .toMatchSnapshot();

      global.console = originalConsole;
    });
  });

  describe('Declarative API', () => {
    it('updates meta tags', () => {
      renderClient(
        <Helmet>
          <meta charSet="utf-8" />
          <meta content="Test description" name="description" />
          <meta content="text/html" httpEquiv="content-type" />
          <meta content="article" property="og:type" />
          <meta content="Test name itemprop" itemProp="name" />
        </Helmet>,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        // eslint-disable-next-line jest/no-conditional-in-test
        (tag) => tag.getAttribute('charset') === 'utf-8'
          || (
            // eslint-disable-next-line jest/no-conditional-in-test
            tag.getAttribute('name') === 'description'
            && tag.getAttribute('content') === 'Test description'
          )
          || (
            // eslint-disable-next-line jest/no-conditional-in-test
            tag.getAttribute('http-equiv') === 'content-type'
            && tag.getAttribute('content') === 'text/html'
          )
          || (
            // eslint-disable-next-line jest/no-conditional-in-test
            tag.getAttribute('itemprop') === 'name'
            && tag.getAttribute('content') === 'Test name itemprop'
          ),
      );

      expect(filteredTags.length).toBeGreaterThanOrEqual(4);
    });

    it('clears all meta tags if none are specified', () => {
      renderClient(
        <Helmet>
          <meta content="Test description" name="description" />
        </Helmet>,
      );

      renderClient(<Helmet />);

      const existingTags = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'name\', \'http-equiv\', \'property\', \'charset\', or \'itemprop\' are not accepted', () => {
      renderClient(
        <Helmet>
          <meta
            // @ts-expect-error "pre-existing"
            href="won't work"
          />
        </Helmet>,
      );

      const existingTags = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('sets meta tags based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <meta charSet="utf-8" />
            <meta content="Test description" name="description" />
          </Helmet>
          <Helmet>
            <meta content="Inner description" name="description" />
            <meta content="test,meta,tags" name="keywords" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag, thirdTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(3);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('charset', 'utf-8');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('name', 'description');
      expect(secondTag).toHaveAttribute('content', 'Inner description');
      expect(secondTag?.outerHTML).toMatchSnapshot();

      expect(thirdTag).toBeInstanceOf(Element);
      expect(thirdTag!.getAttribute).toBeDefined();
      expect(thirdTag).toHaveAttribute('name', 'keywords');
      expect(thirdTag).toHaveAttribute('content', 'test,meta,tags');
      expect(thirdTag?.outerHTML).toMatchSnapshot();
    });

    it('allows duplicate meta tags if specified in the same component', () => {
      renderClient(
        <Helmet>
          <meta content="Test description" name="description" />
          <meta content="Duplicate description" name="description" />
        </Helmet>,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('name', 'description');
      expect(firstTag).toHaveAttribute('content', 'Test description');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('name', 'description');
      expect(secondTag).toHaveAttribute('content', 'Duplicate description');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('overrides duplicate meta tags with single meta tag in a nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <meta content="Test description" name="description" />
            <meta content="Duplicate description" name="description" />
          </Helmet>
          <Helmet>
            <meta content="Inner description" name="description" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('name', 'description');
      expect(firstTag).toHaveAttribute('content', 'Inner description');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('overrides single meta tag with duplicate meta tags in a nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <meta content="Test description" name="description" />
          </Helmet>
          <Helmet>
            <meta content="Inner description" name="description" />
            <meta content="Inner duplicate description" name="description" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`)];
      const [firstTag, secondTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(2);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('name', 'description');
      expect(firstTag).toHaveAttribute('content', 'Inner description');
      expect(firstTag?.outerHTML).toMatchSnapshot();

      expect(secondTag).toBeInstanceOf(Element);
      expect(secondTag!.getAttribute).toBeDefined();
      expect(secondTag).toHaveAttribute('name', 'description');
      expect(secondTag).toHaveAttribute('content', 'Inner duplicate description');
      expect(secondTag?.outerHTML).toMatchSnapshot();
    });

    it('does not render tag when primary attribute is null', () => {
      renderClient(
        <Helmet>
          <meta content="Inner duplicate description" name={undefined} />
        </Helmet>,
      );

      const tagNodes = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });
  });
});
