import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../src';
import { renderContextServer } from '../../config/jest/utils';

describe('server', () => {
  describe('Declarative API', () => {
    it('renders body attributes as component', () => {
      const head = renderContextServer(
        <Helmet>
          <body lang="ga" className="myClassName" />
        </Helmet>,
      );
      const attrs = head?.bodyAttributes.toComponent();

      expect(attrs).toBeDefined();

      const markup = renderToStaticMarkup(<body lang="en" {...attrs} />);

      expect(markup).toMatchSnapshot();
    });

    it('renders body attributes as string', () => {
      const body = renderContextServer(
        <Helmet>
          <body lang="ga" className="myClassName" />
        </Helmet>,
      );

      expect(body?.bodyAttributes).toBeDefined();
      expect(body!.bodyAttributes.toString).toBeDefined();
      expect(body?.bodyAttributes.toString()).toMatchSnapshot();
    });
  });
});
