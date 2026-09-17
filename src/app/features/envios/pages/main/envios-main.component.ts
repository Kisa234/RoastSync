import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Package, PackageCheck, Truck, Archive, Eye, Plus, Search, Printer, Calendar } from 'lucide-angular';
import { forkJoin } from 'rxjs';

import { PaqueteService } from '../../service/paquete.service';
import { EnviosService } from '../../service/envios.service';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';
import { PrintOrdenDespachoComponent, OrdenDespachoImprimible } from '../../components/print-orden-despacho/print-orden-despacho.component';

import { Paquete } from '../../../../shared/models/paquete';
import { Envio } from '../../../../shared/models/envio';
import { EstadoEnvio } from '../../../../shared/enum/estado-envio.enum';
import { EstadoPaquete } from '../../../../shared/enum/estado-paquete.enum';

type TabEnvios = 'preparar' | 'listos' | 'porDespachar' | 'camino' | 'historico';

@Component({
  selector: 'app-envios-main',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UserNamePipe, PrintOrdenDespachoComponent],
  templateUrl: './envios-main.component.html'
})
export class EnviosMainPage implements OnInit {
  readonly Package = Package;
  readonly PackageCheck = PackageCheck;
  readonly Truck = Truck;
  readonly Archive = Archive;
  readonly Eye = Eye;
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Printer = Printer;
  readonly Calendar = Calendar;

  activeTab: TabEnvios = 'preparar';
  searchTerm = '';

  paquetes: Paquete[] = [];
  envios: Envio[] = [];

  datosParaImprimir: OrdenDespachoImprimible | null = null;

  page = 1;
  pageSize = 15;

  loading = false;

  constructor(
    private paqueteSvc: PaqueteService,
    private enviosSvc: EnviosService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.loading = true;
    forkJoin({
      paquetes: this.paqueteSvc.getAll(),
      envios: this.enviosSvc.getAllEnvios(),
    }).subscribe({
      next: ({ paquetes, envios }) => {
        this.paquetes = paquetes;
        this.envios = envios;
        this.loading = false;
      },
      error: (err) => {
        console.error('[EnviosMainPage] Error cargando datos:', err);
        this.loading = false;
      }
    });
  }

  setTab(tab: TabEnvios) {
    this.activeTab = tab;
    this.page = 1;
  }

  onSearchChange() {
    this.page = 1;
  }

  // ---------- Datasets por tab ----------

  get paquetesPorPreparar(): Paquete[] {
    return this.filterPaquetes(this.paquetes.filter(p => p.estado === EstadoPaquete.EN_PREPARACION && !p.eliminado));
  }

  get paquetesListos(): Paquete[] {
    const idsConEnvio = new Set(this.envios.map(e => e.id_paquete));
    return this.filterPaquetes(
      this.paquetes.filter(p => p.estado === EstadoPaquete.LISTO && !p.eliminado && !idsConEnvio.has(p.id_paquete))
    );
  }

  /** Envío ya creado, pero todavía no salió del almacén */
  get enviosPorDespachar(): Envio[] {
    const estados: string[] = [EstadoEnvio.PENDIENTE, EstadoEnvio.PROGRAMADO];
    return this.filterEnvios(this.envios.filter(e => estados.includes(e.estado) && !e.eliminado));
  }

  /** Ya salió físicamente del almacén */
  get enviosEnCamino(): Envio[] {
    const estados: string[] = [EstadoEnvio.DESPACHADO, EstadoEnvio.EN_TRANSITO];
    return this.filterEnvios(this.envios.filter(e => estados.includes(e.estado) && !e.eliminado));
  }

  get enviosHistorico(): Envio[] {
    const estados: string[] = [EstadoEnvio.ENTREGADO, EstadoEnvio.CANCELADO, EstadoEnvio.DEVUELTO];
    return this.filterEnvios(this.envios.filter(e => estados.includes(e.estado)));
  }

  get totalPaquetesPorPreparar(): number {
    return this.paquetesPorPreparar.length;
  }
  get paquetesPorPrepararPaginados(): Paquete[] {
    return this.paginar(this.paquetesPorPreparar);
  }

