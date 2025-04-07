import ReactServer from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer, isArray } from '../../jest/server-utils';
import type { ReactNode } from 'react';

describe('server', () => {
  describe('API', () => {
    it('renders link tags as React components', () => {
      const head = renderContextServer(
        <Helmet
          link={[
            { href: 'http://localhost/helmet', rel: 'canonical' },
            {
              href: 'http://localhost/style.css',
              rel: 'stylesheet',
              type: 'text/css',
            },
          ]}
        />,
      );

      expect(head?.link).toBeDefined();
      expect(head!.link.toComponent).toBeDefined();

      const linkComponent = head?.link.toComponent() as unknown as Element[];

      expect(linkComponent).toEqual(isArray);
      expect(linkComponent).toHaveLength(2);

      linkComponent?.forEach((link: Element) => {
        expect(link).toEqual(expect.objectContaining({ type: 'link' }));
      });

      const markup = ReactServer.renderToStaticMarkup(
        linkComponent as ReactNode,
      );

      expect(markup).toMatchSnapshot();
    });

    it('renders link tags as string', () => {
      const head = renderContextServer(
        <Helmet
          link={[
            { href: 'http://localhost/helmet', rel: 'canonical' },
            {
              href: 'http://localhost/style.css',
              rel: 'stylesheet',
              type: 'text/css',
            },
          ]}
        />,
      );

      expect(head?.link).toBeDefined();
      expect(head!.link.toString).toBeDefined();
      expect(head?.link.toString()).toMatchSnapshot();
    });
  });

  describe('Declarative API', () => {
    it('renders link tags as React components', () => {
      const head = renderContextServer(
        <Helmet>
          <link href="http://localhost/helmet" rel="canonical" />
          <link href="http://localhost/style.css" rel="stylesheet" type="text/css" />
        </Helmet>,
      );

      expect(head?.link).toBeDefined();
      expect(head!.link.toComponent).toBeDefined();

      const linkComponent = head?.link.toComponent() as unknown as Element[];

      expect(linkComponent).toEqual(isArray);
      expect(linkComponent).toHaveLength(2);

      linkComponent.forEach((link: Element) => {
        expect(link).toEqual(expect.objectContaining({ type: 'link' }));
      });

      const markup = ReactServer.renderToStaticMarkup(
        linkComponent as ReactNode,
      );

      expect(markup).toMatchSnapshot();
    });

    it('renders link tags as string', () => {
      const head = renderContextServer(
        <Helmet>
          <link href="http://localhost/helmet" rel="canonical" />
          <link href="http://localhost/style.css" rel="stylesheet" type="text/css" />
        </Helmet>,
      );

      expect(head?.link).toBeDefined();
      expect(head!.link.toString).toBeDefined();
      expect(head?.link.toString()).toMatchSnapshot();
    });
  });
});
