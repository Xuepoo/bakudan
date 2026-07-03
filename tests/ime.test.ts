import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';
import { ProxyInput } from '../src/components/ProxyInput';

describe('ProxyInput', () => {
  let mockTextarea: any;
  let eventListeners: { [type: string]: Function[] } = {};

  beforeEach(() => {
    eventListeners = {};
    mockTextarea = {
      style: {} as Record<string, string>,
      value: '',
      focus: vi.fn(),
      setAttribute: vi.fn(),
      addEventListener: vi.fn((type: string, callback: Function) => {
        if (!eventListeners[type]) {
          eventListeners[type] = [];
        }
        eventListeners[type].push(callback);
      }),
      parentNode: {
        removeChild: vi.fn(),
      },
    };

    globalThis.document = {
      createElement: vi.fn((tag: string) => {
        if (tag === 'textarea') {
          return mockTextarea;
        }
        return {};
      }),
      body: {
        appendChild: vi.fn(),
      },
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should create and append textarea with correct styles', () => {
    new ProxyInput();

    expect(globalThis.document.createElement).toHaveBeenCalledWith('textarea');
    expect(globalThis.document.body.appendChild).toHaveBeenCalledWith(mockTextarea);

    expect(mockTextarea.style.position).toBe('absolute');
    expect(mockTextarea.style.opacity).toBe('0');
    expect(mockTextarea.style.pointerEvents).toBe('none');
    expect(mockTextarea.setAttribute).toHaveBeenCalledWith('autocomplete', 'off');
    expect(mockTextarea.setAttribute).toHaveBeenCalledWith('spellcheck', 'false');
  });

  test('should position and focus on focusAt', () => {
    const input = new ProxyInput();
    input.focusAt(120, 240);

    expect(mockTextarea.style.left).toBe('120px');
    expect(mockTextarea.style.top).toBe('240px');
    expect(mockTextarea.focus).toHaveBeenCalled();
  });

  test('should trigger input callback with correct value and reset value', () => {
    const input = new ProxyInput();
    const callback = vi.fn();

    input.onInput(callback);

    expect(mockTextarea.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));

    // Simulate input typing
    mockTextarea.value = 'こんにちは';

    // Invoke listeners
    const listeners = eventListeners['input'] || [];
    expect(listeners.length).toBeGreaterThan(0);
    listeners.forEach((fn) => fn());

    expect(callback).toHaveBeenCalledWith('こんにちは');
    expect(mockTextarea.value).toBe(''); // cleared buffer
  });

  test('should remove element from DOM on destroy', () => {
    const input = new ProxyInput();
    input.destroy();

    expect(mockTextarea.parentNode.removeChild).toHaveBeenCalledWith(mockTextarea);
  });
});
