import { Scene } from '@vectojs/core';
import { Router } from './router';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Instantiate the main Scene
  const scene = new Scene(canvas);
  scene.renderMode = 'onDemand';
  scene.start();

  // Initialize the Router
  const router = new Router(scene);

  // Expose instances for development convenience
  (window as any).scene = scene;
  (window as any).router = router;
});
