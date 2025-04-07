// Polyfills requestAnimationFrame() in the test environment.
import 'raf/polyfill';

import { afterEach, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';

import { unmount } from '../../jest/browser-utils';

// @ts-expect-error "that's fine"
global.IS_REACT_ACT_ENVIRONMENT = true;

let headElement: HTMLHeadElement;

beforeEach(() => {
  if (typeof document !== 'undefined') {
    headElement ||= document.head || document.querySelector('head');

    headElement.innerHTML = '';
    document.body.innerHTML = '<div id="mount"></div>';
  }
});

afterEach(() => {
  if (typeof document !== 'undefined') {
    unmount();
  }
});
