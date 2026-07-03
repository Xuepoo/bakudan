import { expect, test, describe, beforeEach, vi } from 'vitest';

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

import { VemEditorState } from '@vemjs/core';
import { VemEditorEntity } from '@vemjs/renderer-vecto';
import { PlaygroundView } from '../src/views/PlaygroundView';

describe('PlaygroundView & VemEditorEntity Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should initialize PlaygroundView with VemEditorState and VemEditorEntity', () => {
    const view = new PlaygroundView();
    expect(view).toBeDefined();

    const viewAny = view as any;
    expect(viewAny.editorState).toBeInstanceOf(VemEditorState);
    expect(viewAny.editorEntity).toBeInstanceOf(VemEditorEntity);

    // Check initial layout configuration and entity position
    expect(viewAny.editorEntity.x).toBe(400);
    expect(viewAny.editorEntity.y).toBe(40);
    expect(viewAny.editorEntity.width).toBe(400);
    expect(viewAny.editorEntity.height).toBe(400);
  });

  test('should assert editor state buffer sync and modifications', () => {
    const defaultCode = `// Edit your custom barrage here!\nclass CustomBarrage extends Entity {\n  update(dt) {\n    this.x -= 50 * dt;\n  }\n}`;
    const state = new VemEditorState(defaultCode);
    const entity = new VemEditorEntity(state);

    expect(entity).toBeDefined();
    const buffer = state.getBuffer();
    expect(buffer).toBeDefined();
    expect(buffer.getText()).toBe(defaultCode);
    expect(buffer.getLineCount()).toBe(6);

    // Verify buffer modification updates the editor text
    buffer.insertText({ line: 0, character: 0 }, '// Comment\n');
    expect(buffer.getText()).toBe('// Comment\n' + defaultCode);
    expect(buffer.getLineCount()).toBe(7);
  });
});
