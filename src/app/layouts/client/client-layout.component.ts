import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { AlertComponent } from "../../shared/components/alert/alert.component";
import { ConfirmDialogComponent } from "../../shared/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-client-layout',
  templateUrl: './client-layout.component.html',
  imports: [RouterOutlet, AlertComponent, ConfirmDialogComponent]
})
export class ClientLayoutComponent {}
