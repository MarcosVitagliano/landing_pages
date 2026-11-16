import { Component, input, signal } from '@angular/core';

/**
 * Mostra a foto, ou um espaço reservado elegante enquanto a foto real não existe.
 * Exemplo de uso: <app-foto src="img/recepcao.jpg" alt="Recepção" rotulo="Recepção" />
 */
@Component({
  selector: 'app-foto',
  host: { class: 'block overflow-hidden' },
  template: `
    @if (src() && falhou() !== src()) {
      <img [src]="src()" [alt]="alt()" loading="lazy" class="w-full h-full object-cover" [style.object-position]="posicao()" (error)="falhou.set(src())" />
    } @else {
      <div role="img" [attr.aria-label]="alt()"
           class="w-full h-full flex flex-col items-center justify-center gap-2 text-wine/60 bg-linear-to-br from-sand to-brand-soft">
        <i class="fa-regular fa-image text-2xl" aria-hidden="true"></i>
        <span class="text-xs tracking-wide">{{ rotulo() }}</span>
      </div>
    }
  `,
})
export class FotoComponent {
  readonly src = input('');
  readonly alt = input('');
  readonly rotulo = input('Foto');
  /** Ponto do recorte da foto (CSS object-position), ex.: '50% 70%'. */
  readonly posicao = input('center');

  /** Guarda o caminho que não carregou (arquivo ainda não existe) para mostrar o espaço reservado. */
  protected readonly falhou = signal('');
}
