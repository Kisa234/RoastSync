import { LoteService } from './../../../features/inventory/service/lote.service';
import { UserService } from './../../../features/users/service/users-service.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, output, ViewChild } from '@angular/core';
import { LucideAngularModule, Download, X, Printer } from 'lucide-angular';
import { FichaTueste } from '../../models/ficha-tueste';
import { LoteTostadoService } from '../../../features/inventory/service/lote-tostado.service';
import { User } from '../../models/user';
import { Lote } from '../../models/lote';

@Component({
  selector: 'ficha-tueste',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './ficha-tueste.component.html',
  styleUrl: './ficha-tueste.component.css'
})
export class FichaTuesteComponent implements OnInit {
  @Input() id: string = '';
  @Output() close = new EventEmitter<void>();
  readonly Download = Download;
  readonly X = X;
  @ViewChild('fichaPrint', { static: false }) fichaPrint!: ElementRef;

  data: FichaTueste = {
    id_lote: '',
    humedad: 0,
    densidad: 0,
    caramelizacion: 0,
    desarrollo: 0,
    temp_desarrollo: 0,
    agtrom: 0,
    tiempo: 0,
    tueste: '',
    id_lote_tostado: '',
    peso_total: 0,
  }

  user: User ={
    id_user: '',
    nombre: '',
    email: '',
    rol: '',
    password: '',
    numero_telefono: 0,
    eliminado: false,
    fecha_registro: new Date()
  }
  lote:Lote={
    id_lote: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: '',
    fecha_registro: new Date(),
    eliminado: false
  }

  constructor(
    readonly loteTostadoSvc: LoteTostadoService,
    readonly userService: UserService,
    readonly loteService: LoteService, 
  ) { }

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loteTostadoSvc.getFichaTueste(this.id).subscribe(loteTostado => {
      this.data = loteTostado;
      this.loteService.getById(loteTostado.id_lote).subscribe(lote => {
        this.lote=lote;
        this.userService.getUserById(lote.id_user!).subscribe(user =>{
          this.user= user; 
        })
      })
    });
  }

  formatTiempoSegundos(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = Math.round(segundos % 60);
    return `${minutos}min ${segundosRestantes}s`;
  }

  OnClose() {
    this.close.emit();
  }

  async downloadModalImage(): Promise<void> {
    const { default: html2canvas } = await import('html2canvas-pro');

    const original = this.fichaPrint?.nativeElement as HTMLElement;
    if (!original) return;

    // 1) Clonar SOLO la ficha y limpiar cosas que no quieres en la imagen
    const clone = original.cloneNode(true) as HTMLElement;

    // Quita íconos/botones del clone
    clone.querySelectorAll('lucide-angular, button, .print-hidden').forEach(el => el.remove());

    // Forzar estilos "planos" para evitar sombras/velos
    clone.style.boxSizing = 'border-box';
    clone.style.width = `${original.offsetWidth}px`;
    clone.style.background = '#ffffff';
    clone.style.boxShadow = 'none';
    // Si quieres mantener bordes redondeados, comenta la siguiente línea
    clone.style.borderRadius = '0';

    // 2) Montar el clone en un contenedor oculto, con fondo blanco
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '-10000px',
      background: '#ffffff',
      padding: '0',
      margin: '0',
      zIndex: '-1',
    } as CSSStyleDeclaration);
    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // 3) Renderizar a canvas en alta resolución
      const scale = Math.max(2, Math.min(3, window.devicePixelRatio || 2)); // 2x–3x
      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff', // blanco real
        useCORS: true,              // para el logo
        scale,                      // nitidez
        scrollX: 0,
        scrollY: 0,
        width: original.scrollWidth || original.offsetWidth,
        height: original.scrollHeight || original.offsetHeight,
        logging: false
      });

      // 4) Descargar PNG
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ficha-${this.data?.id_lote_tostado || this.data?.id_lote || 'tueste'}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Error al exportar PNG:', err);
    } finally {
      // 5) Limpiar
      if (document.body.contains(container)) document.body.removeChild(container);
    }
  }

}