  get totalPaquetesListos(): number {
    return this.paquetesListos.length;
  }
  get paquetesListosPaginados(): Paquete[] {
    return this.paginar(this.paquetesListos);
  }

  get totalEnviosPorDespachar(): number {
    return this.enviosPorDespachar.length;
  }
  get enviosPorDespacharPaginados(): Envio[] {
    return this.paginar(this.enviosPorDespachar);
  }

  get totalEnviosEnCamino(): number {
    return this.enviosEnCamino.length;
  }
  get enviosEnCaminoPaginados(): Envio[] {
    return this.paginar(this.enviosEnCamino);
  }

  get totalEnviosHistorico(): number {
    return this.enviosHistorico.length;
  }
  get enviosHistoricoPaginados(): Envio[] {
    return this.paginar(this.enviosHistorico);
  }

  get totalPages(): number {
    const total = {
      preparar: this.totalPaquetesPorPreparar,
      listos: this.totalPaquetesListos,
      porDespachar: this.totalEnviosPorDespachar,
      camino: this.totalEnviosEnCamino,
      historico: this.totalEnviosHistorico,
    }[this.activeTab];
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  private paginar<T>(list: T[]): T[] {
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }

  private filterPaquetes(list: Paquete[]): Paquete[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter(p =>
      p.id_paquete.toLowerCase().includes(term) ||
      (p.comentario || '').toLowerCase().includes(term)
    );
  }

  private filterEnvios(list: Envio[]): Envio[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter(e =>
      e.numero_correlativo?.toLowerCase().includes(term) ||
      (e.numero_tracking || '').toLowerCase().includes(term)
    );
  }

  /** El cliente de un Envío se resuelve vía su Paquete — reutiliza la lista de paquetes
   *  ya cargada en vez de depender de que el backend siempre popule Envio.paquete acá. */
  clienteDeEnvio(e: Envio): string | null {
    const paquete = this.paquetes.find(p => p.id_paquete === e.id_paquete);
    return paquete?.id_cliente || e.paquete?.id_cliente || null;
  }

  // ---------- Navegación ----------

  verPaquete(p: Paquete) {
    this.router.navigate(['/envios/paquete', p.id_paquete]);
  }

  crearEnvio(p: Paquete) {
    this.router.navigate(['/envios/nuevo', p.id_paquete]);
  }

  verEnvio(e: Envio) {
    this.router.navigate(['/envios', e.id_envio]);
  }

  // ---------- Impresión ----------

  /** Imprime desde "Listos para enviar" — todavía no existe Envio, así que
   *  la dirección queda null (se llenará recién al crear el envío). */
  imprimirPaquete(p: Paquete): void {
    this.paqueteSvc.getById(p.id_paquete).subscribe({
      next: (paquete) => {
        this.datosParaImprimir = {
          numero_orden: paquete.numero_correlativo || paquete.id_paquete,
          id_cliente: paquete.id_cliente,
          fecha: paquete.fecha_registro,
          direccion: null,
          items: paquete.items.map(i => ({
            id_entidad: i.id_entidad, cantidad: i.cantidad, unidad_medida: i.unidad_medida
          })),
        };
      },
      error: () => {
        this.datosParaImprimir = null;
      }
    });
  }

  // ---------- UI helpers ----------

  estadoEnvioClass(estado: string): string {
    switch (estado) {
      case EstadoEnvio.PENDIENTE: return 'bg-yellow-100 text-yellow-700';
      case EstadoEnvio.PROGRAMADO: return 'bg-blue-100 text-blue-700';
      case EstadoEnvio.DESPACHADO: return 'bg-indigo-100 text-indigo-700';
      case EstadoEnvio.EN_TRANSITO: return 'bg-purple-100 text-purple-700';
      case EstadoEnvio.ENTREGADO: return 'bg-green-100 text-green-700';
      case EstadoEnvio.CANCELADO: return 'bg-red-100 text-red-700';
      case EstadoEnvio.DEVUELTO: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  labelEstadoEnvio(estado: string): string {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      PROGRAMADO: 'Programado',
      DESPACHADO: 'Despachado',
      EN_TRANSITO: 'En tránsito',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
      DEVUELTO: 'Devuelto',
    };
    return labels[estado] || estado;
  }
}