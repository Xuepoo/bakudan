import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';

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

const mockIframe = {
  src: '',
  style: {},
  contentWindow: {
    postMessage: vi.fn(),
  },
  remove: vi.fn(),
};

let messageListener: any = null;
let keydownListener: any = null;

globalThis.window = {
  innerWidth: 800,
  innerHeight: 600,
  addEventListener: vi.fn((event, cb) => {
    if (event === 'message') messageListener = cb;
    if (event === 'keydown') keydownListener = cb;
  }),
  removeEventListener: vi.fn((event, cb) => {
    if (event === 'message' && messageListener === cb) messageListener = null;
    if (event === 'keydown' && keydownListener === cb) keydownListener = null;
  }),
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
    if (tag === 'iframe') return mockIframe;
    return mockDiv;
  }),
  body: {
    appendChild: vi.fn(),
  },
} as any;

import { PlaygroundView } from '../src/views/PlaygroundView';

describe('PlaygroundView Sandbox & Vim Mode Toggle Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    messageListener = null;
    keydownListener = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should initialize editor in INSERT mode and construct elements', () => {
    const view = new PlaygroundView();
    expect(view).toBeDefined();

    const viewAny = view as any;
    expect(viewAny.editorState.getMode()).toBe('INSERT');
    expect(viewAny.vimModeEnabled).toBe(false);
    expect(viewAny.vimToggle).toBeDefined();
    expect(viewAny.terminalText).toBeDefined();
  });

  test('should block Escape key in default mode (Vim Toggle OFF)', () => {
    const view = new PlaygroundView();
    const viewAny = view as any;

    // Mock parent and scene, then mount sandbox
    viewAny.parent = {
      scene: {
        canvas: { width: 800, height: 600 },
        markDirty: vi.fn(),
      }
    };
    view.mountSandbox();

    expect(viewAny.editorState.getMode()).toBe('INSERT');

    // Simulate Escape key press
    const escapeEvent = {
      key: 'Escape',
      preventDefault: vi.fn(),
    } as any;

    viewAny.editorEntity.emit('keydown', {
      nativeEvent: escapeEvent,
    });

    expect(escapeEvent.preventDefault).toHaveBeenCalled();
    expect(viewAny.editorState.getMode()).toBe('INSERT'); // Should stay in INSERT
  });

  test('should allow Escape and normal Vim navigation when Vim Toggle is ON', () => {
    const view = new PlaygroundView();
    const viewAny = view as any;

    // Mock parent and scene, then mount sandbox
    viewAny.parent = {
      scene: {
        canvas: { width: 800, height: 600 },
        markDirty: vi.fn(),
      }
    };
    view.mountSandbox();

    // Turn Vim Mode ON
    viewAny.vimToggle.emit('change', { checked: true });
    expect(viewAny.vimModeEnabled).toBe(true);
    expect(viewAny.editorState.getMode()).toBe('NORMAL');

    // Feed 'i' to enter INSERT mode
    const iEvent = {
      key: 'i',
      preventDefault: vi.fn(),
    } as any;
    viewAny.editorEntity.emit('keydown', {
      nativeEvent: iEvent,
    });
    expect(viewAny.editorState.getMode()).toBe('INSERT');

    // Now Escape should switch back to NORMAL mode because Vim Mode is ON
    const escapeEvent = {
      key: 'Escape',
      preventDefault: vi.fn(),
    } as any;
    viewAny.editorEntity.emit('keydown', {
      nativeEvent: escapeEvent,
    });

    expect(viewAny.editorState.getMode()).toBe('NORMAL');
  });

  test('should manage state queueing and handshake protocol', () => {
    const view = new PlaygroundView();
    const viewAny = view as any;

    expect(viewAny.isSandboxReady).toBe(false);
    expect(viewAny.queue.length).toBe(0); // Queuing only starts after mounting

    // Mock parent and scene, then mount sandbox
    viewAny.parent = {
      scene: {
        canvas: { width: 800, height: 600 },
        markDirty: vi.fn(),
      }
    };
    view.mountSandbox();

    // Initial runCode is called in mountSandbox, should be queued
    expect(viewAny.queue.length).toBe(1);

    // Simulate SANDBOX_READY message event
    expect(messageListener).toBeDefined();
    messageListener({
      data: {
        type: 'SANDBOX_READY',
      },
    });

    expect(viewAny.isSandboxReady).toBe(true);
    expect(viewAny.queue.length).toBe(0); // Queue should be flushed
    expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'RUN_CODE' }),
      '*',
    );
  });

  test('should render terminal error on RUNTIME_ERROR', () => {
    const view = new PlaygroundView();
    const viewAny = view as any;

    // Mock parent and scene, then mount sandbox
    viewAny.parent = {
      scene: {
        canvas: { width: 800, height: 600 },
        markDirty: vi.fn(),
      }
    };
    view.mountSandbox();

    // Simulate RUNTIME_ERROR message event
    messageListener({
      data: {
        type: 'RUNTIME_ERROR',
        error: 'ReferenceError: x is not defined\n    at eval',
      },
    });

    expect(viewAny.terminalText.text).toBe('ReferenceError: x is not defined\n    at eval');
    expect(viewAny.terminalText.color).toBe('#ef4444');
  });
});
