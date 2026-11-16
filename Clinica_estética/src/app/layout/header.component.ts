import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONFIG } from '../core/config';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    <header class="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-line">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2" [attr.aria-label]="nome + ' - início'">
          <i class="fa-solid fa-leaf text-brand text-xl" aria-hidden="true"></i>
          <span class="font-display text-2xl font-normal tracking-wide">{{ nome }}</span>
        </a>

        <nav class="hidden lg:flex items-center gap-8 text-sm" aria-label="Principal">
          @for (l of links; track l.fragment) {
            <a routerLink="/" [fragment]="l.fragment" class="text-muted hover:text-ink transition">{{ l.label }}</a>
          }
          <a routerLink="/" fragment="agendar"
             class="bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium transition">Agendar horário</a>
        </nav>

        <button type="button" class="lg:hidden text-2xl p-2"
                [attr.aria-label]="aberto() ? 'Fechar menu' : 'Abrir menu'"
                [attr.aria-expanded]="aberto()" aria-controls="menu-mobile"
                (click)="aberto.set(!aberto())">
          <i class="fa-solid" [class.fa-bars]="!aberto()" [class.fa-xmark]="aberto()" aria-hidden="true"></i>
        </button>
      </div>

      @if (aberto()) {
        <div id="menu-mobile" class="lg:hidden bg-cream border-b border-line px-5 pt-2 pb-6">
          @for (l of links; track l.fragment) {
            <a routerLink="/" [fragment]="l.fragment" (click)="aberto.set(false)"
               class="block py-3 text-muted hover:text-ink transition">{{ l.label }}</a>
          }
          <a routerLink="/" fragment="agendar" (click)="aberto.set(false)"
             class="block text-center bg-brand text-white py-3 rounded-full font-medium mt-3">Agendar horário</a>
        </div>
      }
    </header>
  `,
})
export class HeaderComponent {
  protected readonly nome = CONFIG.nome;
  protected readonly aberto = signal(false);
  protected readonly links = [
    { fragment: 'clinica', label: 'A clínica' },
    { fragment: 'servicos', label: 'Procedimentos' },
    { fragment: 'sobre', label: 'Diferenciais' },
    { fragment: 'blog', label: 'Blog' },
    { fragment: 'contato', label: 'Contato' },
  ];
}
