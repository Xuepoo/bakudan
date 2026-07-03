import { UIComponent, Card, Text } from '@vectojs/ui';

export class PlaygroundView extends UIComponent {
  constructor() {
    super();
    this.width = 800;
    this.height = 600;

    const card = new Card({ width: 780, height: 580, bg: '#0f172a' });
    card.add(new Text('Playground View Stub', { color: '#ffffff', font: '24px sans-serif' }));
    this.add(card.setPosition(10, 10));
  }
}
