import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Search, Mail, Phone, Edit2, Trash2, UserPlus } from 'lucide-angular';
import { map, Observable } from 'rxjs';

import { User } from '../../../../shared/models/user';
import { UserService } from '../../service/users-service.service';
import { UiService } from '../../../../shared/services/ui.service';
import { AddClientComponent } from '../../components/add-client/add-client.component';
import { EditClientComponent } from '../../components/edit-client/edit-client.component';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AsyncPipe,
    LucideAngularModule,
    AddClientComponent,
    EditClientComponent
  ],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {

  // icons
  readonly Search = Search;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly UserPlus = UserPlus;

  users$!: Observable<User[]>;
  filterText = '';

  showAddClient = false;
  showEditClient = false;
  selectedUserId?: string;

  constructor(
    private userSvc: UserService,
    private ui: UiService
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.users$ = this.userSvc
      .getUsersByRole('cliente')
      .pipe(
        map(users =>
          users.filter(u =>
            u.nombre.toLowerCase().includes(this.filterText.toLowerCase())
          )
        )
      );
  }

  onSearchChange() {
    this.loadClients();
  }

  openAddClient() {
    this.showAddClient = true;
  }

  onClientCreated() {
    this.showAddClient = false;
    this.loadClients();
  }

  onEdit(u: User) {
    this.selectedUserId = u.id_user;
    this.showEditClient = true;
  }

  onDelete(u: User) {
    this.ui.confirm({
      title: 'Confirmar eliminación',
      message: `¿Eliminar al cliente ${u.nombre}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).then(ok => {
      if (ok) {
        this.userSvc.deleteUser(u.id_user).subscribe(() => {
          this.loadClients();
        });
      }
    });
  }
}
