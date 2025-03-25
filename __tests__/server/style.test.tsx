import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer, isArray } from '../../config/jest/utils';

describe('server', () => {
  describe('API', () => {
    it('renders style tags as React components', () => {
      const head = renderContextServer(
        <Helmet
          style={[
            {
              type: 'text/css',
              cssText: 'body {background-color: green;}',
            },
            {
              type: 'text/css',
              cssText: 'p {font-size: 12px;}',
            },
          ]}
        />,
      );

      expect(head?.style).toBeDefined();
      expect(head!.style.toComponent).toBeDefined();

      const styleComponent = head?.style.toComponent();

      expect(styleComponent).toEqual(isArray);
      expect(styleComponent).toHaveLength(2);

      const markup = renderToStaticMarkup(styleComponent);

      expect(markup).toMatchSnapshot();
    });

    it('renders style tags as string', () => {
      const head = renderContextServer(
        <Helmet
          style={[
            {
              type: 'text/css',
              cssText: 'body {background-color: green;}',
            },
            {
              type: 'text/css',
              cssText: 'p {font-size: 12px;}',
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

      expect(styleComponent).toEqual(isArray);
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
