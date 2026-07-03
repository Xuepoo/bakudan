import { Scene } from '@vectojs/core';
import { ShowcaseView } from './views/ShowcaseView';
import { PlaygroundView } from './views/PlaygroundView';

export class Router {
  private scene: Scene;
  public showcaseView: ShowcaseView;
  public playgroundView: PlaygroundView;
  private popstateHandler: () => void;

  constructor(scene: Scene) {
    this.scene = scene;
    this.showcaseView = new ShowcaseView();
    this.playgroundView = new PlaygroundView();

    this.popstateHandler = () => this.handleRoute(window.location.pathname);
    window.addEventListener('popstate', this.popstateHandler);

    // Initialize with the current path
    this.handleRoute(window.location.pathname);
  }

  public navigate(path: string) {
    window.history.pushState({}, '', path);
    this.handleRoute(path);
  }

  private handleRoute(path: string) {
    this.scene.remove(this.showcaseView);
    this.scene.remove(this.playgroundView);
    this.playgroundView.unmountSandbox();

    if (path === '/playground') {
      this.scene.add(this.playgroundView);
      this.playgroundView.mountSandbox();
    } else {
      this.scene.add(this.showcaseView);
    }
    this.scene.markDirty();
  }

  public destroy() {
    window.removeEventListener('popstate', this.popstateHandler);
    this.scene.remove(this.showcaseView);
    this.scene.remove(this.playgroundView);
    this.playgroundView.unmountSandbox();
  }
}
