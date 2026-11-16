import { Component } from '@angular/core';
import { MODALIDADES } from '../core/data';

@Component({
  selector: 'app-modalidades',
  host: { class: 'block' },
  template: `
    <section id="modalidades" class="py-24 bg-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <h2 class="font-display text-4xl sm:text-5xl font-bold uppercase tracking-wide">Modalidades</h2>
          <div class="h-1 w-16 bg-brand-red mt-4"></div>
          <p class="text-slate-400 text-lg mt-6">Escolha a arte marcial que combina com o seu objetivo. Todas têm turmas para iniciantes.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (m of modalidades; track m.id) {
            <article class="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-brand-red/60 transition">
              <i class="fa-solid text-brand-red text-3xl mb-5" [class]="m.icone" aria-hidden="true"></i>
              <h3 class="font-display text-2xl font-bold uppercase tracking-wide mb-2">{{ m.nome }}</h3>
              <p class="text-slate-400 text-sm leading-relaxed">{{ m.desc }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class ModalidadesComponent {
  protected readonly modalidades = MODALIDADES;
}
