import { renderContextServer } from '../../jest/server-utils';

import { MetaTags } from '../../src';

test('base scenario', () => {
  const head = renderContextServer(
    <MetaTags
      description="Test description"
      title="Test Title"
    />,
  );
  expect(head?.title.toString()).toMatchSnapshot();
  expect(head?.meta.toString()).toMatchSnapshot();
});

test('with all props', () => {
  const head = renderContextServer(
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
    </MetaTags>,
  );
  expect(head?.title.toString()).toMatchSnapshot();
  expect(head?.meta.toString()).toMatchSnapshot();
});
