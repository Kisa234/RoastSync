import { Component, OnInit } from '@angular/core';
import { BoxRespuesta } from '../../../shared/models/box-respuesta';
import { BoxOpcionService } from '../../suscriptions/service/box-opcion.service';
import { BoxRespuestaService } from '../../suscriptions/service/box-respuesta.service';
import { BoxTemplateService } from '../../suscriptions/service/box-template.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoteService } from '../../inventory/service/lote.service';
import { Lote } from '../../../shared/models/lote';
import { AnalisisService } from '../../analysis/service/analisis.service';
import { AnalisisSensorialService } from './../../analysis/service/analisis-sensorial.service';
import { AnalisisSensorial } from '../../../shared/models/analisis-sensorial';
import { Analisis } from '../../../shared/models/analisis';
import { UserService } from '../../users/service/users-service.service';
import { AuthService } from '../../auth/service/auth.service';
import { User } from '../../../shared/models/user';
import { ReplacePipe } from '../../../shared/pipes/replace.pipe';
import { SpiderGraphComponent } from '../../inventory/components/spider-graph/spider-graph.component';
import { MultiPieChartComponent } from '../../../shared/components/multi-pie-chart/multi-pie-chart.component';
import { forkJoin } from 'rxjs';
import { UiService } from '../../../shared/services/ui.service';

@Component({
  selector: 'app-client-form',
  imports: [FormsModule, CommonModule, ReplacePipe, SpiderGraphComponent, MultiPieChartComponent],
  templateUrl: './client-form.component.html',
  styles: ``
})
export class ClientFormComponent implements OnInit {

  template: any;
  selectedOption: any = null;

  stepVisual = 0; // controla pantallas
  stepCafe = 0;   // controla steps[] (fijo1, fijo2, libre)

  lotesLoaded = false;

  MOLIENDA_MAP: Record<string, string> = {
    "Fina": "MOLIENDA_FINA",
    "Media": "MOLIENDA_MEDIA",
    "Gruesa": "MOLIENDA_GRUESA",
    "Grano Entero": "ENTERO",
    "Ninguno": "NINGUNO"
  };


  Moliendas: string[] = ['Grano Entero', 'Fina', 'Media', 'Gruesa'];

  steps = [
    {
      titulo: "Café Fijo 1",
      lote: null as Lote | null,
      moliendaField: "molienda_1",
      tuesteField: "tueste_1",
      tuestes: [] as string[],
      notas: [] as string[]
    },
    {
      titulo: "Café Fijo 2",
      lote: null as Lote | null,
      moliendaField: "molienda_2",
      tuesteField: "tueste_2",
      tuestes: [] as string[],
      notas: [] as string[]
    },
    {
      titulo: "Elige tu tercer café",
      lote: null as Lote | null,
      moliendaField: "molienda_3",
      tuesteField: "tueste_3",
      tuestes: [] as string[],
      notas: [] as string[],
      esLibre: true
    }
  ];


  boxRespuesta: BoxRespuesta & { [key: string]: any } = {
    id_respuesta: '',
    id_box_template: '',
    id_user: '',
    molienda_1: '',
    molienda_2: '',
    molienda_3: '',
    tueste_1: '',
    tueste_2: '',
    tueste_3: '',
    id_cafe_elegido: '',
    fecha_registro: new Date()
  };

  analisisSensorial: AnalisisSensorial = {
    id_analisis_sensorial: '',
    fragancia_aroma: 0,
    sabor: 0,
    sabor_residual: 0,
    acidez: 0,
    cuerpo: 0,
    uniformidad: 0,
    balance: 0,
    taza_limpia: 0,
    dulzor: 0,
    puntaje_catador: 0,
    taza_defecto_ligero: 0,
    tazas_defecto_rechazo: 0,
    puntaje_taza: 0,
    comentario: '',
    fecha_registro: new Date(),
  };

  parsedNotas = { notas: [] as string[] };

  sessioninfo = { id: '', email: '', rol: '' };

  user: User = {
    id_user: '',
    nombre: '',
    email: '',
    numero_telefono: 0,
    rol: '',
    password: '',
    eliminado: false,
    fecha_registro: new Date()
  }

  constructor(
    private readonly boxOpcionService: BoxOpcionService,
    private readonly boxRespuestaService: BoxRespuestaService,
    private readonly boxTemplateService: BoxTemplateService,
    private readonly loteService: LoteService,
    private readonly analisisService: AnalisisService,
    private readonly analisisSensorialService: AnalisisSensorialService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly uiService: UiService
  ) { }

  ngOnInit() {

    this.authService.checkSession().subscribe({
      next: info => {
        this.sessioninfo = info;

        // 🔥 1. Verificar si ya tiene box este mes
        this.boxRespuestaService.getByUser(info.id).subscribe({
          next: (respuestas) => {

            const hoy = new Date();
            const mesActual = hoy.getMonth();
            const anioActual = hoy.getFullYear();

            const yaRespondiste = respuestas.some(r => {
              const fecha = new Date(r.fecha_registro);
              return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
            });

            if (yaRespondiste) {
              console.log("El usuario ya tiene un box este mes");
              this.stepVisual = 6;   // 🔥 mostrar pantalla de box ya enviado
              return;                // ❗ NO CONTINUAR CARGANDO WIZARD
            }

            // Si no respondió → cargar usuario y template normal
            this.cargarUsuario(info.id);
            this.cargarTemplate();
          }
        });
      }
    });

  }

