import { Component, OnInit } from '@angular/core';
import { BoxTemplate } from '../../../shared/models/box-template';
import { BoxTemplateService } from '../service/box-template.service';
import { BoxRespuestaService } from '../service/box-respuesta.service';
import { CommonModule } from '@angular/common';
import { Eye, LucideAngularModule, Package, PackagePlus, Pencil, Plus, Trash2 } from 'lucide-angular';
import { AddFormComponent } from '../components/add-form/add-form.component';
import { BoxOpcionService } from '../service/box-opcion.service';
import { UiService } from '../../../shared/services/ui.service';
import { EditFormComponent } from '../components/edit-form/edit-form.component';
import { ActiveTemplateComponent } from '../components/active-template/active-template.component';
import { RenovateSubscriptionComponent } from '../components/renovate-subscription/renovate-subscription.component';
import { UserService } from '../../users/service/users-service.service';
import { UserNamePipe } from "../../../shared/pipes/user-name-pipe.pipe";
import { BoxRespuestasComponent } from "../components/box-respuestas/box-respuestas.component";


@Component({
  selector: 'suscription-page',
  templateUrl: './suscription-page.component.html',
  imports: [
    CommonModule,
    LucideAngularModule,
    AddFormComponent,
    EditFormComponent,
    ActiveTemplateComponent,
    RenovateSubscriptionComponent,
    UserNamePipe,
    BoxRespuestasComponent
]
})
export class SuscriptionPageComponent implements OnInit {

  // ===================== DATA =====================

  templates: BoxTemplate[] = [];
  usersWithBoxes: any[] = [];

  loadingTemplates = false;
  loadingUsers = false;

  // ===================== UI STATES =====================

  tab: 'templates' | 'usuarios' = 'templates';

  showTemplateForm = false;
  showAssignUser = false;
  showAddForm = false;
  showActiveTemplate = false;
  showRenovateModal = false;
  showRespuestasBox = false;

  selectedTemplate: BoxTemplate | null = null;
  selectedUser: any = null;

  // ===================== ICONS (Lucide) =====================
  readonly Plus = Plus;
  readonly Package = Package;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly Eye = Eye;
  readonly PackagePlus = PackagePlus;

  constructor(
    private templateService: BoxTemplateService,
    private respuestaService: BoxRespuestaService,
    private opcionService: BoxOpcionService,
    private uiService: UiService,
    private userService: UserService
  ) { }

  // ===================== INIT =====================

  ngOnInit(): void {
    this.loadTemplates();
    this.loadUsers();
  }

  // ===================== LOADERS =====================

  loadTemplates() {
    this.loadingTemplates = true;

    this.templateService.getAll().subscribe({
      next: (res) => {
        this.templates = res;

        // Cargar opciones por template
        this.templates.forEach(t => {
          this.opcionService.getByTemplate(t.id_box_template).subscribe((opciones: any[] = []) => {
            (t as any).opciones = opciones || [];
          });
        });

        this.loadingTemplates = false;
      },
      error: () => {
        this.loadingTemplates = false;
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.usersWithBoxes = res.filter(user => user.suscripcion === true);
      },
      error: () => { }
    });
  }

  // Agrupa respuestas por usuario
  groupByUser(respuestas: any[]) {
    const map = new Map();

    respuestas.forEach(r => {
      if (!map.has(r.id_user)) {
        map.set(r.id_user, {
          id_user: r.id_user,
          count: 0,
          lastDate: r.fecha_registro
        });
      }

      const entry = map.get(r.id_user);
      entry.count++;

      if (new Date(r.fecha_registro) > new Date(entry.lastDate)) {
        entry.lastDate = r.fecha_registro;
      }
    });

    return Array.from(map.values());
  }

  // ===================== TEMPLATE FORM =====================

  openRespuestasBox(template: BoxTemplate) {
    this.selectedTemplate = template;
    this.showRespuestasBox = true;
  }

  openCreateTemplate() {
    this.selectedTemplate = null;
    this.showAddForm = true;
  }

  openEditTemplate(template: BoxTemplate) {
    this.selectedTemplate = template;
    this.showTemplateForm = true;
  }

  openDeleteTemplate(template: BoxTemplate) {
    this.uiService.confirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el template "${template.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).then(confirmed => {
      if (confirmed) {
        this.templateService.delete(template.id_box_template).subscribe({
          next: () => {
            this.uiService.alert('success', 'Eliminado', `El template "${template.nombre}" ha sido eliminado.`);
            this.loadTemplates();
          }
        });
      }
    });
  }

  closeAddForm() {
    this.showAddForm = false;
    this.selectedTemplate = null;
    this.loadTemplates();
  }

  onTemplateCreated(template: any) {
    this.loadTemplates();      // recargar lista
    this.showAddForm = false;  // cerrar modal
    this.selectedTemplate = null;
  }


  // ===================== ASSIGN USER =====================

  openAssignBox() {
    this.selectedUser = null;
    this.showAssignUser = true;
  }

  openAssignBoxToUser(user: any) {
    this.selectedUser = user;
    this.showAssignUser = true;
  }

  openUserHistory(user: any) {
    console.log("Historial -> falta crear modal", user);
  }

  closeAssignUser() {
    this.showAssignUser = false;
    this.selectedUser = null;
    this.loadUsers();
  }

  // ===================== ACTIVE TEMPLATE =====================

  openActiveTemplate() {
    this.showActiveTemplate = true;
  }

  closeActiveTemplate() {
    this.showActiveTemplate = false;
    this.loadTemplates(); // refrescar estado activo
  }

  // ===================== RENOVATE SUBSCRIPTION =====================
  openRenovateModal() {
    this.showRenovateModal = true;
  }

  closeRenovateModal() {
    this.showRenovateModal = false;
  }

  onSavedRenovation() {
    this.loadUsers();
    this.showRenovateModal = false;
  }

}
