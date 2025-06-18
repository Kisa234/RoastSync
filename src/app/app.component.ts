import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/app-sidebar/app-sidebar.component';
import { appRoutes } from './app.routes';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { AlertComponent } from './shared/components/alert/alert.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styles: [
    `
      :host, div {
        height: 100%;
      }
    `
  ]
})
export class AppComponent {
  title = 'RoastSync';
}
