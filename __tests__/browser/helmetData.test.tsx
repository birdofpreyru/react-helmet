import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';

describe('Helmet Data', () => {
  describe('browser', () => {
    it('renders without context', () => {
      const helmetData = new HelmetData({});

      renderClient(
        <Helmet helmetData={helmetData} base={{ target: '_blank', href: 'http://localhost/' }} />,
      );

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('href', 'http://localhost/');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('renders declarative without context', () => {
      const helmetData = new HelmetData({});

      renderClient(
        <Helmet helmetData={helmetData}>
          <base target="_blank" href="http://localhost/" />
        </Helmet>,
      );

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('href', 'http://localhost/');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('sets base tag based on deepest nested component', () => {
      const helmetData = new HelmetData({});

      renderClient(
        <div>
          <Helmet helmetData={helmetData}>
            <base href="http://mysite.com" />
          </Helmet>
          <Helmet helmetData={helmetData}>
            <base href="http://mysite.com/public" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();
      expect(firstTag).toHaveAttribute('href', 'http://mysite.com/public');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });
  });
});
