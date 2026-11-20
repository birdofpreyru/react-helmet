/** @jest-environment jsdom */

import { Helmet } from '../build/index.js';
import { renderClient } from '../jest/browser-utils.tsx';

describe('fragments', () => {
  it('parses Fragments', () => {
    const title = 'Hello';
    renderClient(
      <Helmet>
        <>
          <title>{title}</title>
          <meta charSet="utf-8" />
        </>
      </Helmet>,
    );

    expect(document.title).toBe(title);
  });

  it('parses nested Fragments', () => {
    const title = 'Baz';
    renderClient(
      <Helmet>
        <>
          <title>Foo</title>
          <>
            <title>Bar</title>
            <title>{title}</title>
          </>
        </>
      </Helmet>,
    );

    expect(document.title).toBe(title);
  });
});
