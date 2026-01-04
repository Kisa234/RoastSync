import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AlertType = 'success' | 'error' | 'warning' | 'info';
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
export interface PromptOptions {
  title: string;
  message: string;
  placeholder?: string;
  confirmText: string;
  cancelText: string;
}


@Injectable({ providedIn: 'root' })
export class UiService {
  private _alert$ = new BehaviorSubject<Alert | null>(null);
  alert$: Observable<Alert | null> = this._alert$.asObservable();

  private _confirm$ = new BehaviorSubject<ConfirmOptions | null>(null);
  confirm$: Observable<ConfirmOptions | null> = this._confirm$.asObservable();
  private confirmResolve!: (ok: boolean) => void;

  private _prompt$ = new BehaviorSubject<PromptOptions | null>(null);
  prompt$: Observable<PromptOptions | null> = this._prompt$.asObservable();

  private promptResolve!: (result: { confirmed: boolean; value?: string }) => void;


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

  //prompt
  prompt(options: PromptOptions): Promise<{ confirmed: boolean; value?: string }> {
    this._prompt$.next(options);
    return new Promise(resolve => {
      this.promptResolve = resolve;
    });
  }

  resolvePrompt(value?: string) {
    this.promptResolve({ confirmed: true, value });
    this._prompt$.next(null);
  }

  rejectPrompt() {
    this.promptResolve({ confirmed: false });
    this._prompt$.next(null);
  }

}
