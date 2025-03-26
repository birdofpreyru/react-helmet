/** @jest-environment jsdom */

import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';
import { renderClient } from '../../jest/browser-utils';

describe('base tag', () => {
  describe('API', () => {
    it('updates base tag', () => {
      renderClient(<Helmet base={{ href: 'http://mysite.com/' }} />);

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`)];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        (tag) => tag.getAttribute('href') === 'http://mysite.com/',
      );

      expect(filteredTags).toHaveLength(1);
    });

    it('clears the base tag if one is not specified', () => {
      renderClient(<Helmet base={{ href: 'http://mysite.com/' }} />);
      renderClient(<Helmet />);

      const existingTags = document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'href\' are not accepted', () => {
      renderClient(<Helmet base={{ property: 'won\'t work' }} />);
      const existingTags = document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('sets base tag based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet base={{ href: 'http://mysite.com/' }} />
          <Helmet base={{ href: 'http://mysite.com/public' }} />
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

    it('does not render tag when primary attribute is null', () => {
      // @ts-expect-error "pre-existing test"
      renderClient(<Helmet base={{ href: undefined }} />);

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`)];

      expect(existingTags).toHaveLength(0);
    });
  });

  describe('Declarative API', () => {
    it('updates base tag', () => {
      renderClient(
        <Helmet>
          <base href="http://mysite.com/" />
        </Helmet>,
      );

      const existingTags = [...document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`)];

      expect(existingTags).toBeDefined();

      const filteredTags = existingTags.filter(
        (tag) => tag.getAttribute('href') === 'http://mysite.com/',
      );

      expect(filteredTags).toHaveLength(1);
    });

    it('clears the base tag if one is not specified', () => {
      renderClient(<Helmet base={{ href: 'http://mysite.com/' }} />);
      renderClient(<Helmet />);

      const existingTags = document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'href\' are not accepted', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <base property="won't work" />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      const existingTags = document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('sets base tag based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <base href="http://mysite.com" />
          </Helmet>
          <Helmet>
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

    it('does not render tag when primary attribute is null', () => {
      renderClient(
        <Helmet>
          <base href={undefined} />
        </Helmet>,
      );

      const tagNodes = document.head.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });
  });
});
