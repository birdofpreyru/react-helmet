import { Helmet } from '../../src';
import { renderContextServer } from '../../config/jest/utils';

// TODO: Current test names in this file are stale, and do not represent the new
// library behavior - now we require to render <Helmet> components inside a tree
// of a Helmet provider.

describe('Helmet Data', () => {
  describe('server', () => {
    it('renders without context', () => {
      const head = renderContextServer(
        <Helmet base={{ target: '_blank', href: 'http://localhost/' }} />,
      );

      expect(head?.base).toBeDefined();
      expect(head?.base.toString).toBeDefined();
      expect(head?.base.toString()).toMatchSnapshot();
    });

    it('renders declarative without context', () => {
      const head = renderContextServer(
        <Helmet>
          <base target="_blank" href="http://localhost/" />
        </Helmet>,
      );

      expect(head?.base).toBeDefined();
      expect(head?.base.toString).toBeDefined();
      expect(head?.base.toString()).toMatchSnapshot();
    });

    it('sets base tag based on deepest nested component', () => {
      const head = renderContextServer(
        <div>
          <Helmet>
            <base href="http://mysite.com" />
          </Helmet>
          <Helmet>
            <base href="http://mysite.com/public" />
          </Helmet>
        </div>,
      );

      expect(head?.base).toBeDefined();
      expect(head?.base.toString).toBeDefined();
      expect(head?.base.toString()).toMatchSnapshot();
    });

    it('works with the same context object but separate HelmetData instances', () => {
      const head = renderContextServer(
        <div>
          <Helmet>
            <base href="http://mysite.com" />
          </Helmet>
          <Helmet>
            <base href="http://mysite.com/public" />
          </Helmet>
        </div>,
      );

      expect(head?.base).toBeDefined();
      expect(head?.base.toString).toBeDefined();
      expect(head?.base.toString()).toMatchSnapshot();
    });
  });
});
