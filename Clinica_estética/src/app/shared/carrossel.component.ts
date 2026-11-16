import { Component, ElementRef, afterNextRender, computed, input, signal, viewChild } from '@angular/core';

/**
 * Carrossel simples com rolagem nativa (scroll-snap): funciona com toque, mouse e teclado.
 * Uso: coloque os itens dentro da tag; cada item vira um "slide".
 *   <app-carrossel rotulo="Fotos"> <div class="w-64">...</div> ... </app-carrossel>
 * O estilo dos itens (.trilho > *) está em styles.css.
 */
@Component({
  selector: 'app-carrossel',
  host: { class: 'block', '(window:resize)': 'atualizar()' },
  template: `
    @if (setas()) {
      <div class="flex justify-end gap-3 mb-5">
        <button type="button" (click)="mover(-1)" [disabled]="indice() === 0" aria-label="Item anterior"
                class="w-11 h-11 rounded-full border border-line text-brand hover:bg-brand-soft disabled:opacity-40 disabled:hover:bg-transparent transition">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </button>
        <button type="button" (click)="mover(1)" [disabled]="indice() >= total() - 1" aria-label="Próximo item"
                class="w-11 h-11 rounded-full border border-line text-brand hover:bg-brand-soft disabled:opacity-40 disabled:hover:bg-transparent transition">
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </button>
      </div>
    }

    <div #trilho class="trilho relative flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth"
         role="group" aria-roledescription="carrossel" [attr.aria-label]="rotulo()"
         (scroll)="atualizar()">
      <ng-content />
    </div>

    @if (total() > 1) {
      <div class="flex justify-center mt-5">
        @for (i of pontos(); track i) {
          <button type="button" (click)="ir(i)" class="p-1.5"
                  [attr.aria-label]="'Ir para o item ' + (i + 1)" [attr.aria-current]="i === indice()">
            <span class="block w-2.5 h-2.5 rounded-full transition" [class]="i === indice() ? 'bg-brand' : 'bg-brand-soft'"></span>
          </button>
        }
      </div>
    }
  `,
})
export class CarrosselComponent {
  readonly rotulo = input('Carrossel');
  readonly setas = input(true);

  protected readonly indice = signal(0);
  protected readonly total = signal(0);
  protected readonly pontos = computed(() => Array.from({ length: this.total() }, (_, i) => i));

  private readonly trilho = viewChild.required<ElementRef<HTMLElement>>('trilho');

  constructor() {
    afterNextRender(() => {
      this.atualizar();
      setTimeout(() => this.atualizar(), 300); // itens projetados podem chegar um instante depois
    });
  }

  /** Descobre qual item está no início da área visível e quantos itens existem. */
  protected atualizar(): void {
    const el = this.trilho().nativeElement;
    const itens = Array.from(el.children) as HTMLElement[];
    this.total.set(itens.length);
    if (!itens.length) return;

    let atual = 0;
    let menor = Infinity;
    itens.forEach((item, i) => {
      const dist = Math.abs(item.offsetLeft - el.scrollLeft);
      if (dist < menor) {
        menor = dist;
        atual = i;
      }
    });
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) atual = itens.length - 1;
    this.indice.set(atual);
  }

  protected ir(i: number): void {
    const el = this.trilho().nativeElement;
    const item = el.children[i] as HTMLElement | undefined;
    if (item) el.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
  }

  protected mover(passo: number): void {
    this.ir(Math.min(Math.max(this.indice() + passo, 0), this.total() - 1));
  }
}
