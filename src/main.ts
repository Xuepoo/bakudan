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

    const path = window.location.pathname;
    if (path === '/playground') {
      // Fluid layout: reset root scale & position for full layout
      scene.root.scaleX = 1;
      scene.root.scaleY = 1;
      scene.root.x = 0;
      scene.root.y = 0;
      if (router.playgroundView) {
        router.playgroundView.mountSandbox();
      }
    } else {
      // Scale-to-fit layout: center and scale design resolution
      const scale = Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight);
      scene.root.scaleX = scale;
      scene.root.scaleY = scale;
      scene.root.x = (window.innerWidth - designWidth * scale) / 2;
      scene.root.y = (window.innerHeight - designHeight * scale) / 2;
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
