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

  // Resize handler
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scene.markDirty();
  });

  // Expose instances for development convenience
  (window as any).scene = scene;
  (window as any).router = router;
});
