import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, UserCog } from 'lucide-angular';
import { Search, Mail, Phone, Edit2, Trash2, UserPlus } from 'lucide-angular';
import { map, Observable } from 'rxjs';

import { User } from '../../../../shared/models/user';
import { UserService } from '../../service/users-service.service';
import { UiService } from '../../../../shared/services/ui.service';
import { AddClientComponent } from '../../components/add-client/add-client.component';
import { EditClientComponent } from '../../components/edit-client/edit-client.component';
import { ConfigRoleComponent } from "../../../roles/components/config-role/config-role.component";

@Component({
  selector: 'app-interns-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AsyncPipe,
    LucideAngularModule,
    ConfigRoleComponent
  ],
  templateUrl: './interns.component.html'
})
export class InternsComponent implements OnInit {

  readonly Search = Search;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly UserCog = UserCog;

  users$!: Observable<User[]>;
  filterText = '';

  showConfigRoleModal = false;



  constructor(
    private userSvc: UserService,
    private ui: UiService
  ) { }

  ngOnInit() {
    this.loadInterns();
  }

  loadInterns() {
    this.users$ = this.userSvc
      .getUsersByRole('admin')
      .pipe(
        map(users =>
          users.filter(u =>
            u.nombre.toLowerCase().includes(this.filterText.toLowerCase())
          )
        )
      );
  }

  onSearchChange() {
    this.loadInterns();
  }

  onDelete(u: User) {
    this.ui.confirm({
      title: 'Eliminar interno',
      message: `¿Eliminar a ${u.nombre}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).then(ok => {
      if (ok) {
        this.userSvc.deleteUser(u.id_user).subscribe(() => {
          this.loadInterns();
        });
      }
    });
  }   


  openConfigRole() {
    this.showConfigRoleModal = true;
  }

  onConfigRoleClose(saved: boolean) {
    this.showConfigRoleModal = false;

    if (saved) {
      this.reloadUsers(); // refresca la page
    }
  }

  reloadUsers() {
    // tu lógica actual para recargar usuarios
    console.log('Reload users');
  }
}

