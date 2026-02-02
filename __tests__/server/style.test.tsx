import { renderToStaticMarkup } from 'react-dom/server';

import { isArray, renderContextServer } from '../../jest/server-utils';
import { Helmet } from '../../src';

describe('server', () => {
  describe('API', () => {
    it('renders style tags as React components', () => {
      const head = renderContextServer(
        <Helmet
          style={[
            {
              cssText: 'body {background-color: green;}',
              type: 'text/css',
            },
            {
              cssText: 'p {font-size: 12px;}',
              type: 'text/css',
            },
          ]}
        />,
      );

      expect(head?.style).toBeDefined();
      expect(head!.style.toComponent).toBeDefined();

      const styleComponent = head?.style.toComponent();

      expect(styleComponent).toStrictEqual(isArray);
      expect(styleComponent).toHaveLength(2);

      const markup = renderToStaticMarkup(styleComponent);

      expect(markup).toMatchSnapshot();
    });

    it('renders style tags as string', () => {
      const head = renderContextServer(
        <Helmet
          style={[
            {
              cssText: 'body {background-color: green;}',
              type: 'text/css',
            },
            {
              cssText: 'p {font-size: 12px;}',
              type: 'text/css',
            },
          ]}
        />,
      );

      expect(head?.style).toBeDefined();
      expect(head!.style.toString).toBeDefined();
      expect(head?.style.toString()).toMatchSnapshot();
    });
  });

  describe('Declarative API', () => {
    it('renders style tags as React components', () => {
      const head = renderContextServer(
        <Helmet>
          <style type="text/css">{'body {background-color: green;}'}</style>
          <style type="text/css">{'p {font-size: 12px;}'}</style>
        </Helmet>,
      );

      expect(head?.style).toBeDefined();
      expect(head!.style.toComponent).toBeDefined();

      const styleComponent = head?.style.toComponent();

      expect(styleComponent).toStrictEqual(isArray);
      expect(styleComponent).toHaveLength(2);

      const markup = renderToStaticMarkup(styleComponent);

      expect(markup).toMatchSnapshot();
    });

    it('renders style tags as string', () => {
      const head = renderContextServer(
        <Helmet>
          <style type="text/css">{'body {background-color: green;}'}</style>
          <style type="text/css">{'p {font-size: 12px;}'}</style>
        </Helmet>,
      );

      expect(head?.style).toBeDefined();
      expect(head!.style.toString).toBeDefined();
      expect(head?.style.toString()).toMatchSnapshot();
    });
  });
});
