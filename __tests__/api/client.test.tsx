/** @jest-environment jsdom */

import { type OnChangeClientState, Helmet } from '../../src';

import { renderClient } from '../../jest/browser-utils';

describe('onChangeClientState', () => {
  describe('API', () => {
    // eslint-disable-next-line complexity
    it('when handling client state change, calls the function with new state, addedTags and removedTags', () => {
      const onChange = jest.fn<unknown, Parameters<OnChangeClientState>>();
      renderClient(
        <div>
          <Helmet
            base={{ href: 'http://mysite.com/' }}
            link={[
              {
                href: 'http://localhost/helmet',
                rel: 'canonical',
              },
            ]}
            meta={[
              {
                charSet: 'utf-8',
              },
            ]}
            onChangeClientState={onChange}
            script={[
              {
                src: 'http://localhost/test.js',
                type: 'text/javascript',
              },
            ]}
            title="Main Title"
          />
        </div>,
      );

      // TODO: Revisit.
      // eslint-disable-next-line jest/prefer-called-with
      expect(onChange).toHaveBeenCalled();

      const newState = onChange.mock.calls[0]?.[0];
      const addedTags = onChange.mock.calls[0]?.[1];
      const removedTags = onChange.mock.calls[0]?.[2];

      expect(newState).toStrictEqual(expect.objectContaining({ title: 'Main Title' }));
      expect(newState?.baseTag[0]).toStrictEqual(
        expect.objectContaining({
          href: 'http://mysite.com/',
        }),
      );
      expect(newState?.metaTags[0]).toStrictEqual(expect.objectContaining({ charset: 'utf-8' }));
      expect(newState?.linkTags[0]).toStrictEqual(
        expect.objectContaining({
          href: 'http://localhost/helmet',
          rel: 'canonical',
        }),
      );
      expect(newState?.scriptTags[0]).toStrictEqual(
        expect.objectContaining({
          src: 'http://localhost/test.js',
          type: 'text/javascript',
        }),
      );

      expect(addedTags?.baseTag).toBeDefined();
      expect(addedTags?.baseTag?.[0]).toBeDefined();
      expect(addedTags?.baseTag?.[0]?.outerHTML).toMatchSnapshot();

      expect(addedTags?.metaTags).toBeDefined();
      expect(addedTags?.metaTags?.[0]).toBeDefined();
      expect(addedTags?.metaTags?.[0]?.outerHTML).toMatchSnapshot();

      expect(addedTags?.linkTags).toBeDefined();
      expect(addedTags?.linkTags?.[0]).toBeDefined();
      expect(addedTags?.linkTags?.[0]?.outerHTML).toMatchSnapshot();

      expect(addedTags?.scriptTags).toBeDefined();
      expect(addedTags?.scriptTags?.[0]).toBeDefined();
      expect(addedTags?.scriptTags?.[0]?.outerHTML).toMatchSnapshot();

      expect(removedTags).toStrictEqual({});
    });

    //   it('calls the deepest defined callback with the deepest state', () => {
    //     const onChange = vi.fn();
    //     render(
    //       <div>
    //         <Helmet title="Main Title" onChangeClientState={onChange} />
    //         <Helmet title="Deeper Title" />
    //       </div>
    //     );
    //
    //     expect(onChange).toBeCalled();
    //     expect(onChange.mock.calls).toHaveLength(1);
    //     expect(onChange.mock.calls[0][0]).toEqual(
    //       expect.objectContaining({
    //         title: 'Deeper Title',
    //       })
    //     );
    //   });
  });

  describe('Declarative API', () => {
    // eslint-disable-next-line complexity
    it('when handling client state change, calls the function with new state, addedTags and removedTags', () => {
      const onChange = jest.fn<unknown, Parameters<OnChangeClientState>>();
      renderClient(
        <div>
          <Helmet onChangeClientState={onChange}>
            <base href="http://mysite.com/" />
            <link href="http://localhost/helmet" rel="canonical" />
            <meta charSet="utf-8" />
            <script src="http://localhost/test.js" type="text/javascript" />
            <title>Main Title</title>
          </Helmet>
        </div>,
      );

      // TODO: Revisit.
      // eslint-disable-next-line jest/prefer-called-with
      expect(onChange).toHaveBeenCalled();

      const newState = onChange.mock.calls[0]?.[0];
      const addedTags = onChange.mock.calls[0]?.[1];
      const removedTags = onChange.mock.calls[0]?.[2];

      expect(newState).toStrictEqual(expect.objectContaining({ title: 'Main Title' }));
      expect(newState?.baseTag[0]).toStrictEqual(
        expect.objectContaining({
          href: 'http://mysite.com/',
        }),
      );
      expect(newState?.metaTags[0]).toStrictEqual(expect.objectContaining({ charset: 'utf-8' }));
      expect(newState?.linkTags[0]).toStrictEqual(
        expect.objectContaining({
          href: 'http://localhost/helmet',
          rel: 'canonical',
        }),
      );
      expect(newState?.scriptTags[0]).toStrictEqual(
        expect.objectContaining({
          src: 'http://localhost/test.js',
          type: 'text/javascript',
        }),
      );

      expect(addedTags?.baseTag).toBeDefined();
      expect(addedTags?.baseTag?.[0]).toBeDefined();
      expect(addedTags?.baseTag?.[0]?.outerHTML).toMatchSnapshot();

      expect(addedTags?.metaTags).toBeDefined();
      expect(addedTags?.metaTags?.[0]).toBeDefined();
      expect(addedTags?.metaTags?.[0]?.outerHTML).toMatchSnapshot();

      expect(addedTags?.linkTags).toBeDefined();
      expect(addedTags?.linkTags?.[0]).toBeDefined();
      expect(addedTags?.linkTags?.[0]?.outerHTML).toMatchSnapshot();

      expect(addedTags?.scriptTags).toBeDefined();
      expect(addedTags?.scriptTags?.[0]).toBeDefined();
      expect(addedTags?.scriptTags?.[0]?.outerHTML).toMatchSnapshot();

      expect(removedTags).toStrictEqual({});
    });
  });

  // it('calls the deepest defined callback with the deepest state', () => {
  //   const onChange = vi.fn();
  //   render(
  //     <div>
  //       <Helmet onChangeClientState={onChange}>
  //         <title>Main Title</title>
  //       </Helmet>
  //       <Helmet>
  //         <title>Deeper Title</title>
  //       </Helmet>
  //     </div>
  //   );
  //
  //   expect(onChange).toBeCalled();
  //   expect(onChange.mock.calls).toHaveLength(1);
  //   expect(onChange.mock.calls[0][0]).toEqual(
  //     expect.objectContaining({
  //       title: 'Deeper Title',
  //     })
  //   );
  // });
});
