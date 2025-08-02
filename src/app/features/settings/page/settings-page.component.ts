import { Component } from '@angular/core';
import { VariedadesComponent } from '../components/variedades/variedades.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-page',
  imports: [
    CommonModule,
    VariedadesComponent
  ],
  templateUrl: './settings-page.component.html',
  styles: ``
})
export class SettingsPageComponent {
  moduleVariedades:boolean = false;


  openModule(module: string) {
    if (module === 'variedades') {
      this.moduleVariedades = true;
    }
  }

  closeModules() {
    this.moduleVariedades = false;
  }
}
