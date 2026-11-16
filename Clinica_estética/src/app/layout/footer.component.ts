import { Component, inject } from '@angular/core';
import { CONFIG } from '../core/config';
import { WhatsappService } from '../core/whatsapp.service';

@Component({
  selector: 'app-footer',
  host: { class: 'block' },
  template: `
    <footer id="contato" class="bg-wine text-blush">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <p class="font-display text-3xl text-white mb-3"><i class="fa-solid fa-leaf text-brand-soft mr-2 text-xl" aria-hidden="true"></i>{{ c.nome }}</p>
          <p class="text-blush/80 leading-relaxed max-w-xs">Cuidado com a pele e o bem-estar, com atenção a cada detalhe.</p>
        </div>

        <div>
          <h2 class="font-display text-xl text-white mb-4">Visite a clínica</h2>
          <p class="mb-4 flex gap-3"><i class="fa-solid fa-location-dot mt-1 text-brand-soft" aria-hidden="true"></i><span>{{ c.endereco }}</span></p>
          <ul class="space-y-1 text-blush/80">
            @for (h of c.funcionamento; track h) {
              <li>{{ h }}</li>
            }
          </ul>
        </div>

        <div>
          <h2 class="font-display text-xl text-white mb-4">Fale com a gente</h2>
          <a [href]="whatsapp" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-2 bg-white text-wine font-medium px-6 py-3 rounded-full hover:bg-brand-soft transition">
            <i class="fa-brands fa-whatsapp text-xl" aria-hidden="true"></i>Chamar no WhatsApp
          </a>
          <p class="mt-5">
            <a [href]="c.instagram" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 hover:text-white transition">
              <i class="fa-brands fa-instagram text-xl" aria-hidden="true"></i>Instagram
            </a>
          </p>
        </div>
      </div>
      <p class="border-t border-white/10 py-6 text-center text-sm text-blush/60">&copy; 2026 {{ c.nome }}. Todos os direitos reservados.</p>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly c = CONFIG;
  protected readonly whatsapp = inject(WhatsappService).link('Olá! Vim pelo site e gostaria de mais informações.');
}
