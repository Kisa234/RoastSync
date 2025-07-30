import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../../features/users/service/users-service.service';
import { User } from '../models/user';

@Pipe({
  name: 'userName',
  pure: false
})
export class UserNamePipe implements PipeTransform {
  private user: User | null = null;

  constructor(private userSvc: UserService) {}

  transform(id: string): string | null {
    if (!this.user) {
      this.userSvc.getUserById(id)
        .subscribe(u => this.user = u);
    }
    return this.user?.nombre ?? null;
  }
}

