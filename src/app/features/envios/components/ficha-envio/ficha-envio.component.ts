import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check, Printer } from 'lucide-angular';
import { CreateFichaEnvio, FichaEnvio } from '../../../../shared/models/fichaEnvio';
import { FichaEnvioService } from '../../service/fichaEnvios.service';
import { EnviosService } from '../../service/envios.service';
import { UserService } from '../../../users/service/users-service.service';
import { User } from '../../../../shared/models/user';

@Component({
  selector: 'ficha-envio',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './ficha-envio.component.html'
})
export class FichaEnvioComponent implements OnChanges {
  readonly X = X;
  readonly Check = Check;
  readonly Printer = Printer;

  @Input() id!: string;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<FichaEnvio>();
  @ViewChild('preview', { static: false }) previewRef!: ElementRef<HTMLDivElement>;

  loading = false;
  saving = false;
  hasFicha = false;

  bgW = 360;
  bgH = 220;

  // formulario
  model: CreateFichaEnvio = {
    nombre: '',
    celular: '',
    direccion: '',
    distrito: '',
    dni: '',
    referencia: ''
  };

  ficha?: FichaEnvio;

  constructor(
    private fichaSvc: FichaEnvioService,
    private enviosSvc: EnviosService,
    private userSvc: UserService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']?.currentValue) {
      this.load();
    }
  }

  private load() {
    if (!this.id) return;
    this.loading = true;
    this.fichaSvc.getFichaByEnvio(this.id).subscribe({
      next: (f) => {
        this.ficha = f;
        this.hasFicha = true;
        this.model = {
          nombre: f.nombre,
          celular: f.celular,
          direccion: f.direccion,
          distrito: f.distrito,
          dni: f.dni ?? '',
          referencia: f.referencia ?? ''
        };
        this.loading = false;
      },
      error: () => {
        // No existe ficha: intentamos pre-rellenar desde el cliente del envío (si se puede)
        this.hasFicha = false;
        this.loading = false;

        this.enviosSvc.getEnvioById(this.id).subscribe(env => {
          const idCliente = (env as any)?.id_cliente;
          if (idCliente) {
            this.userSvc.getUserById(idCliente).subscribe((u: User) => {
              // Prefills suaves si existen esos campos en tu User
              this.model.nombre = u.nombre_comercial || u.nombre || this.model.nombre;
              // @ts-ignore: dependerá del shape real de User
              this.model.celular = u.numero_telefono || this.model.celular;
              // @ts-ignore
              this.model.direccion = this.model.direccion;
              // @ts-ignore
              this.model.distrito = this.model.distrito;
              // @ts-ignore
              this.model.dni = this.model.dni;
              // referencia queda vacía
            });
          }
        });
      }
    });
  }

  getAssetUrl(nombre: string): string {
    return `/assets/img/${nombre}`;
  }

  onBgLoad(img: HTMLImageElement) {
    const natW = img.naturalWidth || 360;
    const natH = img.naturalHeight || 220;

    const targetW = 360;
    const scale = targetW / natW;
    this.bgW = Math.round(targetW);
    this.bgH = Math.round(natH * scale);
  }

  canSave(): boolean {
    const m = this.model;
    return !!(m.nombre && m.celular && m.direccion && m.distrito);
  }

  save() {
    if (!this.canSave() || !this.id) return;
    this.saving = true;

    const payload: CreateFichaEnvio = {
      nombre: this.model.nombre,
      celular: this.model.celular,
      direccion: this.model.direccion,
      distrito: this.model.distrito,
      dni: this.model.dni || undefined,
      referencia: this.model.referencia || undefined
    };

    const req$ = this.hasFicha
      ? this.fichaSvc.updateFichaByEnvio(this.id, payload)
      : this.fichaSvc.createFichaEnvio(this.id, payload);

    req$.subscribe({
      next: (f) => {
        this.saving = false;
        this.ficha = f;
        this.hasFicha = true;
        this.saved.emit(f);
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  onPrint() {
    window.print();
  }

  onCancel() {
    this.close.emit();
  }

  async downloadPreviewPNG(): Promise<void> {
    const { default: html2canvas } = await import('html2canvas-pro');

    const original = this.previewRef?.nativeElement;
    if (!original) return;

    // 1) Clonar SOLO la vista previa
    const clone = original.cloneNode(true) as HTMLElement;

    // Limpiar elementos que no deben aparecer
    clone.querySelectorAll('.print-hidden, button, lucide-angular').forEach(el => el.remove());

    // 2) Forzar dimensiones/estilos del clone para evitar recortes
    const rect = original.getBoundingClientRect();
    clone.style.boxSizing = 'border-box';
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.backgroundColor = '#ffffff';
    clone.style.boxShadow = 'none';
    clone.style.borderRadius = getComputedStyle(original).borderRadius;

    // 3) Montar en un contenedor oculto
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
      // 4) Renderizar a canvas en alta resolución (2x–3x)
      const scale = Math.max(2, Math.min(3, window.devicePixelRatio || 2));

      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff', // evita transparencia
        useCORS: true,              // para assets
        scale,                      // nitidez
        width: rect.width,
        height: rect.height,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });

      // 5) Descargar PNG
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ficha-envio.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Error al exportar PNG:', err);
    } finally {
      // 6) Limpiar
      if (document.body.contains(container)) document.body.removeChild(container);
    }
  }
}
