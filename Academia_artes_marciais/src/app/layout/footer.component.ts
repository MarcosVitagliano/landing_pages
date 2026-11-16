import { Component, inject } from '@angular/core';
import { WhatsappService } from '../core/whatsapp.service';

@Component({
  selector: 'app-footer',
  host: { class: 'block' },
  template: `
    <footer class="bg-slate-900 border-t border-slate-800 py-12 text-slate-400 text-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-hand-fist text-brand-red text-2xl" aria-hidden="true"></i>
          <span class="font-display text-xl text-white font-bold tracking-wider uppercase">Dojo Alpha</span>
        </div>
        <p>&copy; 2026 Dojo Alpha. Todos os direitos reservados.</p>
        <div class="flex gap-5 text-2xl">
          <!-- Troque os # pelos perfis reais -->
          <a href="#" aria-label="Instagram" class="hover:text-brand-red transition"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
          <a href="#" aria-label="Facebook" class="hover:text-brand-red transition"><i class="fa-brands fa-facebook" aria-hidden="true"></i></a>
          <a [href]="whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="hover:text-brand-red transition"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly whatsapp = inject(WhatsappService).link('Olá! Vim pelo site.');
}
