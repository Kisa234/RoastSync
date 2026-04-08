// src/app/layouts/main/main-layout.component.ts
import { Component } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';
import { PromptDialogComponent } from "../../shared/components/prompt-dialog/prompt-dialog.component";
import { ConfirmDialogComponent } from "../../shared/components/confirm-dialog/confirm-dialog.component";
import { AlertComponent } from "../../shared/components/alert/alert.component";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    NgIf,
    RouterOutlet,
    SidebarComponent,
    PromptDialogComponent,
    ConfirmDialogComponent,
    AlertComponent
],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {
  authReady = true;   
  collapsed = false;  
}
