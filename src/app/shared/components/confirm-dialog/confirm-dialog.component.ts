import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { UiService, ConfirmOptions } from '../../services/ui.service';
import { LucideAngularModule }      from 'lucide-angular';
import { X }                        from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    NgIf, 
    LucideAngularModule
  ],
  templateUrl: './confirm-dialog.component.html',
  
})
export class ConfirmDialogComponent {
  readonly X = X;

  options: ConfirmOptions|null = null;

  constructor(private ui: UiService) {
    this.ui.confirm$.subscribe(o => this.options = o);
  }

  cancel() {
    this.ui.rejectConfirm();
  }

  confirm() {
    this.ui.resolveConfirm();
  }
}
