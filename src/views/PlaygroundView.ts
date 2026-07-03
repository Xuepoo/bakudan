import { UIComponent } from '@vectojs/ui';
import { VemEditorState } from '@vemjs/core';
import { VemEditorEntity } from '@vemjs/renderer-vecto';

export class PlaygroundView extends UIComponent {
  private editorState: VemEditorState;
  private editorEntity: VemEditorEntity;

  constructor() {
    super();
    this.width = 800;
    this.height = 600;

    const defaultCode = `// Edit your custom barrage here!\nclass CustomBarrage extends Entity {\n  update(dt) {\n    this.x -= 50 * dt;\n  }\n}`;
    this.editorState = new VemEditorState(defaultCode);
    this.editorEntity = new VemEditorEntity(this.editorState);
    this.editorEntity.setPosition(0, 0);

    this.add(this.editorEntity);
  }
}
