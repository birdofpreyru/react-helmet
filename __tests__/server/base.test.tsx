import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer, isArray } from '../../jest/server-utils';

describe('server', () => {
  describe('API', () => {
    it('renders base tag as React component', () => {
      const head = renderContextServer(
        <Helmet base={{ target: '_blank', href: 'http://localhost/' }} />,
      );

      expect(head?.base).toBeDefined();
      expect(head?.base.toComponent).toBeDefined();

      const baseComponent = head?.base.toComponent();

      expect(baseComponent).toEqual(isArray);
      expect(baseComponent).toHaveLength(1);

      (baseComponent as unknown as Element[]).forEach((base: Element) => {
        expect(base).toEqual(expect.objectContaining({ type: 'base' }));
      });

      const markup = renderToStaticMarkup(baseComponent);

      expect(markup).toMatchSnapshot();
    });

    it('renders base tags as string', () => {
      const head = renderContextServer(
        <Helmet base={{ target: '_blank', href: 'http://localhost/' }} />,
      );
      expect(head?.base).toBeDefined();
      expect(head?.base.toString).toBeDefined();
      expect(head?.base.toString()).toMatchSnapshot();
    });
  });

  describe('Declarative API', () => {
    it('renders base tag as React component', () => {
      const head = renderContextServer(
        <Helmet>
          <base target="_blank" href="http://localhost/" />
        </Helmet>,
      );

      expect(head?.base).toBeDefined();
      expect(head!.base.toComponent).toBeDefined();

      const baseComponent = head?.base.toComponent();

      expect(baseComponent).toEqual(isArray);
      expect(baseComponent).toHaveLength(1);

      (baseComponent as unknown as Element[]).forEach((base: Element) => {
        expect(base).toEqual(expect.objectContaining({ type: 'base' }));
      });

      const markup = renderToStaticMarkup(baseComponent);

      expect(markup).toMatchSnapshot();
    });

    it('renders base tags as string', () => {
      const head = renderContextServer(
        <Helmet>
          <base target="_blank" href="http://localhost/" />
        </Helmet>,
      );

      expect(head?.base).toBeDefined();
      expect(head!.base.toString).toBeDefined();
      expect(head?.base.toString()).toMatchSnapshot();
    });
  });
});
