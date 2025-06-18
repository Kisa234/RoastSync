import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    SidebarComponent,
    RouterModule,
    AlertComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './main-layout.component.html',
  styles: ``
})
export class MainLayoutComponent {

}