  logout() {
    this.uiService.confirm({
      title: 'Salir de la sesión',
      message: `¿Estás seguro de que deseas salir de tu sesión?`,
      confirmText: 'Sí',
      cancelText: 'No'
    }).then(confirmed => {
      if (confirmed) {
        this.authService.logout()
      }
    });
  }


  cargarUsuario(id: string) {
    this.userService.getUserById(id).subscribe({
      next: user => {
        this.user = user;
        this.boxRespuesta.id_user = user.id_user;
      }
    });
  }

  cargarTemplate() {
    this.boxTemplateService.getActiveTemplate().subscribe({
      next: (res: any) => {
        this.template = res;
        this.boxRespuesta.id_box_template = res.id_box_template;

        const fijo1 = res.cafe_fijo_1 || res.lote_fijo_1;
        const fijo2 = res.cafe_fijo_2 || res.lote_fijo_2;

        forkJoin([
          this.loteService.getById(fijo1),
          this.loteService.getById(fijo2)
        ]).subscribe(([l1, l2]) => {

          this.steps[0].lote = l1;
          this.steps[1].lote = l2;
          this.steps[0].tuestes = res.tueste_fijo_1 ?? [];
          this.steps[1].tuestes = res.tueste_fijo_2 ?? [];

          this.lotesLoaded = true;
          this.loadAnalysisForCurrentStep();
        });

        this.loadOpciones(res.id_box_template);
      }
    });
  }


  setMolienda(m: string) {
    const field = this.steps[this.stepCafe].moliendaField;
    this.boxRespuesta[field] = this.MOLIENDA_MAP[m];
  }

  editarCafe(indice: number) {
    this.stepCafe = indice;

    if (indice === 0) this.stepVisual = 1;
    if (indice === 1) this.stepVisual = 2;
    if (indice === 2) this.stepVisual = 4;

    this.loadAnalysisForCurrentStep();
  }


  loadOpciones(idBoxTemplate: string) {
    this.boxOpcionService.getByTemplate(idBoxTemplate).subscribe({
      next: opciones => {

        opciones.forEach(op => {
          if (!op.id_cafe) return;

          this.loteService.getById(op.id_cafe.trim()).subscribe(lote => {
            op.lote = lote;

            // ============================
            // 🔥 CARGAR NOTAS SENSORIALES
            // ============================
            this.analisisService.getAnalisisByLoteId(lote.id_lote).subscribe({
              next: (analisis: Analisis) => {
                if (!analisis?.analisisSensorial_id) {
                  op.notas = [];
                  return;
                }

                this.analisisSensorialService.getAnalisisById(analisis.analisisSensorial_id)
                  .subscribe({
                    next: (analisisSensorial) => {
                      try {
                        const parsed = JSON.parse(analisisSensorial.comentario || "{}");
                        op.notas = parsed.notas ?? [];
                      } catch {
                        op.notas = [];
                      }
                    }
                  });
              }
            });
          });
        });

        this.template.opciones = opciones;
      }
    });
  }


  selectOption(op: any) {
    this.selectedOption = op;

    this.steps[2].lote = op.lote;
    this.steps[2].tuestes = op.tuestes ?? [];

    this.boxRespuesta.id_cafe_elegido = op.lote.id_lote;
    this.boxRespuesta.tueste_3 = '';
    this.boxRespuesta.molienda_3 = '';

    this.stepCafe = 2;
    this.stepVisual = 4;

    this.getanalisisSensorial(op.lote.id_lote);
  }

  loadAnalysisForCurrentStep() {
    const lote = this.steps[this.stepCafe]?.lote;
    if (lote?.id_lote) {
      this.getanalisisSensorial(lote.id_lote);
    }
  }

  getanalisisSensorial(idLote: string) {
    this.analisisService.getAnalisisByLoteId(idLote).subscribe({
      next: (analisis: Analisis) => {
        if (!analisis?.analisisSensorial_id) return;

        this.analisisSensorialService.getAnalisisById(analisis.analisisSensorial_id)
          .subscribe({
            next: (analisisSensorial) => {

              this.analisisSensorial = analisisSensorial;

              let notas = [];

              try {
                const parsed = JSON.parse(analisisSensorial.comentario || "{}");
                notas = parsed.notas ?? [];
              } catch {
                notas = [];
              }

              // 🔥 GUARDAR LAS NOTAS EN SU STEP CORRECTO
              this.steps[this.stepCafe].notas = notas;
            }
          });
      }
    });
  }


  nextStep() {
    this.stepVisual++;

    if (this.stepVisual === 1) this.stepCafe = 0;
    if (this.stepVisual === 2) this.stepCafe = 1;
    if (this.stepVisual === 4) this.stepCafe = 2;

    this.loadAnalysisForCurrentStep();
  }

  prevStep() {
    this.stepVisual--;

    if (this.stepVisual === 1) this.stepCafe = 0;
    if (this.stepVisual === 2) this.stepCafe = 1;
    if (this.stepVisual === 4) this.stepCafe = 2;

    this.loadAnalysisForCurrentStep();
  }

  submit() {
    console.log('Guardando respuesta del box:', this.boxRespuesta);
    this.boxRespuestaService.create(this.boxRespuesta).subscribe({
      next: res => {
        this.stepVisual = 6;
      },
      error: err => {
        console.error('Error al guardar la respuesta:', err);
      }
    });
  }
}
