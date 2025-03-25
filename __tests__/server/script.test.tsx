import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer, isArray } from '../../config/jest/utils';
import type { ReactNode } from 'react';

describe('server', () => {
  describe('API', () => {
    it('renders script tags as React components', () => {
      const head = renderContextServer(
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
          ]}
        />,
      );

      expect(head?.script).toBeDefined();
      expect(head!.script.toComponent).toBeDefined();

      const scriptComponent = head?.script.toComponent() as unknown as Element[];

      expect(scriptComponent).toEqual(isArray);
      expect(scriptComponent).toHaveLength(2);

      scriptComponent.forEach((script: Element) => {
        expect(script).toEqual(expect.objectContaining({ type: 'script' }));
      });

      const markup = renderToStaticMarkup(scriptComponent as ReactNode);

      expect(markup).toMatchSnapshot();
    });

    it('renders script tags as string', () => {
      const head = renderContextServer(
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
          ]}
        />,
      );

      expect(head?.script).toBeDefined();
      expect(head!.script.toString).toBeDefined();
      expect(head?.script.toString()).toMatchSnapshot();
    });
  });

  describe('Declarative API', () => {
    it('renders script tags as React components', () => {
      const head = renderContextServer(
        <Helmet>
          <script src="http://localhost/test.js" type="text/javascript" />
          <script src="http://localhost/test2.js" type="text/javascript" />
        </Helmet>,
      );

      expect(head?.script).toBeDefined();
      expect(head!.script.toComponent).toBeDefined();

      const scriptComponent = head?.script.toComponent() as unknown as Element[];

      expect(scriptComponent).toEqual(isArray);
      expect(scriptComponent).toHaveLength(2);

      scriptComponent.forEach((script: Element) => {
        expect(script).toEqual(expect.objectContaining({ type: 'script' }));
      });

      const markup = renderToStaticMarkup(scriptComponent as ReactNode);

      expect(markup).toMatchSnapshot();
    });

    it('renders script tags as string', () => {
      const head = renderContextServer(
        <Helmet>
          <script src="http://localhost/test.js" type="text/javascript" />
          <script src="http://localhost/test2.js" type="text/javascript" />
        </Helmet>,
      );

      expect(head?.script).toBeDefined();
      expect(head!.script.toString).toBeDefined();
      expect(head?.script.toString()).toMatchSnapshot();
    });
  });
});
