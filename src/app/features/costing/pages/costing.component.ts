import { Component, OnInit } from '@angular/core';
import { LoteService } from './../../inventory/service/lote.service';
import { Lote } from '../../../shared/models/lote';

@Component({
  selector: 'app-costing',
  imports: [],
  templateUrl: './costing.component.html',
  styles: ``
})
export class CostingComponent implements OnInit {

  constructor(
    private loteService: LoteService
  ) { }

  lotes: Lote[] = [];

  ngOnInit(): void {
    this.loadLotes();
  }

  loadLotes(): void {
    this.loteService.getAll().subscribe({
      next: (lotes) => {
        this.lotes = lotes;
      }
    });
  }

  


}
