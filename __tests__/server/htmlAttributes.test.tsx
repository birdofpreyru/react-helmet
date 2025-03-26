import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer } from '../../config/jest/utils';

describe('server', () => {
  describe('API', () => {
    it('renders html attributes as component', () => {
      const head = renderContextServer(
        <Helmet
          htmlAttributes={{
            lang: 'ga',
            className: 'myClassName',
          }}
        />,
      );

      const attrs = head?.htmlAttributes.toComponent();

      expect(attrs).toBeDefined();

      const markup = renderToStaticMarkup(<html lang="en" {...attrs} />);

      expect(markup).toMatchSnapshot();
    });

    it('renders html attributes as string', () => {
      const head = renderContextServer(
        <Helmet
          htmlAttributes={{
            lang: 'ga',
            className: 'myClassName',
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
          <html lang="ga" className="myClassName" />
        </Helmet>,
      );

      const attrs = head?.htmlAttributes.toComponent();

      expect(attrs).toBeDefined();

      const markup = renderToStaticMarkup(<html lang="en" {...attrs} />);

      expect(markup).toMatchSnapshot();
    });

    it('renders html attributes as string', () => {
      const head = renderContextServer(
        <Helmet>
          <html lang="ga" className="myClassName" />
        </Helmet>,
      );

      expect(head?.htmlAttributes).toBeDefined();
      expect(head?.htmlAttributes.toString).toBeDefined();
      expect(head?.htmlAttributes.toString()).toMatchSnapshot();
    });
  });
});
