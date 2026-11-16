import { Component, inject } from '@angular/core';
import { PLANOS, Plano, brl, economia } from '../core/data';
import { WhatsappService } from '../core/whatsapp.service';

@Component({
  selector: 'app-planos',
  host: { class: 'block' },
  template: `
    <section id="planos" class="py-24 bg-slate-900 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <h2 class="font-display text-4xl sm:text-5xl font-bold uppercase tracking-wide">Planos</h2>
          <div class="h-1 w-16 bg-brand-red mt-4"></div>
          <p class="text-slate-400 text-lg mt-6">Quanto maior o compromisso, menor a mensalidade.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          @for (p of planos; track p.id) {
            <article class="relative flex flex-col bg-slate-950 p-8 rounded-2xl"
                     [class]="p.destaque ? 'border-2 border-brand-red lg:-translate-y-3' : 'border border-slate-800'">
              @if (p.destaque) {
                <span class="absolute -top-3.5 left-8 bg-brand-red text-white text-xs font-bold px-4 py-1 rounded-full">Melhor custo-benefício</span>
              }
              <h3 class="font-display text-2xl font-bold uppercase tracking-wide mb-2">{{ p.nome }}</h3>
              <p class="text-slate-400 text-sm mb-6">{{ p.resumo }}</p>

              <p class="mb-1">
                <span class="text-5xl font-display font-bold" [class.text-brand-red]="p.destaque">{{ brl(p.preco) }}</span>
                <span class="text-slate-400 text-sm"> /mês</span>
              </p>
              <p class="text-slate-500 text-xs mb-6">{{ resumoTotal(p) }}</p>

              <ul class="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                @for (item of p.itens; track item) {
                  <li><i class="fa-solid fa-check text-brand-red mr-2" aria-hidden="true"></i>{{ item }}</li>
                }
              </ul>

              <a [href]="wa.link('Olá! Quero assinar o ' + p.nome + '.')" target="_blank" rel="noopener noreferrer"
                 class="block text-center font-bold py-3.5 rounded-xl transition"
                 [class]="p.destaque ? 'bg-brand-red hover:bg-brand-red-hover' : 'bg-slate-800 hover:bg-slate-700'">
                Assinar {{ rotulo(p) }}
              </a>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class PlanosComponent {
  protected readonly wa = inject(WhatsappService);
  protected readonly planos = PLANOS;
  protected readonly brl = brl;

  protected resumoTotal(p: Plano): string {
    return p.meses > 1
      ? `${brl(p.preco * p.meses)} a cada ${p.meses} meses · economia de ${brl(economia(p))}`
      : 'Sem fidelidade';
  }

  protected rotulo(p: Plano): string {
    return p.nome.replace('Plano ', '').toLowerCase();
  }
}
