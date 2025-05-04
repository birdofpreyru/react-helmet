/** @jest-environment jsdom */

import { Helmet } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';
import { renderClient } from '../../jest/browser-utils';

describe('title attributes', () => {
  beforeEach(() => {
    document.head.innerHTML = '<title>Test Title</title>';
  });

  describe('API', () => {
    it('update title attributes', () => {
      renderClient(
        <Helmet
          titleAttributes={{
            itemProp: 'name',
          }}
        />,
      );

      const [titleTag] = document.getElementsByTagName('title');

      expect(titleTag).toHaveAttribute('itemprop', 'name');
      expect(titleTag).toHaveAttribute(HELMET_ATTRIBUTE, 'itemprop');
    });

    it('sets attributes based on the deepest nested component', () => {
      renderClient(
        <div>
          <Helmet
            titleAttributes={{
              hidden: undefined,
              lang: 'en',
            }}
          />
          <Helmet
            titleAttributes={{
              lang: 'ja',
            }}
          />
        </div>,
      );

      const [titleTag] = document.getElementsByTagName('title');

      expect(titleTag).toHaveAttribute('lang', 'ja');
      expect(titleTag).toHaveAttribute('hidden', '');
      expect(titleTag).toHaveAttribute(HELMET_ATTRIBUTE, 'hidden,lang');
    });

    it('handles valueless attributes', () => {
      renderClient(
        <Helmet
          titleAttributes={{
            hidden: undefined,
          }}
        />,
      );

      const [titleTag] = document.getElementsByTagName('title');

      expect(titleTag).toHaveAttribute('hidden', '');
      expect(titleTag).toHaveAttribute(HELMET_ATTRIBUTE, 'hidden');
    });

    it('clears title attributes that are handled within helmet', () => {
      renderClient(
        <Helmet
          titleAttributes={{
            hidden: undefined,
            lang: 'en',
          }}
        />,
      );

      renderClient(<Helmet />);

      const [titleTag] = document.getElementsByTagName('title');

      expect(titleTag).not.toHaveAttribute('lang');
      expect(titleTag).not.toHaveAttribute('hidden');
      expect(titleTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
    });
  });

  describe('Declarative API', () => {
    it('updates title attributes', () => {
      renderClient(
        <Helmet>
          <title itemProp="name" />
        </Helmet>,
      );

      const [titleTag] = document.getElementsByTagName('title');

      expect(titleTag).toHaveAttribute('itemprop', 'name');
      expect(titleTag).toHaveAttribute(HELMET_ATTRIBUTE, 'itemprop');
    });

    it('sets attributes based on the deepest nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <title hidden lang="en" />
          </Helmet>
          <Helmet>
            <title lang="ja" />
          </Helmet>
        </div>,
      );

      const [titleTag] = document.getElementsByTagName('title');

      expect(titleTag).toHaveAttribute('lang', 'ja');
      expect(titleTag).toHaveAttribute('hidden', 'true');
      expect(titleTag).toHaveAttribute(HELMET_ATTRIBUTE, 'hidden,lang');
    });

    it('handles valueless attributes', () => {
      renderClient(
        <Helmet>
          <title hidden />
        </Helmet>,
      );

      const [titleTag] = document.getElementsByTagName('title');

      expect(titleTag).toHaveAttribute('hidden', 'true');
      expect(titleTag).toHaveAttribute(HELMET_ATTRIBUTE, 'hidden');
    });

    it('clears title attributes that are handled within helmet', () => {
      renderClient(
        <Helmet>
          <title hidden lang="en" />
        </Helmet>,
      );

      renderClient(<Helmet />);

      const [titleTag] = document.getElementsByTagName('title');

      expect(titleTag).not.toHaveAttribute('lang');
      expect(titleTag).not.toHaveAttribute('hidden');
      expect(titleTag).not.toHaveAttribute(HELMET_ATTRIBUTE);
    });
  });
});
