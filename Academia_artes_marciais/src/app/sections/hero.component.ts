import { Component, inject } from '@angular/core';
import { ChatStateService } from '../core/chat-state.service';

@Component({
  selector: 'app-hero',
  host: { class: 'block' },
  template: `
    <section class="relative min-h-screen flex items-center pt-20 bg-slate-900 overflow-hidden">
      <div class="absolute inset-0 z-0 opacity-40">
        <!-- Troque pela foto real de treino da academia -->
        <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop"
             alt="Alunos treinando no tatame" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
      </div>

      <div class="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 class="font-display font-bold uppercase leading-[0.95] tracking-tight text-5xl sm:text-7xl lg:text-8xl max-w-4xl">
          Supere seus limites.<br><span class="text-brand-red">Domine a arte.</span>
        </h1>
        <p class="mt-8 text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed">
          Jiu-Jitsu, Muay Thai, Boxe e Judô para iniciantes e atletas. Treine com professores graduados em qualquer unidade da rede.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row gap-4">
          <button type="button" (click)="chat.abrir()"
                  class="bg-brand-red hover:bg-brand-red-hover text-white text-lg font-bold px-8 py-4 rounded-xl transition">
            <i class="fa-brands fa-whatsapp mr-2" aria-hidden="true"></i>Falar com o atendente virtual
          </button>
          <a href="#horarios" class="text-center bg-slate-800/80 hover:bg-slate-700 text-white text-lg font-bold px-8 py-4 rounded-xl border border-slate-700 transition">Ver horários</a>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  protected readonly chat = inject(ChatStateService);
}
