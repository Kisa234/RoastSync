import { UiService } from './../../../shared/services/ui.service';
// src/app/features/users/page/users-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Search, Mail, Phone, Edit2, Trash2, UserPlus } from 'lucide-angular';
import { map, Observable } from 'rxjs';
import { User } from '../../../shared/models/user';
import { UserService } from '../service/users-service.service';
import { AddClientComponent } from '../components/add-client/add-client.component';
import { EditClientComponent } from "../components/edit-client/edit-client.component";

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    AsyncPipe,
    LucideAngularModule,
    AddClientComponent,
    EditClientComponent
  ],
  templateUrl: './users-page.component.html',
  styles: []
})

export class UsersPageComponent implements OnInit {

  constructor(
    private userSvc: UserService,
    private uiService: UiService
  ) { }
  // iconos
  readonly Search = Search;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly UserPlus = UserPlus;

  ngOnInit() {
    this.loadUsers();
  }

  users$!: Observable<User[]>;
  filterText = '';
  roleOptions = [
    { label: 'Todos los roles', value: '' },
    { label: 'Cliente', value: 'cliente' },
    { label: 'Administrador', value: 'admin' }
  ];
  selectedRole = '';

  showAddClient = false;
  showEditClient = false;
  selectedUserId?: string;

  loadUsers() {
    const source$ = this.selectedRole
      ? this.userSvc.getUsersByRole(this.selectedRole)
      : this.userSvc.getUsers();

    this.users$ = source$.pipe(
      map(users => {
        const term = this.filterText.trim().toLowerCase();
        return users.filter(u =>
          !term ||
          u.nombre.toLowerCase().includes(term) 
        );
      })
    );
  }
  openAddClient() {
    this.showAddClient = true;
  }

  onClientCreated(newUser: User) {
    this.showAddClient = false;
    // aquí refrescas la lista, p.ej.
    this.users$ = this.userSvc.getUsers();
  }

  onSearchChange() {
    this.loadUsers();
  }

  onRoleChange() {
    this.loadUsers();
  }

  onEdit(u: User) {
    this.showEditClient = true;
    this.selectedUserId = u.id_user;
    this.users$ = this.userSvc.getUsers();

  }
  onDelete(u: User) {
    this.uiService.confirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al usuario ${u.nombre}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).then((confirmed: boolean) => {
      if (confirmed) {
        this.userSvc.deleteUser(u.id_user).subscribe(() => {
          this.loadUsers();
        });
      }
    });
  }
}
