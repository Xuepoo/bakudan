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

  private handleMessage: (e: MessageEvent) => void;

  constructor() {
    super();
    this.width = 800;
    this.height = 600;

    const defaultCode = `class CustomBarrage extends Entity {
  constructor() {
    super();
    this.x = 300;
    this.y = 200;
  }
  update(dt) {
    this.x -= 0.1 * dt;
    if (this.x < -100) {
      this.x = 400;
    }
  }
  render(renderer) {
    const ctx = renderer.ctx;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText('Bakudan', this.x - 22, this.y + 4);
  }
}`;
    this.editorState = new VemEditorState(defaultCode);
    this.editorState.setMode('INSERT');

    // Control bar at the top (Right halfWidth)
    const controlBarHeight = 40;
    this.controlBarCard = new Card({
      width: 400,
      height: controlBarHeight,
      bg: '#1e293b', // slate-800
      border: '#334155', // slate-700
      radius: 0,
    });
    this.controlBarCard.setPosition(400, 0);
    this.add(this.controlBarCard);

    // Live Indicator in Control Bar
    this.liveIndicator = new Text('● LIVE PREVIEW', {
      font: 'bold 10px sans-serif',
      color: '#10b981', // green-500
    });
    this.liveIndicator.setPosition(300, 15);
    this.controlBarCard.add(this.liveIndicator);

    (this.editorState as any).vimModeEnabled = false;

    this.vimToggle = new Toggle({
      label: 'Vim Mode',
      checked: false,
      onChange: (checked) => {
        this.vimModeEnabled = checked;
        (this.editorState as any).vimModeEnabled = checked;
        if (!checked) {
          this.editorState.setMode('INSERT');
        } else {
          this.editorState.setMode('NORMAL');
        }
      },
    });
    this.vimToggle.setPosition(10, 8);
    this.controlBarCard.add(this.vimToggle);

    // Editor Entity (Right halfWidth height 400px)
    this.editorEntity = new VemEditorEntity(this.editorState);
    this.editorEntity.setPosition(400, controlBarHeight);
    this.editorEntity.width = 400;
    this.editorEntity.height = 400;
    this.add(this.editorEntity);

    // Terminal Card (Right halfWidth height 160px)
    this.terminalCard = new Card({
      width: 400,
      height: 160,
      bg: '#0f172a', // slate-900
      border: '#334155', // slate-800
      radius: 0,
    });
    this.terminalCard.setPosition(400, controlBarHeight + 400);

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
        this.liveIndicator.color = '#10b981';
        this.scene?.markDirty();
        this.flushQueue();
      } else if (type === 'RUNTIME_ERROR') {
        this.renderTerminalError(error);
      }
    };

    // Watch for editor state changes (with 300ms compile debouncing for silky typing)
    this.editorState.onDidChangeBuffer(() => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.runCode(this.editorState.getText());
      }, 300);
    });
  }

  public mountSandbox() {
    this.unmountSandbox();

    // Dynamically size workspace container size based on display size
    if (this.scene) {
      this.width = this.scene.canvas.width;
      this.height = this.scene.canvas.height;
    }

    const isMobile = this.width < 768;

    if (isMobile) {
      // Vertical layout (Top: Preview sandbox, Bottom: Controls & Editor)
      const previewHeight = Math.floor(this.height * 0.4);
      const editorHeight = this.height - previewHeight - 40 - 100; // Remaining space for editor

      // Resize control bar
      this.controlBarCard.width = this.width;
      this.controlBarCard.setPosition(0, previewHeight);
      this.liveIndicator.setPosition(this.width - 100, 15);

      // Resize Editor (positioned under controlBar)
      this.editorEntity.width = this.width;
      this.editorEntity.height = editorHeight;
      this.editorEntity.setPosition(0, previewHeight + 40);
      this.editorEntity.updateFromState();

      // Resize Terminal (positioned under Editor)
      this.terminalCard.width = this.width;
      this.terminalCard.height = 100;
      this.terminalCard.setPosition(0, previewHeight + 40 + editorHeight);
      this.terminalText.maxWidth = this.width - 20;

      // Create Sandbox Iframe on active view focus (Placed on top)
      if (typeof document !== 'undefined' && document.body) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = '/preview.html';
        this.iframe.style.position = 'absolute';
        this.iframe.style.top = '0';
        this.iframe.style.left = '0';
        this.iframe.style.width = `${this.width}px`;
        this.iframe.style.height = `${previewHeight}px`;
        this.iframe.style.border = 'none';
        this.iframe.style.backgroundColor = '#0f172a';
        document.body.appendChild(this.iframe);
      }
    } else {
      // Horizontal layout (Left: Preview sandbox, Right: Controls & Editor)
      const halfWidth = Math.floor(this.width / 2);
      
      // Resize control bar
      this.controlBarCard.width = halfWidth;
      this.controlBarCard.setPosition(halfWidth, 0);
      this.liveIndicator.setPosition(halfWidth - 100, 15);

      // Resize inner layout elements dynamically (Shift to the right side)
      this.editorEntity.width = halfWidth;
      this.editorEntity.height = this.height - 40 - 160;
      this.editorEntity.setPosition(halfWidth, 40);
      this.editorEntity.updateFromState();

      this.terminalCard.width = halfWidth;
      this.terminalCard.height = 160;
      this.terminalCard.setPosition(halfWidth, 40 + this.editorEntity.height);
      this.terminalText.maxWidth = halfWidth - 20;

      // Create Sandbox Iframe on active view focus (Placed on the left side)
      if (typeof document !== 'undefined' && document.body) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = '/preview.html';
        this.iframe.style.position = 'absolute';
        this.iframe.style.top = '0';
        this.iframe.style.left = '0';
        this.iframe.style.width = `${halfWidth}px`;
        this.iframe.style.height = `${this.height}px`;
        this.iframe.style.border = 'none';
        this.iframe.style.backgroundColor = '#0f172a';
        document.body.appendChild(this.iframe);
      }
    }

    window.addEventListener('message', this.handleMessage);

    // Trigger compile initial code
    this.runCode(this.editorState.getText());
  }

  public unmountSandbox() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.handleMessage);
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
    this.liveIndicator.color = '#ef4444'; // Red indicator on compilation failure
    this.scene?.markDirty();
  }

  public destroy(): void {
    this.unmountSandbox();
    super.destroy();
  }

  public render(renderer: any): void {
    // Container renders nothing itself
  }
}
