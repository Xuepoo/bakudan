/**
 * ProxyInput is an invisible overlay `<textarea>` element that captures complex IME
 * and mobile virtual keyboard focus states, redirects input to canvas text models,
 * and clears the buffer correctly.
 */
export class ProxyInput {
  private el: HTMLTextAreaElement;

  /**
   * Initializes the proxy input textarea element and appends it to the document body.
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  constructor() {
    this.el = document.createElement('textarea');
    this.el.style.position = 'absolute';
    this.el.style.opacity = '0';
    this.el.style.pointerEvents = 'none';
    this.el.style.width = '1px';
    this.el.style.height = '1px';
    this.el.style.overflow = 'hidden';
    this.el.style.border = 'none';
    this.el.style.padding = '0';
    this.el.style.margin = '0';
    this.el.setAttribute('autocomplete', 'off');
    this.el.setAttribute('autocorrect', 'off');
    this.el.setAttribute('autocapitalize', 'off');
    this.el.setAttribute('spellcheck', 'false');
    document.body.appendChild(this.el);
  }

  /**
   * Focuses the proxy input at the specified coordinates (useful for IME positioning).
   * @param x The absolute X coordinate.
   * @param y The absolute Y coordinate.
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  public focusAt(x: number, y: number): void {
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
    this.el.focus();
  }

  /**
   * Registers a callback to be triggered when new text is input.
   * @param callback The callback receiving the input text.
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  public onInput(callback: (text: string) => void): void {
    this.el.addEventListener('input', () => {
      callback(this.el.value);
      this.el.value = ''; // clear buffer after dispatching
    });
  }

  /**
   * Cleans up the proxy input by removing the element from the DOM.
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  public destroy(): void {
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }

  /**
   * Expose the underlying element for testing purposes.
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  public getElement(): HTMLTextAreaElement {
    return this.el;
  }
}
