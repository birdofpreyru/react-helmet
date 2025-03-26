import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer, isArray } from '../../jest/server-utils';
import type { ReactNode } from 'react';

describe('server', () => {
  describe('API', () => {
    it('renders meta tags as React components', () => {
      const head = renderContextServer(
        <Helmet
          meta={[
            { charSet: 'utf-8' },
            {
              name: 'description',
              content: 'Test description & encoding of special characters like \' " > < `',
            },
            { httpEquiv: 'content-type', content: 'text/html' },
            { property: 'og:type', content: 'article' },
            { itemProp: 'name', content: 'Test name itemprop' },
          ]}
        />,
      );

      expect(head?.meta).toBeDefined();
      expect(head!.meta.toComponent).toBeDefined();

      const metaComponent = head?.meta.toComponent() as unknown as Element[];

      expect(metaComponent).toEqual(isArray);
      expect(metaComponent).toHaveLength(5);

      metaComponent.forEach((meta: Element) => {
        expect(meta).toEqual(expect.objectContaining({ type: 'meta' }));
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
              name: 'description',
              content: 'Test description & encoding of special characters like \' " > < `',
            },
            { httpEquiv: 'content-type', content: 'text/html' },
            { property: 'og:type', content: 'article' },
            { itemProp: 'name', content: 'Test name itemprop' },
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
            name="description"
            content={'Test description & encoding of special characters like \' " > < `'}
          />
          <meta httpEquiv="content-type" content="text/html" />
          <meta property="og:type" content="article" />
          <meta itemProp="name" content="Test name itemprop" />
        </Helmet>,
      );

      expect(head?.meta).toBeDefined();
      expect(head!.meta.toComponent).toBeDefined();

      const metaComponent = head?.meta.toComponent() as unknown as Element[];

      expect(metaComponent).toEqual(isArray);
      expect(metaComponent).toHaveLength(5);

      metaComponent.forEach((meta: Element) => {
        expect(meta).toEqual(expect.objectContaining({ type: 'meta' }));
      });

      const markup = renderToStaticMarkup(metaComponent as ReactNode);

      expect(markup).toMatchSnapshot();
    });

    it('renders meta tags as string', () => {
      const head = renderContextServer(
        <Helmet>
          <meta charSet="utf-8" />
          <meta
            name="description"
            content='Test description &amp; encoding of special characters like &#x27; " &gt; &lt; `'
          />
          <meta httpEquiv="content-type" content="text/html" />
          <meta property="og:type" content="article" />
          <meta itemProp="name" content="Test name itemprop" />
        </Helmet>,
      );

      expect(head?.meta).toBeDefined();
      expect(head!.meta.toString).toBeDefined();
      expect(head?.meta.toString()).toMatchSnapshot();
    });
  });
});
