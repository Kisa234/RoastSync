import { Component } from '@angular/core';
import { VariedadesComponent } from '../components/variedades/variedades.component';
import { CommonModule } from '@angular/common';
import { NotasComponent } from "../components/notas/notas.component";

@Component({
  selector: 'app-settings-page',
  imports: [
    CommonModule,
    VariedadesComponent,
    NotasComponent
],
  templateUrl: './settings-page.component.html',
  styles: ``
})
export class SettingsPageComponent {
  moduleVariedades:boolean = false;
  moduleNotas:boolean = false;


  openModule(module: string) {
    if (module === 'variedades') {
      this.moduleVariedades = true;
    }else if (module === 'notas'){
      this.moduleNotas = true;
    }
  }

  closeModules() {
    this.moduleVariedades = false;
    this.moduleNotas =false;
  }
}
