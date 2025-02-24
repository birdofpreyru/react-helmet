import { Helmet } from '../../src';
import { HELMET_DATA_ATTRIBUTE } from '../../src/constants';
import { render } from '../../config/jest/utils';

Helmet.defaultProps.defer = false;

describe('base tag', () => {
  describe('API', () => {
    it('updates base tag', () => {
      render(<Helmet base={{ href: 'http://mysite.com/' }} />);

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`)];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        (tag) => tag.getAttribute('href') === 'http://mysite.com/',
      );

      expect(filteredTags).toHaveLength(1);
    });

    it('clears the base tag if one is not specified', () => {
      render(<Helmet base={{ href: 'http://mysite.com/' }} />);
      render(<Helmet />);

      const existingTags = document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'href\' are not accepted', () => {
      render(<Helmet base={{ property: 'won\'t work' }} />);
      const existingTags = document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('sets base tag based on deepest nested component', () => {
      render(
        <div>
          <Helmet base={{ href: 'http://mysite.com/' }} />
          <Helmet base={{ href: 'http://mysite.com/public' }} />
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);
      expect(firstTag!.getAttribute).toBeDefined();

      expect(firstTag).toHaveAttribute('href', 'http://mysite.com/public');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('does not render tag when primary attribute is null', () => {
      // @ts-expect-error "pre-existing test"
      render(<Helmet base={{ href: undefined }} />);

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`)];

      expect(existingTags).toHaveLength(0);
    });
  });

  describe('Declarative API', () => {
    it('updates base tag', () => {
      render(
        <Helmet>
          <base href="http://mysite.com/" />
        </Helmet>,
      );

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`)];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        (tag) => tag.getAttribute('href') === 'http://mysite.com/',
      );

      expect(filteredTags).toHaveLength(1);
    });

    it('clears the base tag if one is not specified', () => {
      render(<Helmet base={{ href: 'http://mysite.com/' }} />);
      render(<Helmet />);

      const existingTags = document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'href\' are not accepted', () => {
      /* eslint-disable react/no-unknown-property */
      render(
        <Helmet>
          <base property="won't work" />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      const existingTags = document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('sets base tag based on deepest nested component', () => {
      render(
        <div>
          <Helmet>
            <base href="http://mysite.com" />
          </Helmet>
          <Helmet>
            <base href="http://mysite.com/public" />
          </Helmet>
        </div>,
      );

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`)];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(firstTag).toBeInstanceOf(Element);

      expect(firstTag!.getAttribute).toBeDefined();

      expect(firstTag).toHaveAttribute('href', 'http://mysite.com/public');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('does not render tag when primary attribute is null', () => {
      render(
        <Helmet>
          <base href={undefined} />
        </Helmet>,
      );

      const tagNodes = document.head.querySelectorAll(`base[${HELMET_DATA_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });
  });
});
