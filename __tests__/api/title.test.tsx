/** @jest-environment jsdom */

import { Helmet } from '../../src';
import { renderClient } from '../../config/jest/utils';

describe('title', () => {
  describe('API', () => {
    it('updates page title', () => {
      renderClient(<Helmet defaultTitle="Fallback" title="Test Title" />);

      expect(document.title).toMatchSnapshot();
    });

    it('updates page title with multiple children', () => {
      renderClient(
        <div>
          <Helmet title="Test Title" />
          <Helmet title="Child One Title" />
          <Helmet title="Child Two Title" />
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('sets title based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet title="Main Title" />
          <Helmet title="Nested Title" />
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('sets title using deepest nested component with a defined title', () => {
      renderClient(
        <div>
          <Helmet title="Main Title" />
          <Helmet />
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('uses defaultTitle if no title is defined', () => {
      renderClient(
        <Helmet
          defaultTitle="Fallback"
          title=""
          titleTemplate="This is a %s of the titleTemplate feature"
        />,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('uses a titleTemplate if defined', () => {
      renderClient(
        <Helmet
          defaultTitle="Fallback"
          title="Test"
          titleTemplate="This is a %s of the titleTemplate feature"
        />,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('replaces multiple title strings in titleTemplate', () => {
      renderClient(
        <Helmet
          title="Test"
          titleTemplate="This is a %s of the titleTemplate feature. Another %s."
        />,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('uses a titleTemplate based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet title="Test" titleTemplate="This is a %s of the titleTemplate feature" />
          <Helmet title="Second Test" titleTemplate="A %s using nested titleTemplate attributes" />
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('merges deepest component title with nearest upstream titleTemplate', () => {
      renderClient(
        <div>
          <Helmet title="Test" titleTemplate="This is a %s of the titleTemplate feature" />
          <Helmet title="Second Test" />
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('renders dollar characters in a title correctly when titleTemplate present', () => {
      const dollarTitle = 'te$t te$$t te$$$t te$$$$t';

      renderClient(<Helmet title={dollarTitle} titleTemplate="This is a %s" />);

      expect(document.title).toMatchSnapshot();
    });

    it('does not encode all characters with HTML character entity equivalents', () => {
      const chineseTitle = '膣膗 鍆錌雔';

      renderClient(
        <div>
          <Helmet title={chineseTitle} />
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('page title with prop itemprop', () => {
      renderClient(
        <Helmet
          defaultTitle="Fallback"
          title="Test Title with itemProp"
          titleAttributes={{ itemprop: 'name' }}
        />,
      );

      const titleTag = document.getElementsByTagName('title')[0];

      expect(document.title).toMatchSnapshot();
      expect(titleTag).toHaveAttribute('itemprop', 'name');
    });
  });

  describe('Declarative API', () => {
    it('updates page title', () => {
      renderClient(
        <Helmet defaultTitle="Fallback">
          <title>Test Title</title>
        </Helmet>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('updates page title and allows children containing expressions', () => {
      const someValue = 'Some Great Title';

      renderClient(
        <Helmet>
          <title>Title: {someValue}</title>
        </Helmet>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('updates page title with multiple children', () => {
      renderClient(
        <div>
          <Helmet>
            <title>Test Title</title>
          </Helmet>
          <Helmet>
            <title>Child One Title</title>
          </Helmet>
          <Helmet>
            <title>Child Two Title</title>
          </Helmet>
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('sets title based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet>
            <title>Main Title</title>
          </Helmet>
          <Helmet>
            <title>Nested Title</title>
          </Helmet>
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('sets title using deepest nested component with a defined title', () => {
      renderClient(
        <div>
          <Helmet>
            <title>Main Title</title>
          </Helmet>
          <Helmet />
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('uses defaultTitle if no title is defined', () => {
      renderClient(
        <Helmet defaultTitle="Fallback" titleTemplate="This is a %s of the titleTemplate feature">
          <title />
        </Helmet>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('uses a titleTemplate if defined', () => {
      renderClient(
        <Helmet defaultTitle="Fallback" titleTemplate="This is a %s of the titleTemplate feature">
          <title>Test</title>
        </Helmet>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('replaces multiple title strings in titleTemplate', () => {
      renderClient(
        <Helmet titleTemplate="This is a %s of the titleTemplate feature. Another %s.">
          <title>Test</title>
        </Helmet>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('uses a titleTemplate based on deepest nested component', () => {
      renderClient(
        <div>
          <Helmet titleTemplate="This is a %s of the titleTemplate feature">
            <title>Test</title>
          </Helmet>
          <Helmet titleTemplate="A %s using nested titleTemplate attributes">
            <title>Second Test</title>
          </Helmet>
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('merges deepest component title with nearest upstream titleTemplate', () => {
      renderClient(
        <div>
          <Helmet titleTemplate="This is a %s of the titleTemplate feature">
            <title>Test</title>
          </Helmet>
          <Helmet>
            <title>Second Test</title>
          </Helmet>
        </div>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('renders dollar characters in a title correctly when titleTemplate present', () => {
      const dollarTitle = 'te$t te$$t te$$$t te$$$$t';

      renderClient(
        <Helmet titleTemplate="This is a %s">
          <title>{dollarTitle}</title>
        </Helmet>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('does not encode all characters with HTML character entity equivalents', () => {
      const chineseTitle = '膣膗 鍆錌雔';

      renderClient(
        <Helmet>
          <title>{chineseTitle}</title>
        </Helmet>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it('page title with prop itemProp', () => {
      renderClient(
        <Helmet defaultTitle="Fallback">
          <title itemProp="name">Test Title with itemProp</title>
        </Helmet>,
      );

      const titleTag = document.getElementsByTagName('title')[0];

      expect(document.title).toMatchSnapshot();
      expect(titleTag).toHaveAttribute('itemprop', 'name');
    });

    it('retains existing title tag when no title tag is defined', () => {
      document.head.innerHTML = '<title>Existing Title</title>';

      renderClient(
        <Helmet>
          <meta name="keywords" content="stuff" />
        </Helmet>,
      );

      expect(document.title).toMatchSnapshot();
    });

    it.skip('clears title tag if empty title is defined', () => {
      renderClient(
        <Helmet>
          <title>Existing Title</title>
          <meta name="keywords" content="stuff" />
        </Helmet>,
      );

      expect(document.title).toMatchSnapshot();

      renderClient(
        <Helmet>
          <title />
          <meta name="keywords" content="stuff" />
        </Helmet>,
      );

      expect(document.title).toBe('');
    });
  });
});
