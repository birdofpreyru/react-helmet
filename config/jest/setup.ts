// Polyfills requestAnimationFrame() in the test environment.
// eslint-disable-next-line import/no-unassigned-import
import 'raf/polyfill';

import { afterEach, beforeEach } from '@jest/globals';

// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom';

import { unmount } from '../../jest/browser-utils';

// @ts-expect-error "that's fine"
global.IS_REACT_ACT_ENVIRONMENT = true;

let headElement: HTMLHeadElement | undefined;

beforeEach(() => {
  if (typeof document !== 'undefined') {
    // TODO: Double-check, if we can actually rely on the normal `document`
    // interface here.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    headElement ??= document.head ?? document.querySelector('head');

    headElement.innerHTML = '';
    document.body.innerHTML = '<div id="mount"></div>';
  }
});

afterEach(() => {
  if (typeof document !== 'undefined') {
    unmount();
  }
});
