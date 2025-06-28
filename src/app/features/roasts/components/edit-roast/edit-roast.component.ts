import { Tueste } from './../../../../shared/models/tueste';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { RoastsService } from '../../service/roasts.service';
import { AvgTueste } from '../../../../shared/models/avg-tueste';


@Component({
  selector: 'edit-roast',
  standalone: true,
  imports: [ CommonModule, FormsModule, LucideAngularModule ],
  templateUrl: 'edit-roast.component.html',
})
export class EditRoastComponent implements OnInit {
  @Input() roastId!: string;
  @Output() close  = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<Tueste>();
  readonly X = X;
  roast: Partial<Tueste> = {

  };
  
  ref: AvgTueste= {
    temperatura_entrada: 0,
    llama_inicial: 0,
    aire_inicial: 0,
    punto_no_retorno: 0,
    tiempo_despues_crack: 0,
    temperatura_crack: 0,
    temperatura_salida: 0,
    tiempo_total: 0,
    porcentaje_caramelizacion: 0,
    desarrollo: 0,
    grados_desarrollo: 0
  }

  constructor(private roastSvc: RoastsService) {}

  ngOnInit() {
    this.roastSvc.getTuesteById(this.roastId).subscribe((tueste: Tueste) => {
      this.roast = {...tueste};
    });
    this.roastSvc.getAverageTueste(this.roastId).subscribe((ref: AvgTueste) => {
      this.ref = ref;
    });
  }

  onSave() {
    const payload: Tueste = { ...this.roast } as Tueste;
    this.roastSvc.updateTueste(this.roastId, payload )
      .subscribe(updated => {
        this.saved.emit(updated);
        this.close.emit();
      });
  }
}
