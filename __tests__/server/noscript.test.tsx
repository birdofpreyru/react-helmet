import type { ReactNode } from 'react';
import ReactServer from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer, isArray } from '../../jest/server-utils';

describe('server', () => {
  describe('API', () => {
    it('renders noscript tags as React components', () => {
      const head = renderContextServer(
        <Helmet
          noscript={[
            {
              id: 'foo',
              innerHTML: '<link rel="stylesheet" type="text/css" href="/style.css" />',
            },
            {
              id: 'bar',
              innerHTML: '<link rel="stylesheet" type="text/css" href="/style2.css" />',
            },
          ]}
        />,
      );

      expect(head?.noscript).toBeDefined();
      expect(head!.noscript.toComponent).toBeDefined();

      const noscriptComponent
        = head?.noscript.toComponent() as unknown as Element[];

      expect(noscriptComponent).toStrictEqual(isArray);
      expect(noscriptComponent).toHaveLength(2);

      noscriptComponent.forEach((noscript: Element) => {
        expect(noscript).toStrictEqual(expect.objectContaining({ type: 'noscript' }));
      });

      const markup = ReactServer.renderToStaticMarkup(
        noscriptComponent as ReactNode,
      );

      expect(markup).toMatchSnapshot();
    });
  });

  describe('Declarative API', () => {
    it('renders noscript tags as React components', () => {
      const head = renderContextServer(
        <Helmet>
          <noscript id="foo">{'<link rel="stylesheet" type="text/css" href="/style.css" />'}</noscript>
          <noscript id="bar">{'<link rel="stylesheet" type="text/css" href="/style2.css" />'}</noscript>
        </Helmet>,
      );

      expect(head?.noscript).toBeDefined();
      expect(head!.noscript.toComponent).toBeDefined();

      const noscriptComponent
        = head?.noscript.toComponent() as unknown as Element[];

      expect(noscriptComponent).toStrictEqual(isArray);
      expect(noscriptComponent).toHaveLength(2);

      noscriptComponent.forEach((noscript: Element) => {
        expect(noscript).toStrictEqual(expect.objectContaining({ type: 'noscript' }));
      });

      const markup = ReactServer.renderToStaticMarkup(
        noscriptComponent as ReactNode,
      );

      expect(markup).toMatchSnapshot();
    });
  });
});
