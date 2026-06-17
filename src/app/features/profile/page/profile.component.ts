import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Pencil, Save, KeyRound } from 'lucide-angular';

import { AuthService } from '../../auth/service/auth.service';
import { UserService } from '../../users/service/users-service.service';
import { UiService } from '../../../shared/services/ui.service';
import { User as UserModel } from '../../../shared/models/user';
import { ChangePasswordModalComponent } from '../components/change-password/change-password-modal.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, NgIf, NgClass, LucideAngularModule, ChangePasswordModalComponent],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    readonly Pencil = Pencil;
    readonly Save = Save;
    readonly KeyRound = KeyRound;

    readonly documentoTipos = ['DNI', 'RUC', 'Carnet de Extranjería', 'Pasaporte'];

    loading = true;
    savingProfile = false;
    editMode = false;
    showPasswordModal = false;

    currentUserId = '';
    user: Partial<UserModel> = {};
    private snapshot = this.emptyProfile();

    profile = this.emptyProfile();

    constructor(
        private authSvc: AuthService,
        private userSvc: UserService,
        private uiSvc: UiService
    ) { }

    ngOnInit(): void {
        this.loadUser();
    }

    private emptyProfile() {
        return {
            nombre: '',
            email: '',
            documento_tipo: '',
            documento_identidad: '',
            fecha_nacimiento: '', // string 'yyyy-MM-dd' para el input date
            departamento: '',
            direccion: '',
            numero_telefono: 0
        };
    }

    get initials(): string {
        const name = this.profile.nombre?.trim();
        if (!name) return '?';
        const parts = name.split(' ').filter(Boolean);
        const first = parts[0]?.[0] ?? '';
        const second = parts[1]?.[0] ?? '';
        return (first + second).toUpperCase();
    }

    private toDateInputValue(date?: Date | string | null): string {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().slice(0, 10);
    }

    private loadUser(): void {
        this.loading = true;
        this.authSvc.checkSession().subscribe({
            next: (session) => {
                this.currentUserId = session.id_user;
                this.userSvc.getUserById(session.id_user).subscribe({
                    next: (user) => {
                        this.user = user;
                        this.profile = {
                            nombre: user.nombre ?? '',
                            email: user.email ?? '',
                            documento_tipo: user.documento_tipo ?? '',
                            documento_identidad: user.documento_identidad ?? '',
                            fecha_nacimiento: this.toDateInputValue(user.fecha_nacimiento),
                            departamento: user.departamento ?? '',
                            direccion: user.direccion ?? '',
                            numero_telefono: user.numero_telefono ?? 0
                        };
                        this.snapshot = { ...this.profile };
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                        this.uiSvc.alert('error', 'Error', 'No se pudo cargar tu información');
                    }
                });
            },
            error: () => {
                this.loading = false;
                this.uiSvc.alert('error', 'Error', 'No se pudo verificar la sesión');
            }
        });
    }

    enableEdit(): void {
        this.snapshot = { ...this.profile };
        this.editMode = true;
    }

    cancelEdit(): void {
        this.profile = { ...this.snapshot };
        this.editMode = false;
    }

    saveProfile(): void {
        if (!this.currentUserId) return;

        if (!this.profile.nombre?.trim()) {
            this.uiSvc.alert('warning', 'Atención', 'El nombre es requerido');
            return;
        }

        if (!this.profile.email?.trim()) {
            this.uiSvc.alert('warning', 'Atención', 'El email es requerido');
            return;
        }

        this.savingProfile = true;

        const payload = {
            ...this.profile,
            numero_telefono: String(this.profile.numero_telefono ?? ''),
            fecha_nacimiento: this.profile.fecha_nacimiento
                ? new Date(this.profile.fecha_nacimiento)
                : undefined
        };

        this.userSvc.updateUser(this.currentUserId, payload as any).subscribe({
            next: (updated) => {
                this.savingProfile = false;
                this.user = updated;
                this.snapshot = { ...this.profile };
                this.editMode = false;
                this.uiSvc.alert('success', 'Éxito', 'Tu información fue actualizada');
            },
            error: (err) => {
                this.savingProfile = false;
                this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo actualizar tu información');
            }
        });
    }
}