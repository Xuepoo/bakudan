import { UIComponent, Card, Text } from '@vectojs/ui';

export class ShowcaseView extends UIComponent {
  constructor() {
    super();
    this.width = 800;
    this.height = 600;

    const card = new Card({ width: 780, height: 580, bg: '#334155', border: '#475569' });
    const text = new Text('Showcase View Stub', { color: '#ffffff', font: 'bold 24px sans-serif' });
    text.setPosition(20, 40);
    card.add(text);
    this.add(card.setPosition(10, 10));
  }

  public render(renderer: any): void {
    // Container renders nothing itself
  }
}
