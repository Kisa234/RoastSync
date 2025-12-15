import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoxRespuestaService } from '../../service/box-respuesta.service';
import { BoxRespuesta } from '../../../../shared/models/box-respuesta';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserNamePipe } from "../../../../shared/pipes/user-name-pipe.pipe";
import { BoxTemplate } from '../../../../shared/models/box-template';
import { TitlecaseSmartPipe } from "../../../../shared/pipes/titlecase-smart.pipe";
import { LucideAngularComponent, LucideAngularModule, Edit, Trash } from 'lucide-angular';

@Component({
  selector: 'app-box-respuestas',
  imports: [FormsModule, CommonModule, UserNamePipe, TitlecaseSmartPipe, LucideAngularModule],
  templateUrl: './box-respuestas.component.html',
  styles: ``
})
export class BoxRespuestasComponent {
  
  @Input() box: BoxTemplate | null = null;
  @Output() end = new EventEmitter<void>();

  readonly Edit = Edit;
  readonly Trash2 = Trash;  

  respuestas: BoxRespuesta[] = [];
  resumen = {
    total: 0,
    tueste: { claro: 0, medio: 0, oscuro: 0 },
    molienda: { fina: 0, media: 0, gruesa: 0 }
  };

  constructor(private respuestaService: BoxRespuestaService) { }

  ngOnInit() {
    this.loadRespuestas();
  }

  close() { 
    this.end.emit();
   }

  loadRespuestas() {
    this.respuestaService.getByTemplate(this.box!.id_box_template).subscribe(r => {
      this.respuestas = r;
      this.calcularResumen();
    });
  }

  calcularResumen() {
    
  }

  verDetalle(r: any) {
    console.log('Detalle', r);
  }

  editarRespuesta(r: any) {
    console.log('Editar', r);
  }

  eliminarRespuesta(r: any) {
    
  }

  nuevaRespuesta() {
    console.log('Nueva respuesta');
  }
}
