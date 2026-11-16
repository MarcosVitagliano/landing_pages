import { Component } from '@angular/core';
import { GALERIA } from '../core/data';
import { CarrosselComponent } from '../shared/carrossel.component';
import { FotoComponent } from '../shared/foto.component';

/** Seção "A clínica": texto de apresentação e carrossel com as fotos do espaço. */
@Component({
  selector: 'app-galeria',
  imports: [CarrosselComponent, FotoComponent],
  host: { class: 'block' },
  template: `
    <section id="clinica" class="py-24 bg-white border-t border-line">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <h2 class="text-center font-display text-4xl sm:text-6xl font-light text-title">A clínica</h2>
        <p class="mt-8 text-center text-lg text-ink/80 max-w-2xl mx-auto leading-relaxed">
          A Aura Estética reúne tratamentos faciais e corporais com atenção individual, em um espaço pensado para o seu conforto desde a chegada.
        </p>

        <!-- Para usar fotos reais: coloque os arquivos em public/img e preencha o campo "src" em core/data.ts. -->
        <app-carrossel class="mt-14" rotulo="Fotos da clínica">
          @for (f of fotos; track f.titulo) {
            <figure class="w-64 sm:w-80">
              <app-foto [src]="f.src" [alt]="f.alt" [rotulo]="f.titulo" [posicao]="f.pos ?? 'center'" class="h-52 sm:h-64 rounded-2xl" />
              <figcaption class="mt-3 text-sm text-muted">{{ f.titulo }}</figcaption>
            </figure>
          }
        </app-carrossel>
      </div>
    </section>
  `,
})
export class GaleriaComponent {
  protected readonly fotos = GALERIA;
}
