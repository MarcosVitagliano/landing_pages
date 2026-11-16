import { Injectable, signal } from '@angular/core';

/** Estado compartilhado do chat: qualquer componente (ex.: botão do hero) pode abri-lo. */
@Injectable({ providedIn: 'root' })
export class ChatStateService {
  readonly aberto = signal(false);

  abrir(): void {
    this.aberto.set(true);
  }

  fechar(): void {
    this.aberto.set(false);
  }

  alternar(): void {
    this.aberto.update((v) => !v);
  }
}
