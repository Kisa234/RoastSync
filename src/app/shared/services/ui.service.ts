import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AlertType = 'success'|'error'|'warning'|'info';
export interface Alert {
  type: AlertType;
  title: string;
  message: string;
}
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Injectable({ providedIn: 'root' })
export class UiService {
  private _alert$ = new BehaviorSubject<Alert|null>(null);
  alert$: Observable<Alert|null> = this._alert$.asObservable();

  private _confirm$ = new BehaviorSubject<ConfirmOptions|null>(null);
  confirm$: Observable<ConfirmOptions|null> = this._confirm$.asObservable();
  private confirmResolve!: (ok: boolean) => void;

  /** Alertas */
  alert(type: AlertType, title: string, message: string, duration = 4000) {
    this._alert$.next({ type, title, message });
    setTimeout(() => this.clearAlert(), duration);
  }
  clearAlert() {
    this._alert$.next(null);
  }

  /** Confirmación */
  confirm(options: ConfirmOptions): Promise<boolean> {
    this._confirm$.next(options);
    return new Promise(resolve => {
      this.confirmResolve = resolve;
    });
  }
  private closeConfirm() {
    this._confirm$.next(null);
  }
  resolveConfirm() {
    this.confirmResolve(true);
    this.closeConfirm();
  }
  rejectConfirm() {
    this.confirmResolve(false);
    this.closeConfirm();
  }
}
