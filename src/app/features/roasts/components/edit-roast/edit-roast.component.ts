import { Tueste } from './../../../../shared/models/tueste';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { RoastsService } from '../../service/roasts.service';


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
  

  constructor(private roastSvc: RoastsService) {}

  ngOnInit() {
    this.roastSvc.getTuesteById(this.roastId).subscribe((tueste: Tueste) => {
      this.roast = {...tueste};
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
