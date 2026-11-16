import { Component } from '@angular/core';
import { DIFERENCIAIS } from '../core/data';

/** Textos de exemplo: substitua pela história e pelos diferenciais reais da clínica. */
@Component({
  selector: 'app-sobre',
  host: { class: 'block' },
  template: `
    <section id="sobre" class="py-24 bg-blush">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-16">
          <h2 class="font-display text-4xl sm:text-5xl font-light leading-tight">Estética com cuidado de verdade, do primeiro contato ao pós-atendimento.</h2>
          <p class="text-wine/80 text-lg leading-relaxed">
            Acreditamos que bons resultados nascem de escuta, método e respeito ao tempo de cada pessoa. Por isso, cada atendimento é planejado de forma individual, com explicações claras em todas as etapas.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (d of diferenciais; track d.titulo) {
            <div class="bg-white/70 rounded-3xl p-7">
              <i class="fa-solid text-brand text-2xl mb-5 block" [class]="d.icone" aria-hidden="true"></i>
              <h3 class="font-display text-xl font-light mb-2">{{ d.titulo }}</h3>
              <p class="text-wine/75 text-sm leading-relaxed">{{ d.texto }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class SobreComponent {
  protected readonly diferenciais = DIFERENCIAIS;
}
