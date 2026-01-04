import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PromptDialogComponent } from '../../shared/components/prompt-dialog/prompt-dialog.component';
import { AuthService } from '../../features/auth/service/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    SidebarComponent,
    RouterModule,
    AlertComponent,
    ConfirmDialogComponent,
    PromptDialogComponent,
    NgIf
  ],
  templateUrl: './main-layout.component.html',
  styles: ``
})
export class MainLayoutComponent {
  constructor(private authService: AuthService, private router: Router) { }

  authReady = false;

  ngOnInit() {
    this.authService.checkSession().subscribe({
      next: () => this.authReady = true,
      error: () => this.router.navigate(['/login'])
    });
  }
}
