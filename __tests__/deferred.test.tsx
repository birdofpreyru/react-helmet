import { Helmet } from '../src';

import { renderClient } from '../jest/server-utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    // pre-existing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __spy__: jest.Mock<any>;
  }
}

describe.skip('deferred tags', () => {
  beforeEach(() => {
    Object.defineProperty(window, '__spy__', {
      configurable: true,
      value: jest.fn(),
    });
  });

  afterEach(() => {
    // @ts-expect-error "pre-existing"
    delete window.__spy__;
  });

  describe('API', () => {
    it('executes synchronously when defer={true} and async otherwise', async () => {
      renderClient(
        <div>
          <Helmet
            defer={false}
            script={[
              {
                innerHTML: 'window.__spy__(1)',
              },
            ]}
          />
          <Helmet
            script={[
              {
                innerHTML: 'window.__spy__(2)',
              },
            ]}
          />
        </div>,
      );

      expect(window.__spy__).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(window.__spy__).toHaveBeenCalledTimes(2);
          expect(window.__spy__.mock.calls).toStrictEqual([[1], [2]]);

          resolve(true);
        });
      });
    });
  });

  describe('Declarative API', () => {
    it('executes synchronously when defer={true} and async otherwise', async () => {
      renderClient(
        <div>
          <Helmet defer={false}>
            <script>window.__spy__(1)</script>
          </Helmet>
          <Helmet>
            <script>window.__spy__(2)</script>
          </Helmet>
        </div>,
      );

      expect(window.__spy__).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(window.__spy__).toHaveBeenCalledTimes(2);
          expect(window.__spy__.mock.calls).toStrictEqual([[1], [2]]);

          resolve(true);
        });
      });
    });
  });
});
