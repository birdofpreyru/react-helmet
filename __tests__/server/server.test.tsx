import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer, isArray } from '../../jest/server-utils';

describe('server', () => {
  describe('API', () => {
    it('rewind() provides a fallback object for empty Helmet state', () => {
      const head = renderContextServer(<div />);
      // eslint-disable-next-line jest/no-conditional-in-test
      if (!head) throw Error('Failed');

      expect(head.htmlAttributes).toBeDefined();
      expect(head.htmlAttributes.toString).toBeDefined();
      expect(head.htmlAttributes.toString()).toBe('');
      expect(head.htmlAttributes.toComponent).toBeDefined();
      expect(head.htmlAttributes.toComponent()).toStrictEqual({});

      expect(head.title).toBeDefined();
      expect(head.title.toString).toBeDefined();
      expect(head.title.toString()).toMatchSnapshot();
      expect(head.title.toComponent).toBeDefined();

      const markup = renderToStaticMarkup(
        head.title.toComponent() as unknown as ReactNode,
      );

      expect(markup).toMatchSnapshot();

      expect(head.base).toBeDefined();
      expect(head.base.toString).toBeDefined();
      expect(head.base.toString()).toBe('');
      expect(head.base.toComponent).toBeDefined();

      const baseComponent = head.base.toComponent();

      expect(baseComponent).toStrictEqual(isArray);
      expect(baseComponent).toHaveLength(0);

      expect(head.meta).toBeDefined();
      expect(head.meta.toString).toBeDefined();
      expect(head.meta.toString()).toBe('');
      expect(head.meta.toComponent).toBeDefined();

      const metaComponent = head.meta.toComponent();

      expect(metaComponent).toStrictEqual(isArray);
      expect(metaComponent).toHaveLength(0);

      expect(head.link).toBeDefined();
      expect(head.link.toString).toBeDefined();
      expect(head.link.toString()).toBe('');
      expect(head.link.toComponent).toBeDefined();

      const linkComponent = head.link.toComponent();

      expect(linkComponent).toStrictEqual(isArray);
      expect(linkComponent).toHaveLength(0);

      expect(head.script).toBeDefined();
      expect(head.script.toString).toBeDefined();
      expect(head.script.toString()).toBe('');
      expect(head.script.toComponent).toBeDefined();

      const scriptComponent = head.script.toComponent();

      expect(scriptComponent).toStrictEqual(isArray);
      expect(scriptComponent).toHaveLength(0);

      expect(head.noscript).toBeDefined();
      expect(head.noscript.toString).toBeDefined();
      expect(head.noscript.toString()).toBe('');
      expect(head.noscript.toComponent).toBeDefined();

      const noscriptComponent = head.noscript.toComponent();

      expect(noscriptComponent).toStrictEqual(isArray);
      expect(noscriptComponent).toHaveLength(0);

      expect(head.style).toBeDefined();
      expect(head.style.toString).toBeDefined();
      expect(head.style.toString()).toBe('');
      expect(head.style.toComponent).toBeDefined();

      const styleComponent = head.style.toComponent();

      expect(styleComponent).toStrictEqual(isArray);
      expect(styleComponent).toHaveLength(0);

      expect(head.priority).toBeDefined();
      expect(head.priority.toString).toBeDefined();
      expect(head.priority.toString()).toBe('');
      expect(head.priority.toComponent).toBeDefined();
    });

    it('does not render undefined attribute values', () => {
      const head = renderContextServer(
        <Helmet
          script={[
            {
              async: undefined,
              src: 'foo.js',
            },
          ]}
        />,
      );

      expect(head?.script.toString()).toMatchSnapshot();
    });
  });

  describe('Declarative API', () => {
    it('provides initial values if no state is found', () => {
      const head = renderContextServer(<div />);

      expect(head?.meta).toBeDefined();
      expect(head!.meta.toString).toBeDefined();

      expect(head?.meta.toString()).toBe('');
    });

    // eslint-disable-next-line complexity
    it('rewind() provides a fallback object for empty Helmet state', () => {
      const head = renderContextServer(<div />);

      expect(head?.htmlAttributes).toBeDefined();
      expect(head!.htmlAttributes.toString).toBeDefined();
      expect(head?.htmlAttributes.toString()).toBe('');
      expect(head!.htmlAttributes.toComponent).toBeDefined();
      expect(head?.htmlAttributes.toComponent()).toStrictEqual({});

      expect(head?.title).toBeDefined();
      expect(head!.title.toString).toBeDefined();
      expect(head?.title.toString()).toMatchSnapshot();
      expect(head!.title.toComponent).toBeDefined();

      const markup = renderToStaticMarkup(
        head?.title.toComponent() as unknown as ReactNode,
      );

      expect(markup).toMatchSnapshot();

      expect(head?.base).toBeDefined();
      expect(head!.base.toString).toBeDefined();
      expect(head?.base.toString()).toBe('');
      expect(head!.base.toComponent).toBeDefined();

      const baseComponent = head?.base.toComponent();

      expect(baseComponent).toStrictEqual(isArray);
      expect(baseComponent).toHaveLength(0);

      expect(head?.meta).toBeDefined();
      expect(head!.meta.toString).toBeDefined();
      expect(head?.meta.toString()).toBe('');
      expect(head!.meta.toComponent).toBeDefined();

      const metaComponent = head?.meta.toComponent();

      expect(metaComponent).toStrictEqual(isArray);
      expect(metaComponent).toHaveLength(0);

      expect(head?.link).toBeDefined();
      expect(head!.link.toString).toBeDefined();
      expect(head?.link.toString()).toBe('');
      expect(head!.link.toComponent).toBeDefined();

      const linkComponent = head?.link.toComponent();

      expect(linkComponent).toStrictEqual(isArray);
      expect(linkComponent).toHaveLength(0);

      expect(head?.script).toBeDefined();
      expect(head!.script.toString).toBeDefined();
      expect(head?.script.toString()).toBe('');
      expect(head!.script.toComponent).toBeDefined();

      const scriptComponent = head?.script.toComponent();

      expect(scriptComponent).toStrictEqual(isArray);
      expect(scriptComponent).toHaveLength(0);

      expect(head?.noscript).toBeDefined();
      expect(head!.noscript.toString).toBeDefined();
      expect(head?.noscript.toString()).toBe('');
      expect(head!.noscript.toComponent).toBeDefined();

      const noscriptComponent = head?.noscript.toComponent();

      expect(noscriptComponent).toStrictEqual(isArray);
      expect(noscriptComponent).toHaveLength(0);

      expect(head?.style).toBeDefined();
      expect(head!.style.toString).toBeDefined();
      expect(head?.style.toString()).toBe('');
      expect(head!.style.toComponent).toBeDefined();

      const styleComponent = head?.style.toComponent();

      expect(styleComponent).toStrictEqual(isArray);
      expect(styleComponent).toHaveLength(0);

      expect(head?.priority).toBeDefined();
      expect(head!.priority.toString).toBeDefined();
      expect(head?.priority.toString()).toBe('');
      expect(head!.priority.toComponent).toBeDefined();
    });

    it('does not render undefined attribute values', () => {
      const head = renderContextServer(
        <Helmet>
          <script async={undefined} src="foo.js" />
        </Helmet>,
      );

      expect(head?.script.toString()).toMatchSnapshot();
    });

    it('prioritizes SEO tags when asked to', () => {
      const head = renderContextServer(
        <Helmet prioritizeSeoTags>
          <link
            href="https://www.chipotle.com"
            // eslint-disable-next-line react/no-invalid-html-attribute
            rel="notImportant"
          />
          <link href="https://www.tacobell.com" rel="canonical" />
          <meta content="A very important title" property="og:title" />
          <meta content="Some Description" name="description" />
        </Helmet>,
      );

      expect(head?.priority.toString()).toContain('href="https://www.tacobell.com" rel="canonical"');
      expect(head?.link.toString()).not.toContain('href="https://www.tacobell.com" rel="canonical"');

      expect(head?.priority.toString()).toContain(
        'content="A very important title" property="og:title"',
      );
      expect(head?.priority.toString()).toContain(
        'content="Some Description" name="description"',
      );
      expect(head?.meta.toString()).not.toContain(
        'content="A very important title" property="og:title"',
      );
      expect(head?.meta.toString()).not.toContain(
        'content="Some Description" name="description"',
      );
    });

    it('does not prioritize SEO unless asked to', () => {
      const head = renderContextServer(
        <Helmet>
          <link
            href="https://www.chipotle.com"
            // eslint-disable-next-line react/no-invalid-html-attribute
            rel="notImportant"
          />
          <link href="https://www.tacobell.com" rel="canonical" />
          <meta content="A very important title" property="og:title" />
        </Helmet>,
      );

      expect(head?.priority.toString()).not.toContain(
        'href="https://www.tacobell.com" rel="canonical"',
      );
      expect(head?.link.toString()).toContain('href="https://www.tacobell.com" rel="canonical"');

      expect(head?.priority.toString()).not.toContain(
        'content="A very important title" property="og:title"',
      );
      expect(head?.meta.toString()).toContain(
        'content="A very important title" property="og:title"',
      );
    });
  });
});
