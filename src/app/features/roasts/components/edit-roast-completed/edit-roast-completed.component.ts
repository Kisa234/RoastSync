import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Pencil } from 'lucide-angular';
import { RoastsService } from '../../service/roasts.service';
import { Tueste } from '../../../../shared/models/tueste';
import { TimeInputComponent } from '../../../../shared/components/time-input/time-input.component';
import { AvgTueste } from '../../../../shared/models/avg-tueste';

@Component({
  selector: 'edit-roast-completed',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TimeInputComponent],
  templateUrl: './edit-roast-completed.component.html',
})
export class EditRoastCompletedComponent implements OnInit {
  @Input() roastId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Tueste>();

  readonly X      = X;
  readonly Pencil = Pencil;

  roast: Partial<Tueste> = {};
  ref: AvgTueste = {
    temperatura_entrada: 0, llama_inicial: 0, aire_inicial: 0,
    punto_no_retorno: 0, tiempo_despues_crack: 0, temperatura_crack: 0,
    temperatura_salida: 0, tiempo_total: 0, porcentaje_caramelizacion: 0,
    desarrollo: 0, grados_desarrollo: 0
  };

  constructor(private roastSvc: RoastsService) {}

  ngOnInit(): void {
    this.roastSvc.getTuesteById(this.roastId).subscribe((tueste: Tueste) => {
      this.roast = { ...tueste };
      this.roastSvc.getAverageTueste(tueste.id_lote).subscribe((avg: AvgTueste) => {
        this.ref = {
          temperatura_entrada:      +avg.temperatura_entrada.toFixed(2),
          llama_inicial:            +avg.llama_inicial.toFixed(2),
          aire_inicial:             +avg.aire_inicial.toFixed(2),
          punto_no_retorno:         +avg.punto_no_retorno.toFixed(2),
          tiempo_despues_crack:     +avg.tiempo_despues_crack.toFixed(2),
          temperatura_crack:        +avg.temperatura_crack.toFixed(2),
          temperatura_salida:       +avg.temperatura_salida.toFixed(2),
          tiempo_total:             +avg.tiempo_total.toFixed(2),
          porcentaje_caramelizacion:+avg.porcentaje_caramelizacion.toFixed(2),
          desarrollo:               +avg.desarrollo.toFixed(2),
          grados_desarrollo:        +avg.grados_desarrollo.toFixed(2),
        };
      });
    });
  }

  calcAgtrom(): void {
    this.roast.agtrom_comercial = parseFloat(
      ((this.roast.agtrom_gourmet! + 1.528) * 0.74294).toFixed(1)
    );
  }

  updateMerma(): void {
    this.roast.merma = +(
      ((this.roast.peso_entrada! - this.roast.peso_salida!) / this.roast.peso_entrada!) * 100
    ).toFixed(2);
  }

  onSave(): void {
    const payload = { ...this.roast } as Tueste;
    this.roastSvc.updateTueste(this.roastId, payload).subscribe(updated => {
      this.saved.emit(updated);
      this.close.emit();
    });
  }
}