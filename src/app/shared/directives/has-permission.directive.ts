import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { PermissionAccessService } from '../services/permission-access.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private permissionAccessService: PermissionAccessService
  ) {}

  @Input() set appHasPermission(permission: string | string[]) {
    this.viewContainer.clear();

    const hasAccess = Array.isArray(permission)
      ? this.permissionAccessService.hasAnyPermission(permission)
      : this.permissionAccessService.hasPermission(permission);

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}