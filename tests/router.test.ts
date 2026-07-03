import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';

// Define mocks before importing `@vectojs/core` and `@vectojs/ui`
const mockCanvas = {
  width: 800,
  height: 600,
  clientWidth: 800,
  clientHeight: 600,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })),
  parentElement: {
    appendChild: vi.fn(),
  },
  getContext: vi.fn(() => null),
};

const mockDiv = {
  style: {},
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  insertBefore: vi.fn(),
  remove: vi.fn(),
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
  addEventListener: vi.fn(),
};

globalThis.window = {
  innerWidth: 800,
  innerHeight: 600,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  location: {
    pathname: '/',
  },
  history: {
    pushState: vi.fn((state, title, url) => {
      globalThis.window.location.pathname = url;
    }),
  },
} as any;

globalThis.history = globalThis.window.history;

globalThis.document = {
  createElement: vi.fn((tag) => {
    if (tag === 'canvas') return mockCanvas;
    return mockDiv;
  }),
} as any;

// Import the components under test
import { Scene } from '@vectojs/core';
import { Router } from '../src/router';
import { ShowcaseView } from '../src/views/ShowcaseView';
import { PlaygroundView } from '../src/views/PlaygroundView';

describe('Router', () => {
  let scene: Scene;
  let router: Router;

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.window.location.pathname = '/';

    scene = new Scene(mockCanvas as any);
    router = new Router(scene);
  });

  afterEach(() => {
    router.destroy();
    scene.destroy();
  });

  test('should mount ShowcaseView by default on "/"', () => {
    const root = scene.getRoot();
    expect(root.children.some((child) => child instanceof ShowcaseView)).toBe(true);
    expect(root.children.some((child) => child instanceof PlaygroundView)).toBe(false);
  });

  test('should switch to PlaygroundView on "/playground"', () => {
    router.navigate('/playground');
    const root = scene.getRoot();
    expect(root.children.some((child) => child instanceof ShowcaseView)).toBe(false);
    expect(root.children.some((child) => child instanceof PlaygroundView)).toBe(true);
  });

  test('should switch back to ShowcaseView on navigating away from "/playground"', () => {
    router.navigate('/playground');
    router.navigate('/');
    const root = scene.getRoot();
    expect(root.children.some((child) => child instanceof ShowcaseView)).toBe(true);
    expect(root.children.some((child) => child instanceof PlaygroundView)).toBe(false);
  });

  test('should handle popstate event', () => {
    // Navigate to playground first
    router.navigate('/playground');

    // Simulate browser back navigation (popstate)
    globalThis.window.location.pathname = '/';

    // Retrieve the popstate event listener added by Router
    const addEventListenerMock = globalThis.window.addEventListener as any;
    const popstateCall = addEventListenerMock.mock.calls.find(
      (call: any) => call[0] === 'popstate',
    );
    expect(popstateCall).toBeDefined();

    const listener = popstateCall[1];
    listener(); // Invoke listener

    const root = scene.getRoot();
    expect(root.children.some((child) => child instanceof ShowcaseView)).toBe(true);
    expect(root.children.some((child) => child instanceof PlaygroundView)).toBe(false);
  });
});
