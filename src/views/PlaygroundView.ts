import { UIComponent, Card, Text, Toggle } from '@vectojs/ui';
import { VemEditorState } from '@vemjs/core';
import { VemEditorEntity } from '@vemjs/renderer-vecto';

export class PlaygroundView extends UIComponent {
  private editorState: VemEditorState;
  private editorEntity: VemEditorEntity;
  private vimToggle: Toggle;
  private terminalCard: Card;
  private terminalTitle: Text;
  private terminalText: Text;
  private iframe: HTMLIFrameElement | null = null;
  private isSandboxReady = false;
  private queue: string[] = [];
  private vimModeEnabled = false;

  private handleKeyDown: (e: KeyboardEvent) => void;
  private handleMessage: (e: MessageEvent) => void;

  constructor() {
    super();
    this.width = 800;
    this.height = 600;

    const defaultCode = `// Edit your custom barrage here!\nclass CustomBarrage extends Entity {\n  update(dt) {\n    this.x -= 50 * dt;\n  }\n}`;
    this.editorState = new VemEditorState(defaultCode);
    this.editorState.setMode('INSERT');

    // Control bar at the top (Left 400px)
    const controlBarHeight = 40;
    const controlBar = new Card({
      width: 400,
      height: controlBarHeight,
      bg: '#1e293b', // slate-800
      border: '#334155', // slate-700
      radius: 0,
    });
    controlBar.setPosition(0, 0);
    this.add(controlBar);

    this.vimToggle = new Toggle({
      label: 'Vim Mode',
      checked: false,
      onChange: (checked) => {
        this.vimModeEnabled = checked;
        if (!checked) {
          this.editorState.setMode('INSERT');
        } else {
          this.editorState.setMode('NORMAL');
        }
      },
    });
    this.vimToggle.setPosition(10, 8);
    controlBar.add(this.vimToggle);

    // Editor Entity (Middle 400px height 400px)
    this.editorEntity = new VemEditorEntity(this.editorState);
    this.editorEntity.setPosition(0, controlBarHeight);
    this.editorEntity.width = 400;
    this.editorEntity.height = 400;
    this.editorEntity.updateFromState();
    this.add(this.editorEntity);

    // Terminal Card (Bottom 400px height 160px)
    this.terminalCard = new Card({
      width: 400,
      height: 160,
      bg: '#0f172a', // slate-900
      border: '#334155', // slate-800
      radius: 0,
    });
    this.terminalCard.setPosition(0, controlBarHeight + 400);

    this.terminalTitle = new Text('TERMINAL LOGS', {
      font: 'bold 11px sans-serif',
      color: '#64748b', // slate-500
    });
    this.terminalTitle.setPosition(10, 10);
    this.terminalCard.add(this.terminalTitle);

    this.terminalText = new Text('No errors reported.', {
      font: '12px monospace',
      color: '#cbd5e1', // slate-300
      maxWidth: 380,
      lineHeight: 16,
    });
    this.terminalText.setPosition(10, 30);
    this.terminalCard.add(this.terminalText);

    this.add(this.terminalCard);

    // Handshake and error listeners
    this.handleMessage = (e: MessageEvent) => {
      const { type, error } = e.data;
      if (type === 'SANDBOX_READY') {
        this.isSandboxReady = true;
        this.terminalText.setText('Sandbox connected.');
        this.terminalText.color = '#10b981'; // emerald green
        this.scene?.markDirty();
        this.flushQueue();
      } else if (type === 'RUNTIME_ERROR') {
        this.renderTerminalError(error);
      }
    };

    // Window keydown listener
    this.handleKeyDown = (e: KeyboardEvent) => {
      if (!this.parent) return;

      const key = e.key;

      if (key === 'Escape' && !this.vimModeEnabled) {
        e.preventDefault();
        return;
      }

      let feedKey = key;
      if (e.ctrlKey) {
        if (key === 'r') feedKey = '<C-r>';
        else if (key === 'v') feedKey = '<C-v>';
      }

      const keysToPrevent = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Backspace',
        ' ',
      ];
      if (keysToPrevent.includes(key) || (e.ctrlKey && (key === 'r' || key === 'v'))) {
        e.preventDefault();
      }

      this.editorState.handleKey(feedKey);
    };

    // Watch for editor state changes
    this.editorState.onDidChangeBuffer(() => {
      this.runCode(this.editorState.getText());
    });
  }

  public mountSandbox() {
    this.unmountSandbox();

    // Dynamically size workspace container size based on display size
    if (this.scene) {
      this.width = this.scene.canvas.width;
      this.height = this.scene.canvas.height;
    }

    const halfWidth = Math.floor(this.width / 2);
    
    // Resize inner layout elements dynamically
    this.editorEntity.width = halfWidth;
    this.editorEntity.height = this.height - 40 - 160; // Subtract control bar and terminal heights
    this.editorEntity.updateFromState();

    this.terminalCard.width = halfWidth;
    this.terminalCard.setPosition(0, 40 + this.editorEntity.height);
    this.terminalText.maxWidth = halfWidth - 20;

    // Create Sandbox Iframe on active view focus
    if (typeof document !== 'undefined' && document.body) {
      this.iframe = document.createElement('iframe');
      this.iframe.src = '/preview.html';
      this.iframe.style.position = 'absolute';
      this.iframe.style.top = '0';
      this.iframe.style.left = `${halfWidth}px`;
      this.iframe.style.width = `${halfWidth}px`;
      this.iframe.style.height = `${this.height}px`;
      this.iframe.style.border = 'none';
      this.iframe.style.backgroundColor = '#0f172a';
      document.body.appendChild(this.iframe);
    }

    window.addEventListener('message', this.handleMessage);
    window.addEventListener('keydown', this.handleKeyDown);

    // Trigger compile initial code
    this.runCode(this.editorState.getText());
  }

  public unmountSandbox() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.handleMessage);
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.isSandboxReady = false;
    this.queue = [];
  }

  private runCode(code: string) {
    if (!this.isSandboxReady) {
      this.queue.push(code);
      return;
    }

    this.terminalText.setText('Running...');
    this.terminalText.color = '#10b981';
    this.scene?.markDirty();

    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({ type: 'RUN_CODE', code }, '*');
    }
  }

  private flushQueue() {
    while (this.queue.length > 0) {
      const code = this.queue.shift();
      if (code) {
        this.runCode(code);
      }
    }
  }

  private renderTerminalError(error: string) {
    this.terminalText.setText(error);
    this.terminalText.color = '#ef4444';
    this.scene?.markDirty();
  }

  public destroy(): void {
    this.unmountSandbox();
    super.destroy();
  }
}
