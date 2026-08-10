import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Edit, Check } from 'lucide-angular';

import { RoastsService } from '../../service/roasts.service';
import { PedidoService } from '../../../orders/service/orders.service';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';
import { EditRoastComponent } from '../../components/edit-roast/edit-roast.component';
import { CompleteRoastComponent } from '../../components/complete-roast/complete-roast.component';

import { Tueste } from '../../../../shared/models/tueste';
import { Pedido } from '../../../../shared/models/pedido';

@Component({
  selector: 'app-order-tuestes-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    LucideAngularModule,
    UserNamePipe,
    EditRoastComponent,
    CompleteRoastComponent,
  ],
  templateUrl: './order-tuestes.page.html'
})
export class OrderTuestesPage implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Edit = Edit;
  readonly Check = Check;

  idPedido = '';
  pedido: Pedido | null = null;
  roasts: Tueste[] = [];
  isLoading = false;

  showEdit = false;
  showComplete = false;
  selectedId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private roastsSvc: RoastsService,
    private pedidoSvc: PedidoService,
  ) { }

  ngOnInit(): void {
    this.idPedido = this.route.snapshot.paramMap.get('id_pedido') || '';
    if (!this.idPedido) return;

    this.pedidoSvc.getPedidoById(this.idPedido).subscribe(p => this.pedido = p);
    this.loadRoasts();
  }

  loadRoasts(): void {
    this.isLoading = true;
    this.roastsSvc.getTuestesByPedido(this.idPedido).subscribe({
      next: (list) => {
        this.roasts = [...list].sort((a, b) => (Number(a.num_batch) || 0) - (Number(b.num_batch) || 0));
        this.isLoading = false;
      },
      error: () => {
        this.roasts = [];
        this.isLoading = false;
      }
    });
  }

  openEdit(id: string): void {
    this.selectedId = id;
    this.showEdit = true;
  }

  onRoasterUpdated(): void {
    this.showEdit = false;
    this.loadRoasts();
  }

  openComplete(id: string): void {
    this.selectedId = id;
    this.showComplete = true;
  }

  onCompleted(): void {
    this.showComplete = false;
    this.loadRoasts();
  }

  goBack(): void {
    this.router.navigate(['/roasts']);
  }
}