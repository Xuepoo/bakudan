import { UIComponent, Card, Text, Button } from '@vectojs/ui';

export class ShowcaseView extends UIComponent {
  private bgCard: Card;
  private headerTitle: Text;
  private headerSubtitle: Text;
  private enterButton: Button;

  // Project Showcase Cards
  private cards: Card[] = [];

  constructor() {
    super();
    this.width = 800;
    this.height = 600;

    // Full viewport background container (slate-950 tone)
    this.bgCard = new Card({
      width: 800,
      height: 600,
      bg: '#0b0f19', 
      border: 'transparent',
      radius: 0,
    });
    this.add(this.bgCard);

    // Modern Header Layout
    this.headerTitle = new Text('Bakudan 幕弹', {
      font: 'bold 36px sans-serif',
      color: '#ffffff',
    });
    this.headerTitle.setPosition(30, 40);
    this.bgCard.add(this.headerTitle);

    this.headerSubtitle = new Text('A futuristic mathematical barrage community and playground natively built on VectoJS.', {
      font: '14px sans-serif',
      color: '#64748b',
    });
    this.headerSubtitle.setPosition(30, 90);
    this.bgCard.add(this.headerSubtitle);

    // Call-to-action Sandbox Button (emerald green tech aesthetic)
    this.enterButton = new Button('Enter Sandbox', {
      bg: '#10b981',
      hoverBg: '#059669',
      color: '#ffffff',
      font: '600 14px sans-serif',
      padding: 12,
      radius: 8,
      onClick: () => {
        if ((window as any).router) {
          (window as any).router.navigate('/playground');
        }
      },
    });
    this.enterButton.setPosition(30, 130);
    this.bgCard.add(this.enterButton);

    // Decorative Section Title
    const sectionTitle = new Text('FEATURED TEMPLATES', {
      font: 'bold 11px sans-serif',
      color: '#475569',
    });
    sectionTitle.setPosition(30, 210);
    this.bgCard.add(sectionTitle);

    // Showcase Cards Configuration
    const cardTemplates = [
      {
        title: 'Elastic Physics Danmaku',
        desc: 'Barrages with elastic boundary bouncing, acceleration fields, and kinetic momentum exchange.',
        tag: 'PHYSICS',
        tagColor: '#38bdf8', // sky-400
        x: 30,
        y: 235,
      },
      {
        title: 'Sine-Wave Path Flow',
        desc: 'Elegant mathematical barrages dynamically rippling and text undulating along sine curves.',
        tag: 'MATH',
        tagColor: '#c084fc', // purple-400
        x: 30,
        y: 345,
      },
      {
        title: 'Cursor Repulsion Shield',
        desc: 'Highly interactive particle shields reacting dynamically to mouse positions in real-time.',
        tag: 'INTERACTIVE',
        tagColor: '#fb7185', // rose-400
        x: 30,
        y: 455,
      },
    ];

    for (const t of cardTemplates) {
      const templateCard = new Card({
        width: 740,
        height: 95,
        bg: '#111827', // dark gray
        border: '#1f2937',
        radius: 8,
      });
      templateCard.setPosition(t.x, t.y);

      // Title
      const tTitle = new Text(t.title, {
        font: 'bold 16px sans-serif',
        color: '#f3f4f6',
      });
      tTitle.setPosition(20, 20);
      templateCard.add(tTitle);

      // Description
      const tDesc = new Text(t.desc, {
        font: '13px sans-serif',
        color: '#9ca3af',
        maxWidth: 580,
      });
      tDesc.setPosition(20, 45);
      templateCard.add(tDesc);

      // Pill Tag
      const tTag = new Text(`[ ${t.tag} ]`, {
        font: 'bold 10px monospace',
        color: t.tagColor,
      });
      tTag.setPosition(630, 23);
      templateCard.add(tTag);

      this.bgCard.add(templateCard);
      this.cards.push(templateCard);
    }
  }

  public render(renderer: any): void {
    // Container renders nothing itself
  }
}
