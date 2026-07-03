import { Scene } from '@vectojs/core';
import { Router } from './router';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Set canvas logical size to match physical display size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Instantiate the main Scene
  const scene = new Scene(canvas);
  scene.start();

  // Initialize the Router
  const router = new Router(scene);

  const designWidth = 800;
  const designHeight = 600;

  function updateViewportScale() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Ensure 1:1 pixel scale globally to prevent coordinate projection misalignment
    scene.root.scaleX = 1;
    scene.root.scaleY = 1;
    scene.root.x = 0;
    scene.root.y = 0;

    const path = window.location.pathname;
    if (path === '/playground') {
      if (router.playgroundView) {
        router.playgroundView.mountSandbox();
      }
    } else {
      if (router.showcaseView) {
        router.showcaseView.updateLayout(window.innerWidth, window.innerHeight);
      }
    }

    scene.markDirty();
  }

  // Set initial viewport layout
  updateViewportScale();

  // Handle Resize and navigation-based scale updates
  window.addEventListener('resize', updateViewportScale);

  // Hook router navigate to trigger viewport update on navigation
  const origNavigate = router.navigate;
  router.navigate = function (path: string) {
    origNavigate.call(router, path);
    updateViewportScale();
  };

  // Expose instances for development convenience
  (window as any).scene = scene;
  (window as any).router = router;
});
