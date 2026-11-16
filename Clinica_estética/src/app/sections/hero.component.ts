import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatStateService } from '../core/chat-state.service';
import { CONFIG } from '../core/config';

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    <section class="relative min-h-[88vh] flex items-center overflow-hidden bg-brand-dark">
      <!-- Foto grande do fundo (defina CONFIG.heroImg em core/config.ts). Sem foto, fica o fundo rosa. -->
      <div class="absolute inset-0 bg-linear-to-br from-brand-dark via-brand to-title"></div>
      @if (heroImg && !heroFalhou()) {
        <img [src]="heroImg" alt="" class="absolute inset-0 w-full h-full object-cover" (error)="heroFalhou.set(true)">
      } @else {
        <div class="absolute -right-24 top-10 w-[28rem] h-[28rem] rounded-full bg-white/10"></div>
        <div class="absolute right-40 -bottom-32 w-[22rem] h-[22rem] rounded-full bg-white/10"></div>
      }
      <div class="absolute inset-0 bg-linear-to-r from-brand-dark/90 via-brand/60 to-transparent"></div>

      <div class="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pt-32 pb-24 text-white">
        <h1 class="font-display font-light text-5xl sm:text-7xl lg:text-8xl leading-[1.02] max-w-3xl">
          Realce a sua beleza natural
        </h1>
        <p class="mt-8 text-xl sm:text-2xl font-light max-w-xl leading-relaxed">
          Conheça os nossos procedimentos e agende o seu horário em poucos cliques.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row gap-4">
          <a routerLink="/" fragment="agendar"
             class="text-center bg-white text-ink uppercase tracking-wide text-sm font-medium px-10 py-4 rounded-full hover:bg-brand-soft transition">Agendar horário</a>
          <button type="button" (click)="chat.abrir()"
                  class="uppercase tracking-wide text-sm font-medium px-10 py-4 rounded-full border border-white/70 hover:bg-white/15 transition">
            <i class="fa-regular fa-comments mr-2" aria-hidden="true"></i>Tirar dúvidas no chat
          </button>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  protected readonly chat = inject(ChatStateService);
  protected readonly heroImg = CONFIG.heroImg;
  protected readonly heroFalhou = signal(false);
}
