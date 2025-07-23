// src/app/features/roasts/components/order-roasts-modal/order-roasts-modal.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import {  LucideAngularModule } from 'lucide-angular';
import { X, Edit, Check }    from 'lucide-angular';
import { RoastsService }      from '../../service/roasts.service';
import { Tueste }             from '../../../../shared/models/tueste';
import { EditRoastComponent } from '../edit-roast/edit-roast.component';
import { CompleteRoastComponent } from '../complete-roast/complete-roast.component';

@Component({
  selector: 'order-roasts',
  standalone: true,
  imports: [ 
    CommonModule, 
    FormsModule, 
    LucideAngularModule,
    EditRoastComponent,
    CompleteRoastComponent
   ],
  templateUrl: './order-roasts.component.html',
})
export class OrderRoastsComponent implements OnInit {
  @Input() orderId!: string;
  @Input() clientName!: string;
  @Input() deliveryDate!: Date;
  @Output() close = new EventEmitter<void>();
  showEdit: boolean = false;
  selectedId: string = '';
  showComplete = false;
  roasts: Tueste[] = [];
  isLoading = false;

  readonly X     = X;
  readonly Edit = Edit;
  readonly Check = Check;

  constructor(private roastsSvc: RoastsService) {}

  ngOnInit() {
    this.loadRoasts();
  }

  loadRoasts() {
    this.isLoading = true;
    this.roastsSvc.getTuestesByPedido(this.orderId)
      .subscribe(list => {
        this.roasts = list;
        this.isLoading = false;
      }, _ => {
        this.roasts = [];
        this.isLoading = false;
      });
  }

  onClose() {
    this.close.emit();
  }

  openEdit(id: string) {
    this.selectedId = id;
    this.showEdit   = true;
  }
  
  onRoasterUpdated(updated: Tueste) {
    this.showEdit = false;
    this.loadRoasts(); 
  }

  openComplete(id:string) {
    this.selectedId = id;
    this.showComplete  = true;
  }

  onCompleted(saved: Tueste) {
    this.showComplete = false;
    this.loadRoasts();
  }
  
}
