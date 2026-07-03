# 爆弹 / 幕弹 (Bakudan) 💣

**Bakudan (幕弹)** is a futuristic, mathematical & physics-driven barrage playground and sharing community natively built with [VectoJS](https://github.com/Xuepoo/vectojs). 

It empowers creators to design complex, interactive danmaku feasts—such as elastic bouncing projectiles, cursor-repulsive shields, and undulating sine-wave text paths—all through simple, code-driven component design inside a sandboxed environment.

---

## ✨ Features

- 🌀 **Interactive Barrage Sandbox**: Subagent-driven compiler with runtime error isolation and automatic hot reloading.
- ⚡️ **Debounced Silky Compile**: Zero-lag typing experience driven by 300ms compiler update debouncing.
- ⌨️ **Vem Editor Native**: Embedded high-performance keyboard-interactive text editor. Default to ordinary text editing, with a simple switch to activate Vim keybindings and NORMAL mode.
- 📐 **Math & Physics Framework**: Custom physics collision engine, force fields, and curve layouts.
- 🎨 **Glassmorphism Premium UI**: Stunning dark-mode layout built directly upon VectoJS UI box models.
- 🖥️ **Dual Split Layout**: Real-time canvas preview on the left; editor, control bars, and terminal compilation logs on the right.

---

## 🚀 Getting Started

### Prerequisites

You need [Bun](https://bun.sh) installed globally to drive this project.

### Run Local Development Server

```bash
# Clone the repository
git clone https://github.com/Xuepoo/bakudan.git
cd bakudan

# Install workspace dependencies
bun install

# Start Vite live-reload dev server
bun run dev
```

### Production Build & Deploy

To build static bundles for deployment (e.g. Cloudflare Pages):

```bash
bun run build
```

---

## 🛠 Tech Stack

- **Graphics Core**: [VectoJS](https://github.com/Xuepoo/vectojs) (Virtual Math Tree & Canvas 2D engine)
- **UI System**: `@vectojs/ui` (A11y-compliant semantic projection controls)
- **Code Editor**: `vem` (Native Vim-like web canvas text editor)
- **Bundler & Preview**: Vite (Rollup Multi-Page Entry Configuration)
- **Cloud Infrastructure**: Cloudflare Pages, D1 Database, R2 Font Buckets

---

## 📜 License

This project is licensed under the GPL v3 License.
