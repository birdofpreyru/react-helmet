import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer } from '../../jest/server-utils';

describe('server', () => {
  describe('API', () => {
    it('renders html attributes as component', () => {
      const head = renderContextServer(
        <Helmet
          htmlAttributes={{
            className: 'myClassName',
            lang: 'ga',
          }}
        />,
      );

      const attrs = head?.htmlAttributes.toComponent();

      expect(attrs).toBeDefined();

      // eslint-disable-next-line react/jsx-props-no-spreading
      const markup = renderToStaticMarkup(<html lang="en" {...attrs} />);

      expect(markup).toMatchSnapshot();
    });

    it('renders html attributes as string', () => {
      const head = renderContextServer(
        <Helmet
          htmlAttributes={{
            className: 'myClassName',
            lang: 'ga',
          }}
        />,
      );

      expect(head?.htmlAttributes).toBeDefined();
      expect(head?.htmlAttributes.toString).toBeDefined();
      expect(head?.htmlAttributes.toString()).toMatchSnapshot();
    });
  });

  describe('Declarative API', () => {
    it('renders html attributes as component', () => {
      const head = renderContextServer(
        <Helmet>
          <html className="myClassName" lang="ga" />
        </Helmet>,
      );

      const attrs = head?.htmlAttributes.toComponent();

      expect(attrs).toBeDefined();

      // eslint-disable-next-line react/jsx-props-no-spreading
      const markup = renderToStaticMarkup(<html lang="en" {...attrs} />);

      expect(markup).toMatchSnapshot();
    });

    it('renders html attributes as string', () => {
      const head = renderContextServer(
        <Helmet>
          <html className="myClassName" lang="ga" />
        </Helmet>,
      );

      expect(head?.htmlAttributes).toBeDefined();
      expect(head?.htmlAttributes.toString).toBeDefined();
      expect(head?.htmlAttributes.toString()).toMatchSnapshot();
    });
  });
});
