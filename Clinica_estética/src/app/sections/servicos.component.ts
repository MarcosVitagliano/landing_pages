import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SERVICOS, Servico } from '../core/data';
import { CarrosselComponent } from '../shared/carrossel.component';

@Component({
  selector: 'app-servicos',
  imports: [RouterLink, CarrosselComponent],
  host: { class: 'block' },
  template: `
    <section id="servicos" class="py-24 bg-white">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <h2 class="font-display text-4xl sm:text-6xl font-light">Nossos <span class="text-title">Procedimentos</span></h2>
        <p class="mt-5 text-lg text-muted">Toque em um procedimento para ver os detalhes.</p>

        <app-carrossel class="mt-10" rotulo="Procedimentos">
          @for (s of servicos; track s.id) {
            <button type="button" (click)="selecionar(s)" [attr.aria-pressed]="selecionado()?.id === s.id"
                    class="group relative block h-72 sm:h-96 w-[88%] md:w-[72%] rounded-3xl overflow-hidden text-white text-left">
              <span class="absolute inset-0 block bg-linear-to-br from-brand to-wine"></span>
              @if (s.src && !falhas().includes(s.id)) {
                <img [src]="s.src" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover"
                     (error)="registrarFalha(s.id)">
              }
              <span class="absolute inset-0 block bg-wine/45 group-hover:bg-wine/25 transition"></span>
              <span class="absolute inset-0 flex items-center justify-center">
                <span class="w-52 h-52 sm:w-64 sm:h-64 rounded-full border-2 border-white bg-wine/35 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6">
                  <span class="font-display text-xl sm:text-2xl font-light leading-snug">{{ s.nome }}</span>
                  <span class="mt-2 text-sm font-medium">Saiba mais</span>
                </span>
              </span>
            </button>
          }
        </app-carrossel>

        <div class="mt-10" aria-live="polite">
          @if (selecionado(); as s) {
            <div class="rounded-3xl bg-blush p-8 sm:p-10 grid sm:grid-cols-3 gap-8 items-center">
              <div class="sm:col-span-2">
                <p class="text-xs uppercase tracking-widest text-muted">{{ s.categoria }} · {{ s.duracao }}</p>
                <h3 class="font-display text-3xl font-light mt-2">{{ s.nome }}</h3>
                <p class="text-muted mt-3 leading-relaxed">{{ s.desc }}</p>
              </div>
              <div class="flex flex-col gap-3 items-stretch">
                <a routerLink="/" fragment="agendar" [queryParams]="{ servico: s.id }"
                   class="text-center bg-brand hover:bg-brand-dark text-white uppercase tracking-wide text-sm font-medium px-8 py-4 rounded-full transition">Agendar</a>
                <button type="button" (click)="selecionado.set(null)" class="text-sm text-muted hover:text-ink transition">Fechar detalhes</button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class ServicosComponent {
  protected readonly servicos = SERVICOS;
  protected readonly selecionado = signal<Servico | null>(null);
  /** Procedimentos cuja foto ainda não existe (mostra só o fundo rosa). */
  protected readonly falhas = signal<string[]>([]);

  protected registrarFalha(id: string): void {
    this.falhas.update((l) => [...l, id]);
  }

  protected selecionar(s: Servico): void {
    this.selecionado.set(this.selecionado()?.id === s.id ? null : s);
  }
}
