/** @jest-environment jsdom */

import { renderClient } from '../../jest/browser-utils';

import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';

describe('Helmet Data', () => {
  describe('browser', () => {
    it('renders without context', () => {
      renderClient(
        <Helmet base={{ href: 'http://localhost/', target: '_blank' }} />,
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
      renderClient(
        <Helmet>
          <base href="http://localhost/" target="_blank" />
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
  });
});
