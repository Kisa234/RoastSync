import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../features/users/service/users-service.service';

@Pipe({
  name: 'UserNamePipe',
  standalone: true,
  pure: true
})
export class UserNamePipe implements PipeTransform {
  constructor(private userSvc: UserService) {}

  transform(id: string | null | undefined): Observable<string> {
    if (!id) return of('');

    return this.userSvc.getUserById(id).pipe(
      map(user => {
        const nombre = user?.nombre_comercial || user?.nombre || id;
        return this.capitalizeWords(nombre);
      })
    );
  }

  private capitalizeWords(sentence: string): string {
    if (!sentence) return '';
    return sentence
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}