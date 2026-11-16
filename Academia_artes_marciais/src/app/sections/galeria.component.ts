import { Component } from '@angular/core';

@Component({
  selector: 'app-galeria',
  host: { class: 'block' },
  template: `
    <section id="galeria" class="py-24 bg-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <h2 class="font-display text-4xl sm:text-5xl font-bold uppercase tracking-wide">Galeria de treinos</h2>
          <div class="h-1 w-16 bg-brand-red mt-4"></div>
          <p class="text-slate-400 text-lg mt-6">A estrutura e a energia dos nossos alunos no tatame.</p>
        </div>

        <!-- Troque por fotos reais da academia (ideal: arquivos locais em public/img, em WebP). -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (f of fotos; track f.src) {
            <figure class="relative overflow-hidden rounded-2xl h-72 border border-slate-800 group">
              <img loading="lazy" [src]="f.src" [alt]="f.alt"
                   class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
              <figcaption class="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-slate-950/95 to-transparent font-semibold">{{ f.legenda }}</figcaption>
            </figure>
          }
        </div>
      </div>
    </section>
  `,
})
export class GaleriaComponent {
  protected readonly fotos = [
    {
      src: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800&auto=format&fit=crop',
      alt: 'Alunos treinando Jiu-Jitsu no tatame',
      legenda: 'Jiu-Jitsu',
    },
    {
      src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      alt: 'Treino de Muay Thai com manoplas',
      legenda: 'Muay Thai',
    },
    {
      src: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop',
      alt: 'Estrutura da academia',
      legenda: 'Estrutura',
    },
  ];
}
