import { Component, inject, signal } from '@angular/core';
import { WhatsappService } from '../core/whatsapp.service';

@Component({
  selector: 'app-header',
  host: { class: 'block' },
  template: `
    <header class="fixed top-0 left-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a href="#" class="flex items-center gap-2" aria-label="Dojo Alpha - início">
          <i class="fa-solid fa-hand-fist text-brand-red text-3xl" aria-hidden="true"></i>
          <span class="font-display text-2xl font-bold tracking-wider uppercase">Dojo <span class="text-brand-red">Alpha</span></span>
        </a>

        <nav class="hidden md:flex items-center gap-8 font-medium text-sm" aria-label="Principal">
          @for (l of links; track l.href) {
            <a [href]="l.href" class="hover:text-brand-red transition">{{ l.label }}</a>
          }
          <a [href]="aulaExperimental" target="_blank" rel="noopener noreferrer"
             class="bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2.5 rounded-full font-bold transition">Aula experimental</a>
        </nav>

        <button type="button" class="md:hidden text-2xl text-slate-300 p-2"
                [attr.aria-label]="aberto() ? 'Fechar menu' : 'Abrir menu'"
                [attr.aria-expanded]="aberto()" aria-controls="mobile-menu"
                (click)="aberto.set(!aberto())">
          <i class="fa-solid" [class.fa-bars]="!aberto()" [class.fa-xmark]="aberto()" aria-hidden="true"></i>
        </button>
      </div>

      @if (aberto()) {
        <div id="mobile-menu" class="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-1">
          @for (l of links; track l.href) {
            <a [href]="l.href" class="block py-3 hover:text-brand-red transition" (click)="aberto.set(false)">{{ l.label }}</a>
          }
          <a [href]="aulaExperimental" target="_blank" rel="noopener noreferrer"
             class="block text-center bg-brand-red text-white py-3 rounded-xl font-bold mt-3">Aula experimental</a>
        </div>
      }
    </header>
  `,
})
export class HeaderComponent {
  private readonly wa = inject(WhatsappService);

  protected readonly aberto = signal(false);
  protected readonly links = [
    { href: '#modalidades', label: 'Modalidades' },
    { href: '#sobre', label: 'A Academia' },
    { href: '#horarios', label: 'Horários' },
    { href: '#planos', label: 'Planos' },
    { href: '#galeria', label: 'Galeria' },
  ];
  protected readonly aulaExperimental = this.wa.link('Olá! Gostaria de agendar uma aula experimental.');
}
