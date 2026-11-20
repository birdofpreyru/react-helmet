import { renderToStaticMarkup } from 'react-dom/server';

import { Helmet } from '../../build/index.js';
import { renderContextServer } from '../../jest/server-utils.tsx';

describe('server', () => {
  describe('Declarative API', () => {
    it('renders body attributes as component', () => {
      const head = renderContextServer(
        <Helmet>
          <body className="myClassName" lang="ga" />
        </Helmet>,
      );
      const attrs = head?.bodyAttributes.toComponent();

      expect(attrs).toBeDefined();

      // eslint-disable-next-line react/jsx-props-no-spreading
      const markup = renderToStaticMarkup(<body lang="en" {...attrs} />);

      expect(markup).toMatchSnapshot();
    });

    it('renders body attributes as string', () => {
      const body = renderContextServer(
        <Helmet>
          <body className="myClassName" lang="ga" />
        </Helmet>,
      );

      if (!body) throw Error('Missing body');
      expect(body.bodyAttributes).toBeDefined();
      expect(body.bodyAttributes.toString).toBeDefined();
      expect(body.bodyAttributes.toString()).toMatchSnapshot();
    });
  });
});
