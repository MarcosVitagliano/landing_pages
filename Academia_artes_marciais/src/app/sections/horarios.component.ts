import { Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MODALIDADES } from '../core/data';

@Component({
  selector: 'app-horarios',
  host: { class: 'block' },
  template: `
    <section id="horarios" class="py-24 bg-slate-950">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12">
          <h2 class="font-display text-4xl sm:text-5xl font-bold uppercase tracking-wide">Grade de horários</h2>
          <div class="h-1 w-16 bg-brand-red mt-4"></div>
          <p class="text-slate-400 text-lg mt-6">Escolha a modalidade para ver os dias e horários das turmas.</p>
        </div>

        <div role="tablist" aria-label="Modalidades" class="flex flex-wrap gap-2 sm:gap-3 mb-8">
          @for (m of modalidades; track m.id; let i = $index) {
            <button type="button" role="tab" [id]="'tab-' + m.id"
                    aria-controls="painel-horarios"
                    [attr.aria-selected]="m.id === selecionada()"
                    [attr.tabindex]="m.id === selecionada() ? 0 : -1"
                    class="px-5 py-3 rounded-xl font-bold text-sm transition"
                    [class]="m.id === selecionada() ? 'bg-brand-red text-white' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'"
                    (click)="selecionada.set(m.id)"
                    (keydown)="teclas($event, i)">{{ m.nome }}</button>
          }
        </div>

        <div id="painel-horarios" role="tabpanel" [attr.aria-labelledby]="'tab-' + atual().id"
             class="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 space-y-3">
          @for (h of atual().horarios; track h.aula) {
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
              <div>
                <p class="text-brand-gold font-semibold text-sm">{{ h.dias }}</p>
                <p class="text-lg font-bold mt-1">{{ h.aula }}</p>
              </div>
              <div class="flex items-center gap-4 text-slate-300 text-sm">
                <span>{{ h.hora }}</span>
                <span class="bg-brand-red/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold">{{ h.local }}</span>
              </div>
            </div>
          }
        </div>
        <p class="text-slate-500 text-sm mt-4">Horários podem variar por unidade. Confirme com o atendimento antes de ir.</p>
      </div>
    </section>
  `,
})
export class HorariosComponent {
  private readonly doc = inject(DOCUMENT);

  protected readonly modalidades = MODALIDADES;
  protected readonly selecionada = signal(MODALIDADES[0].id);
  protected readonly atual = computed(
    () => MODALIDADES.find((m) => m.id === this.selecionada()) ?? MODALIDADES[0],
  );

  /** Setas esquerda/direita movem entre as abas (padrão WAI-ARIA de tabs). */
  protected teclas(ev: KeyboardEvent, i: number): void {
    const n = this.modalidades.length;
    let alvo = -1;
    if (ev.key === 'ArrowRight') alvo = (i + 1) % n;
    else if (ev.key === 'ArrowLeft') alvo = (i - 1 + n) % n;
    if (alvo < 0) return;
    ev.preventDefault();
    const m = this.modalidades[alvo];
    this.selecionada.set(m.id);
    setTimeout(() => this.doc.getElementById('tab-' + m.id)?.focus());
  }
}
