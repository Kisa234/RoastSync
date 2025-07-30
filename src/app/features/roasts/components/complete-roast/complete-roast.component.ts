import { Tueste } from './../../../../shared/models/tueste';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X } from 'lucide-angular';
import { RoastsService } from '../../service/roasts.service';


@Component({
  selector: 'complete-roast',
  standalone: true,
  imports: [ CommonModule, FormsModule, LucideAngularModule ],
  templateUrl: './complete-roast.component.html',
})
export class CompleteRoastComponent implements OnInit {
  @Input() roastId!: string;
  @Output() close   = new EventEmitter<void>();
  @Output() saved   = new EventEmitter<Tueste>();

 

  readonly X     = X;
  readonly Check = Check;

  roast: Partial<Tueste> = {
    peso_salida: 0,
    merma: 0,
    agtrom_comercial: 0,
    agtrom_gourmet: 0,
  };

  calcAgtrom(){
    this.roast.agtrom_comercial = parseFloat(((this.roast.agtrom_gourmet! * 1.528) * 0.74294 ).toFixed(1));
  }

  constructor(private roastSvc: RoastsService) {}

  ngOnInit() {
    this.roastSvc.getTuesteById(this.roastId).subscribe((tueste: Tueste) => {
      this.roast = {...tueste};
    });
  }

  updateMerma() {
    this.roast.merma = +(((this.roast.peso_entrada! - this.roast.peso_salida!) / this.roast.peso_entrada!) * 100)
      .toFixed(2);
  }

  onComplete() {
    const payload: Tueste = { ...this.roast } as Tueste;
    this.roastSvc.completarTostado(this.roastId, payload )
      .subscribe(Tueste => {
        this.saved.emit(Tueste);
        this.close.emit();
      });
  }
}
