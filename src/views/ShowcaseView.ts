import { UIComponent, Card, Text, Button } from '@vectojs/ui';

export class ShowcaseView extends UIComponent {
  private bgCard: Card;
  private headerTitle: Text;
  private headerSubtitle: Text;
  private enterButton: Button;
  private sectionTitle: Text;

  private cards: Card[] = [];
  private cardDescs: Text[] = [];
  private cardTags: Text[] = [];

  constructor() {
    super();
    this.width = window.innerWidth || 800;
    this.height = window.innerHeight || 600;

    // Full viewport background container (slate-950 tone)
    this.bgCard = new Card({
      width: this.width,
      height: this.height,
      bg: '#0b0f19', 
      border: 'transparent',
      radius: 0,
    });
    this.add(this.bgCard);

    // Modern Header Layout
    this.headerTitle = new Text('Bakudan 幕弹', {
      font: 'bold 32px sans-serif',
      color: '#ffffff',
    });
    this.bgCard.add(this.headerTitle);

    this.headerSubtitle = new Text('A futuristic mathematical barrage community and playground natively built on VectoJS.', {
      font: '14px sans-serif',
      color: '#64748b',
    });
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
    this.bgCard.add(this.enterButton);

    // Decorative Section Title
    this.sectionTitle = new Text('FEATURED TEMPLATES', {
      font: 'bold 11px sans-serif',
      color: '#475569',
    });
    this.bgCard.add(this.sectionTitle);

    // Showcase Cards Configuration
    const cardTemplates = [
      {
        title: 'Elastic Physics Danmaku',
        desc: 'Barrages with elastic boundary bouncing, acceleration fields, and kinetic momentum exchange.',
        tag: 'PHYSICS',
        tagColor: '#38bdf8', // sky-400
      },
      {
        title: 'Sine-Wave Path Flow',
        desc: 'Elegant mathematical barrages dynamically rippling and text undulating along sine curves.',
        tag: 'MATH',
        tagColor: '#c084fc', // purple-400
      },
      {
        title: 'Cursor Repulsion Shield',
        desc: 'Highly interactive particle shields reacting dynamically to mouse positions in real-time.',
        tag: 'INTERACTIVE',
        tagColor: '#fb7185', // rose-400
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
        lineHeight: 16,
      });
      tDesc.setPosition(20, 45);
      templateCard.add(tDesc);
      this.cardDescs.push(tDesc);

      // Pill Tag
      const tTag = new Text(`[ ${t.tag} ]`, {
        font: 'bold 10px monospace',
        color: t.tagColor,
      });
      tTag.setPosition(630, 23);
      templateCard.add(tTag);
      this.cardTags.push(tTag);

      this.bgCard.add(templateCard);
      this.cards.push(templateCard);
    }

    // Perform initial layout calculation
    this.updateLayout(this.width, this.height);
  }

  public updateLayout(w: number, h: number) {
    this.width = w;
    this.height = h;

    this.bgCard.width = w;
    this.bgCard.height = h;

    // Centered layout max-width 740px with 30px side padding on smaller screens
    const maxContentWidth = Math.min(740, w - 60);
    const startX = Math.floor((w - maxContentWidth) / 2);

    this.headerTitle.setPosition(startX, 40);
    this.headerSubtitle.setPosition(startX, 90);
    
    // Position description below title dynamically if wrapping occurs on tiny screens
    const subtitleY = this.headerTitle.y + 40;
    this.headerSubtitle.setPosition(startX, subtitleY);
    this.headerSubtitle.maxWidth = maxContentWidth;

    const buttonY = subtitleY + 45;
    this.enterButton.setPosition(startX, buttonY);

    const sectionTitleY = buttonY + 70;
    this.sectionTitle.setPosition(startX, sectionTitleY);

    const isMobile = w < 768;
    const cardHeight = isMobile ? 120 : 95;
    const startCardY = sectionTitleY + 25;

    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      card.width = maxContentWidth;
      card.height = cardHeight;
      card.setPosition(startX, startCardY + i * (cardHeight + 15));

      const descText = this.cardDescs[i];
      descText.maxWidth = maxContentWidth - 40;

      const tagText = this.cardTags[i];
      if (isMobile) {
        // Shift tag below title to prevent overlaying on narrow screens
        tagText.setPosition(maxContentWidth - 110, 20);
      } else {
        tagText.setPosition(maxContentWidth - 110, 20);
      }
    }
  }

  public render(renderer: any): void {
    // Container renders nothing itself
  }
}
