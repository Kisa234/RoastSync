import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiService, PromptOptions } from '../../services/ui.service';
import { LucideAngularModule } from 'lucide-angular';
import { X } from 'lucide-angular';

@Component({
  selector: 'app-prompt-dialog',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './prompt-dialog.component.html'
})
export class PromptDialogComponent {

  readonly X = X;
  options: PromptOptions | null = null;
  value: string = '';
  error: string = '';

  constructor(private ui: UiService) {
    this.ui.prompt$.subscribe(o => {
      this.options = o;
      this.value = '';
      this.error = '';
    });
  }

  cancel() {
    this.ui.rejectPrompt();
  }

   confirm() {
    if (!this.value || this.value.trim().length < 3) {
      this.error = 'El comentario es obligatorio (mínimo 3 caracteres)';
      return;
    }

    this.ui.resolvePrompt(this.value.trim());
  }
}
