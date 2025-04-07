/** @jest-environment jsdom */

import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';
import { renderClient } from '../../jest/browser-utils';

describe('noscript tags', () => {
  describe('API', () => {
    it('updates noscript tags', () => {
      renderClient(
        <Helmet
          noscript={[
            {
              id: 'bar',
              innerHTML: '<link rel="stylesheet" type="text/css" href="foo.css" />',
            },
          ]}
        />,
      );

      const existingTags = [...document.head.getElementsByTagName('noscript')];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);
      expect(firstTag?.id).toBe('bar');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('clears all noscripts tags if none are specified', () => {
      renderClient(<Helmet noscript={[{ id: 'bar' }]} />);

      renderClient(<Helmet />);

      const existingTags = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'innerHTML\' are not accepted', () => {
      renderClient(<Helmet noscript={[{ property: 'won\'t work' }]} />);

      const existingTags = document.head.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('does not render tag when primary attribute is null', () => {
      renderClient(
        <Helmet
          noscript={[
            {
              innerHTML: undefined,
            },
          ]}
        />,
      );

      const tagNodes = document.head.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });
  });

  describe('Declarative API', () => {
    it('updates noscript tags', () => {
      renderClient(
        <Helmet>
          <noscript id="bar">{'<link rel="stylesheet" type="text/css" href="foo.css" />'}</noscript>
        </Helmet>,
      );

      const existingTags = [...document.head.getElementsByTagName('noscript')];
      const [firstTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);
      expect(firstTag?.id).toBe('bar');
      expect(firstTag?.outerHTML).toMatchSnapshot();
    });

    it('clears all noscripts tags if none are specified', () => {
      renderClient(
        <Helmet>
          <noscript id="bar" />
        </Helmet>,
      );

      renderClient(<Helmet />);

      const existingTags = document.head.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('tags without \'innerHTML\' are not accepted', () => {
      /* eslint-disable react/no-unknown-property */
      renderClient(
        <Helmet>
          <noscript property="won't work" />
        </Helmet>,
      );
      /* eslint-enable react/no-unknown-property */

      const existingTags = document.head.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(0);
    });

    it('does not render tag when primary attribute is null', () => {
      renderClient(
        <Helmet>
          <noscript>{undefined}</noscript>
        </Helmet>,
      );

      const tagNodes = document.head.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);
      const existingTags = [].slice.call(tagNodes);

      expect(existingTags).toHaveLength(0);
    });
  });
});
