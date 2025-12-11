/** @jest-environment jsdom */

import { renderClient } from '../../jest/browser-utils';

import { Helmet, MetaTags } from '../../src';
import { HELMET_ATTRIBUTE } from '../../src/constants';

test('with "prioritizeSeoTags"', () => {
  renderClient(
    <>
      <Helmet prioritizeSeoTags />
      <MetaTags
        description="Test description"
        extraMetaTags={[{
          content: 'extra meta tag content',
          name: 'extra meta tag',
        }]}
        image="https://some.url.com/image.png"
        siteName="Test web site"
        socialDescription="Social description"
        socialTitle="Social title"
        title="Test Title"
        url="https://some.url.com"
      >
        Abc
      </MetaTags>
    </>,
  );

  const tags = [...document.head.querySelectorAll(`[${HELMET_ATTRIBUTE}]`)];
  expect(tags).toMatchSnapshot();
});
