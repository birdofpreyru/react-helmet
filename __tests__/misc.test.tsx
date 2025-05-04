/** @jest-environment jsdom */

import { type OnChangeClientState, Helmet } from '../src';
import { HELMET_ATTRIBUTE } from '../src/constants';

import { renderClient } from '../jest/browser-utils';

describe('misc', () => {
  describe('API', () => {
    it('encodes special characters', () => {
      renderClient(
        <Helmet
          meta={[
            {
              content: 'This is "quoted" text and & and \'.',
              name: 'description',
            },
          ]}
        />,
      );

      const existingTags = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
      const [existingTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(existingTag).toBeInstanceOf(Element);
      expect(existingTag!.getAttribute).toBeDefined();
      expect(existingTag).toHaveAttribute('name', 'description');
      expect(existingTag).toHaveAttribute('content', 'This is "quoted" text and & and \'.');
      expect(existingTag?.outerHTML).toMatchSnapshot();
    });

    it('does not change the DOM if it recevies identical props', () => {
      const onChange = jest.fn();

      renderClient(
        <Helmet
          meta={[{ content: 'Test description', name: 'description' }]}
          onChangeClientState={onChange}
          title="Test Title"
        />,
      );

      // Re-rendering will pass new props to an already mounted Helmet
      renderClient(
        <Helmet
          meta={[{ content: 'Test description', name: 'description' }]}
          onChangeClientState={onChange}
          title="Test Title"
        />,
      );

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not write the DOM if the client and server are identical', () => {
      document.head.innerHTML = `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript" />`;

      const onChange = jest.fn<unknown, Parameters<OnChangeClientState>>();
      renderClient(
        <Helmet
          onChangeClientState={onChange}
          script={[
            {
              src: 'http://localhost/test.js',
              type: 'text/javascript',
            },
          ]}
        />,
      );

      // TODO: Adjust to the rule later.
      // eslint-disable-next-line jest/prefer-called-with
      expect(onChange).toHaveBeenCalled();

      const [, addedTags, removedTags] = onChange.mock.calls[0]!;

      expect(addedTags).toStrictEqual({});
      expect(removedTags).toStrictEqual({});
    });

    // eslint-disable-next-line complexity
    it('only adds new tags and preserves tags when rendering additional Helmet instances', () => {
      const onChange = jest.fn<unknown, Parameters<OnChangeClientState>>();
      let addedTags;
      let removedTags;
      renderClient(
        <Helmet
          link={[
            {
              href: 'http://localhost/style.css',
              rel: 'stylesheet',
              type: 'text/css',
            },
          ]}
          meta={[{ content: 'Test description', name: 'description' }]}
          onChangeClientState={onChange}
        />,
      );

      // TODO: Adjust to the rule later.
      // eslint-disable-next-line jest/prefer-called-with
      expect(onChange).toHaveBeenCalled();

      [, addedTags, removedTags] = onChange.mock.calls[0]!;

      expect(addedTags).toHaveProperty('metaTags');
      expect(addedTags.metaTags?.[0]).toBeDefined();
      expect(addedTags.metaTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(addedTags).toHaveProperty('linkTags');
      expect(addedTags.linkTags?.[0]).toBeDefined();
      expect(addedTags.linkTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(removedTags).toStrictEqual({});

      // Re-rendering will pass new props to an already mounted Helmet
      renderClient(
        <Helmet
          link={[
            {
              href: 'http://localhost/style.css',
              rel: 'stylesheet',
              type: 'text/css',
            },
            {
              href: 'http://localhost/style2.css',
              rel: 'stylesheet',
              type: 'text/css',
            },
          ]}
          meta={[{ content: 'New description', name: 'description' }]}
          onChangeClientState={onChange}
        />,
      );

      expect(onChange).toHaveBeenCalledTimes(2);

      addedTags = onChange.mock.calls[1]?.[1];
      removedTags = onChange.mock.calls[1]?.[2];

      expect(addedTags).toHaveProperty('metaTags');
      expect(addedTags?.metaTags?.[0]).toBeDefined();
      expect(addedTags?.metaTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(addedTags).toHaveProperty('linkTags');
      expect(addedTags?.linkTags?.[0]).toBeDefined();
      expect(addedTags?.linkTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(removedTags).toHaveProperty('metaTags');
      expect(removedTags?.metaTags?.[0]).toBeDefined();
      expect(removedTags?.metaTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(removedTags).not.toHaveProperty('linkTags');
    });

    it('does not accept nested Helmets', () => {
      const consoleError = global.console.error;
      // TODO: Adjust to the rule later.
      // eslint-disable-next-line jest/prefer-spy-on
      global.console.error = jest.fn();

      const renderInvalid = () => {
        renderClient(
          <Helmet title="Test Title">
            <Helmet title={'Title you\'ll never see'} />
          </Helmet>,
        );
      };

      expect(renderInvalid).toThrow(
        'You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.',
      );

      global.console.error = consoleError;
    });

    it('recognizes valid tags regardless of attribute ordering', () => {
      renderClient(<Helmet meta={[{ content: 'Test Description', name: 'description' }]} />);

      const existingTags = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
      const [existingTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);

      expect(existingTag).toBeInstanceOf(Element);
      expect(existingTag!.getAttribute).toBeDefined();
      expect(existingTag).toHaveAttribute('name', 'description');
      expect(existingTag).toHaveAttribute('content', 'Test Description');
      expect(existingTag?.outerHTML).toMatchSnapshot();
    });

    it('requestAnimationFrame works as expected', async () => new Promise((resolve) => {
      requestAnimationFrame((cb) => {
        expect(cb).toBeDefined();
        expect(typeof cb).toBe('number');

        resolve(true);
      });
    }));
  });

  describe('Declarative API', () => {
    it('encodes special characters', () => {
      renderClient(
        <Helmet>
          <meta content={'This is "quoted" text and & and \'.'} name="description" />
        </Helmet>,
      );

      const existingTags = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
      const [existingTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);
      expect(existingTag).toBeInstanceOf(Element);
      expect(existingTag!.getAttribute).toBeDefined();
      expect(existingTag).toHaveAttribute('name', 'description');
      expect(existingTag).toHaveAttribute('content', 'This is "quoted" text and & and \'.');
      expect(existingTag?.outerHTML).toMatchSnapshot();
    });

    it('does not change the DOM if it recevies identical props', () => {
      const onChange = jest.fn();
      renderClient(
        <Helmet onChangeClientState={onChange}>
          <meta content="Test description" name="description" />
          <title>Test Title</title>
        </Helmet>,
      );

      // Re-rendering will pass new props to an already mounted Helmet
      renderClient(
        <Helmet onChangeClientState={onChange}>
          <meta content="Test description" name="description" />
          <title>Test Title</title>
        </Helmet>,
      );

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not write the DOM if the client and server are identical', () => {
      document.head.innerHTML = `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript" />`;

      const onChange = jest.fn<unknown, Parameters<OnChangeClientState>>();
      renderClient(
        <Helmet onChangeClientState={onChange}>
          <script src="http://localhost/test.js" type="text/javascript" />
        </Helmet>,
      );

      // TODO: Adjust to the rule later.
      // eslint-disable-next-line jest/prefer-called-with
      expect(onChange).toHaveBeenCalled();

      const [, addedTags, removedTags] = onChange.mock.calls[0]!;

      expect(addedTags).toStrictEqual({});
      expect(removedTags).toStrictEqual({});
    });

    it('only adds new tags and preserves tags when rendering additional Helmet instances', () => {
      const onChange = jest.fn<unknown, Parameters<OnChangeClientState>>();
      let addedTags;
      let removedTags;

      renderClient(
        <Helmet onChangeClientState={onChange}>
          <link href="http://localhost/style.css" rel="stylesheet" type="text/css" />
          <meta content="Test description" name="description" />
        </Helmet>,
      );

      // TODO: Adjust to the rule later.
      // eslint-disable-next-line jest/prefer-called-with
      expect(onChange).toHaveBeenCalled();

      [, addedTags, removedTags] = onChange.mock.calls[0]!;

      expect(addedTags).toHaveProperty('metaTags');
      expect(addedTags.metaTags?.[0]).toBeDefined();
      expect(addedTags.metaTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(addedTags).toHaveProperty('linkTags');
      expect(addedTags.linkTags?.[0]).toBeDefined();
      expect(addedTags.linkTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(removedTags).toStrictEqual({});

      // Re-rendering will pass new props to an already mounted Helmet
      renderClient(
        <Helmet onChangeClientState={onChange}>
          <link href="http://localhost/style.css" rel="stylesheet" type="text/css" />
          <link href="http://localhost/style2.css" rel="stylesheet" type="text/css" />
          <meta content="New description" name="description" />
        </Helmet>,
      );

      expect(onChange).toHaveBeenCalledTimes(2);

      [, addedTags, removedTags] = onChange.mock.calls[1]!;

      expect(addedTags).toHaveProperty('metaTags');
      expect(addedTags.metaTags?.[0]).toBeDefined();
      expect(addedTags.metaTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(addedTags).toHaveProperty('linkTags');
      expect(addedTags.linkTags?.[0]).toBeDefined();
      expect(addedTags.linkTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(removedTags).toHaveProperty('metaTags');
      expect(removedTags.metaTags?.[0]).toBeDefined();
      expect(removedTags.metaTags?.[0]?.outerHTML).toMatchSnapshot();
      expect(removedTags).not.toHaveProperty('linkTags');
    });

    it('does not accept nested Helmets', () => {
      const consoleError = global.console.error;
      // TODO: Revise.
      // eslint-disable-next-line jest/prefer-spy-on
      global.console.error = jest.fn();

      const renderInvalid = () => {
        renderClient(
          <Helmet>
            <title>Test Title</title>
            <Helmet>
              <title>Title you will never see</title>
            </Helmet>
          </Helmet>,
        );
      };

      expect(renderInvalid).toThrow(
        'You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.',
      );

      global.console.error = consoleError;
    });

    it('throws on invalid elements', () => {
      const consoleError = global.console.error;
      // TODO: Revise.
      // eslint-disable-next-line jest/prefer-spy-on
      global.console.error = jest.fn();

      const renderInvalid = () => {
        renderClient(
          <Helmet>
            <title>Test Title</title>
            <div>
              <title>Title you will never see</title>
            </div>
          </Helmet>,
        );
      };

      expect(renderInvalid).toThrow(
        'Only elements types base, body, head, html, link, meta, noscript, script, style, title, Symbol(react.fragment) are allowed. Helmet does not support rendering <div> elements. Refer to our API for more information.',
      );

      global.console.error = consoleError;
    });

    it('throws on invalid self-closing elements', () => {
      const consoleError = global.console.error;
      // TODO: Revise.
      // eslint-disable-next-line jest/prefer-spy-on
      global.console.error = jest.fn();

      const renderInvalid = () => {
        /* eslint-disable react/no-unknown-property */
        renderClient(
          <Helmet>
            <title>Test Title</title>
            <div
              // @ts-expect-error "pre-existing"
              customAttribute
            />
          </Helmet>,
        );
        /* eslint-enable react/no-unknown-property */
      };

      expect(renderInvalid).toThrow(
        'Only elements types base, body, head, html, link, meta, noscript, script, style, title, Symbol(react.fragment) are allowed. Helmet does not support rendering <div> elements. Refer to our API for more information.',
      );

      global.console.error = consoleError;
    });

    it('throws on invalid strings as children', () => {
      const consoleError = global.console.error;
      // TODO: Revise.
      // eslint-disable-next-line jest/prefer-spy-on
      global.console.error = jest.fn();

      const renderInvalid = () => {
        renderClient(
          <Helmet>
            <title>Test Title</title>
            { // TODO: Revise!.
            /* eslint-disable-next-line react/void-dom-elements-no-children */}
            <link href="http://localhost/helmet" rel="canonical">
              test
            </link>
          </Helmet>,
        );
      };

      expect(renderInvalid).toThrow(
        '<link /> elements are self-closing and can not contain children. Refer to our API for more information.',
      );

      global.console.error = consoleError;
    });

    it('throws on invalid children', () => {
      const consoleError = global.console.error;
      // TODO: Revise.
      // eslint-disable-next-line jest/prefer-spy-on
      global.console.error = jest.fn();

      const renderInvalid = () => {
        renderClient(
          <Helmet>
            <title>Test Title</title>
            <script>
              <title>Title you will never see</title>
            </script>
          </Helmet>,
        );
      };

      expect(renderInvalid).toThrow(
        'Helmet expects a string as a child of <script>. Did you forget to wrap your children in braces? ( <script>{``}</script> ) Refer to our API for more information.',
      );

      global.console.error = consoleError;
    });

    it('handles undefined children', () => {
      const charSet = undefined;

      renderClient(
        <Helmet>
          {
            // TODO: Revise the second rule hit.
            // eslint-disable-next-line jest/no-conditional-in-test, @typescript-eslint/no-unnecessary-condition
            charSet ? <meta charSet={charSet} /> : null
          }
          <title>Test Title</title>
        </Helmet>,
      );

      expect(document.title).toBe('Test Title');
    });

    it('recognizes valid tags regardless of attribute ordering', () => {
      renderClient(
        <Helmet>
          <meta content="Test Description" name="description" />
        </Helmet>,
      );

      const existingTags = document.head.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
      const [existingTag] = existingTags;

      expect(existingTags).toBeDefined();
      expect(existingTags).toHaveLength(1);
      expect(existingTag).toBeInstanceOf(Element);
      expect(existingTag!.getAttribute).toBeDefined();
      expect(existingTag).toHaveAttribute('name', 'description');
      expect(existingTag).toHaveAttribute('content', 'Test Description');
      expect(existingTag?.outerHTML).toMatchSnapshot();
    });

    it('requestAnimationFrame works as expected', async () => new Promise((resolve) => {
      requestAnimationFrame((cb) => {
        expect(cb).toBeDefined();
        expect(typeof cb).toBe('number');
        resolve(true);
      });
    }));
  });
});
