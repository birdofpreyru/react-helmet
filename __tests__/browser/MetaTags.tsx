/** @jest-environment jsdom */

import { HELMET_ATTRIBUTE } from '../../build/constants.js';
import { Helmet, MetaTags } from '../../build/index.js';
import { renderClient } from '../../jest/browser-utils.tsx';

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
