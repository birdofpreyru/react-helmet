import { renderToStaticMarkup } from 'react-dom/server';

import { isArray, renderContextServer } from '../../jest/server-utils';
import { Helmet } from '../../src';

describe('server', () => {
  describe('API', () => {
    it('renders base tag as React component', () => {
      const head = renderContextServer(
        <Helmet base={{ href: 'http://localhost/', target: '_blank' }} />,
      );

      expect(head?.base).toBeDefined();
      expect(head?.base.toComponent).toBeDefined();

      const baseComponent = head?.base.toComponent();

      expect(baseComponent).toStrictEqual(isArray);
      expect(baseComponent).toHaveLength(1);

      (baseComponent as unknown as Element[]).forEach((base: Element) => {
        expect(base).toStrictEqual(expect.objectContaining({ type: 'base' }));
      });

      const markup = renderToStaticMarkup(baseComponent);

      expect(markup).toMatchSnapshot();
    });

    it('renders base tags as string', () => {
      const head = renderContextServer(
        <Helmet base={{ href: 'http://localhost/', target: '_blank' }} />,
      );
      expect(head?.base).toBeDefined();
      expect(head?.base.toString).toBeDefined();
      expect(head?.base.toString()).toMatchSnapshot();
    });

    it("renders base tag with only 'target' as React component", () => {
      const head = renderContextServer(<Helmet base={{ target: '_blank' }} />);

      expect(head?.base).toBeDefined();
      expect(head?.base.toComponent).toBeDefined();

      const baseComponent = head?.base.toComponent();

      expect(baseComponent).toStrictEqual(isArray);
      expect(baseComponent).toHaveLength(1);

      const markup = renderToStaticMarkup(baseComponent);
      expect(markup).toContain('target="_blank"');
      expect(markup).not.toContain('href=');
    });

    it("renders base tag with only 'target' as string", () => {
      const head = renderContextServer(<Helmet base={{ target: '_blank' }} />);
      expect(head?.base).toBeDefined();
      expect(head?.base.toString).toBeDefined();
      expect(head?.base.toString()).toContain('target="_blank"');
      expect(head?.base.toString()).not.toContain('href=');
    });
  });

  describe('Declarative API', () => {
    it('renders base tag as React component', () => {
      const head = renderContextServer(
        <Helmet>
          <base href="http://localhost/" target="_blank" />
        </Helmet>,
      );

      expect(head?.base).toBeDefined();
      expect(head!.base.toComponent).toBeDefined();

      const baseComponent = head?.base.toComponent();

      expect(baseComponent).toStrictEqual(isArray);
      expect(baseComponent).toHaveLength(1);

      (baseComponent as unknown as Element[]).forEach((base: Element) => {
        expect(base).toStrictEqual(expect.objectContaining({ type: 'base' }));
      });

      const markup = renderToStaticMarkup(baseComponent);

      expect(markup).toMatchSnapshot();
    });

    it('renders base tags as string', () => {
      const head = renderContextServer(
        <Helmet>
          <base href="http://localhost/" target="_blank" />
        </Helmet>,
      );

      expect(head?.base).toBeDefined();
      expect(head!.base.toString).toBeDefined();
      expect(head?.base.toString()).toMatchSnapshot();
    });

    it("renders base tag with only 'target' as React component", () => {
      const head = renderContextServer(
        <Helmet>
          <base target="_blank" />
        </Helmet>,
      );

      expect(head?.base).toBeDefined();
      expect(head?.base.toComponent).toBeDefined();

      const baseComponent = head?.base.toComponent();

      expect(baseComponent).toStrictEqual(isArray);
      expect(baseComponent).toHaveLength(1);

      const markup = renderToStaticMarkup(baseComponent);

      expect(markup).toContain('target="_blank"');
      expect(markup).not.toContain('href=');
    });

    it("renders base tag with only 'target' as string", () => {
      const head = renderContextServer(
        <Helmet>
          <base target="_blank" />
        </Helmet>,
      );

      expect(head?.base).toBeDefined();
      expect(head?.base.toString).toBeDefined();
      expect(head?.base.toString()).toContain('target="_blank"');
      expect(head?.base.toString()).not.toContain('href=');
    });
  });
});
