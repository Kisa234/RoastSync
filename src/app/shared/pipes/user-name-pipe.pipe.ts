import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../../features/users/service/users-service.service';
import { User } from '../models/user';

@Pipe({
  name: 'userName',
  pure: false
})
export class UserNamePipe implements PipeTransform {
  private userCache = new Map<string, User | null>();

  constructor(private userSvc: UserService) {}

  transform(id: string): string {
    if (!id) {
      return '';
    }

    // Si aún no hemos intentado cargar este ID, lo iniciamos
    if (!this.userCache.has(id)) {
      // Marcamos como “cargando”
      this.userCache.set(id, null);
      this.userSvc.getUserById(id).subscribe(u => {
        this.userCache.set(id, u);
      });
      // Devolvemos el ID (o cadena vacía) mientras llega la respuesta
      return id;
    }

    const user = this.userCache.get(id)!;
    // Si sigue siendo null significa que aún no llegó la respuesta
    if (!user) {
      return id;
    }

    // Ya tenemos el user, capitalizamos su nombre
    return this.capitalizeWords(user.nombre_comercial? user.nombre_comercial : user.nombre );
  }

  private capitalizeWords(sentence: string): string {
    if (!sentence) {
      return '';
    }
    return sentence
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}
