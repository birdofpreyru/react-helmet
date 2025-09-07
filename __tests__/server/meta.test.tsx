import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer, isArray } from '../../jest/server-utils';

describe('server', () => {
  describe('API', () => {
    it('renders meta tags as React components', () => {
      const head = renderContextServer(
        <Helmet
          meta={[
            { charSet: 'utf-8' },
            {
              content: 'Test description & encoding of special characters like \' " > < `',
              name: 'description',
            },
            { content: 'text/html', httpEquiv: 'content-type' },
            { content: 'article', property: 'og:type' },
            { content: 'Test name itemprop', itemProp: 'name' },
          ]}
        />,
      );

      expect(head?.meta).toBeDefined();
      expect(head!.meta.toComponent).toBeDefined();

      const metaComponent = head?.meta.toComponent() as unknown as Element[];

      expect(metaComponent).toStrictEqual(isArray);
      expect(metaComponent).toHaveLength(5);

      metaComponent.forEach((meta: Element) => {
        expect(meta).toStrictEqual(expect.objectContaining({ type: 'meta' }));
      });

      const markup = renderToStaticMarkup(metaComponent as ReactNode);

      expect(markup).toMatchSnapshot();
    });

    it('renders meta tags as string', () => {
      const head = renderContextServer(
        <Helmet
          meta={[
            { charSet: 'utf-8' },
            {
              content: 'Test description & encoding of special characters like \' " > < `',
              name: 'description',
            },
            { content: 'text/html', httpEquiv: 'content-type' },
            { content: 'article', property: 'og:type' },
            { content: 'Test name itemprop', itemProp: 'name' },
          ]}
        />,
      );

      expect(head?.meta).toBeDefined();
      expect(head!.meta.toString).toBeDefined();
      expect(head?.meta.toString()).toMatchSnapshot();
    });
  });

  describe('Declarative API', () => {
    it('renders meta tags as React components', () => {
      const head = renderContextServer(
        <Helmet>
          <meta charSet="utf-8" />
          <meta
            content={'Test description & encoding of special characters like \' " > < `'}
            name="description"
          />
          <meta content="text/html" httpEquiv="content-type" />
          <meta content="article" property="og:type" />
          <meta content="Test name itemprop" itemProp="name" />
        </Helmet>,
      );

      expect(head?.meta).toBeDefined();
      expect(head!.meta.toComponent).toBeDefined();

      const metaComponent = head?.meta.toComponent() as unknown as Element[];

      expect(metaComponent).toStrictEqual(isArray);
      expect(metaComponent).toHaveLength(5);

      metaComponent.forEach((meta: Element) => {
        expect(meta).toStrictEqual(expect.objectContaining({ type: 'meta' }));
      });

      const markup = renderToStaticMarkup(metaComponent as ReactNode);

      expect(markup).toMatchSnapshot();
    });

    it('renders meta tags as string', () => {
      const head = renderContextServer(
        <Helmet>
          <meta charSet="utf-8" />
          <meta
            content='Test description &amp; encoding of special characters like &#x27; " &gt; &lt; `'
            name="description"
          />
          <meta content="text/html" httpEquiv="content-type" />
          <meta content="article" property="og:type" />
          <meta content="Test name itemprop" itemProp="name" />
        </Helmet>,
      );

      expect(head?.meta).toBeDefined();
      expect(head!.meta.toString).toBeDefined();
      expect(head?.meta.toString()).toMatchSnapshot();
    });
  });
});
