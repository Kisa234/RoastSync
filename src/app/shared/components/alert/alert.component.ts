import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { UiService, Alert }   from '../../services/ui.service';
import { LucideAngularModule } from 'lucide-angular';
import { X, CheckCircle, AlertCircle, Info, TriangleAlert  } from 'lucide-angular';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [
    CommonModule, 
    NgIf, 
    LucideAngularModule
  ],
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  alert: Alert|null = null;
  icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: TriangleAlert,
    info: Info,
    
  };
  readonly X = X;

  constructor(private ui: UiService) {
    this.ui.alert$.subscribe(a => this.alert = a);
  }

  close() {
    this.ui.clearAlert();
  }
}
