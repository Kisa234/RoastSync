import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../../features/users/service/users-service.service';
import { User } from '../models/user';

@Pipe({
  name: 'userName',
  pure: false
})
export class UserNamePipe implements PipeTransform {
  private user: User | null = null;

  constructor(private userSvc: UserService) { }

  transform(id: string): string | null {
    if (!this.user) {
      this.userSvc.getUserById(id)
        .subscribe(u => this.user = u);
    }
    return this.capitalizeWords(this.user?.nombre!) ?? null;
  }

  capitalizeWords(sentence: string): string {
    const words = sentence.split(' ');
    const capitalizedWords = words.map(word => {
      if (word.length === 0) {
        return ''; 
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return capitalizedWords.join(' ');
  }

}

