import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CONFIG } from '../core/config';
import { POSTS, formatarData } from '../core/data';

/**
 * Página de um artigo (/blog/:slug).
 * O parâmetro da rota chega como input (withComponentInputBinding em app.config.ts).
 */
@Component({
  selector: 'app-post-page',
  imports: [RouterLink],
  template: `
    <article class="pt-36 pb-24 bg-white min-h-screen">
      <div class="max-w-2xl mx-auto px-5 sm:px-8">
        <a routerLink="/" fragment="blog" class="text-sm text-muted hover:text-ink transition">
          <i class="fa-solid fa-arrow-left mr-2 text-xs" aria-hidden="true"></i>Voltar ao blog
        </a>

        @if (post(); as p) {
          <p class="mt-10 text-sm text-brand-dark font-medium">{{ p.categoria }}</p>
          <h1 class="font-display text-4xl sm:text-5xl font-light leading-tight mt-3">{{ p.titulo }}</h1>
          <p class="text-muted text-sm mt-5">{{ data(p.data) }} · {{ p.leitura }} min de leitura</p>

          <div class="mt-10 space-y-6 text-lg leading-relaxed text-ink/85">
            @for (par of p.corpo; track $index) {
              <p>{{ par }}</p>
            }
          </div>

          <div class="mt-14 p-8 rounded-3xl bg-blush text-center">
            <p class="font-display text-2xl font-light mb-4">Quer uma orientação para o seu caso?</p>
            <a routerLink="/" fragment="agendar"
               class="inline-block bg-brand hover:bg-brand-dark text-white font-medium px-8 py-3.5 rounded-full transition">Agendar uma avaliação</a>
          </div>
        } @else {
          <h1 class="font-display text-4xl font-light mt-10">Artigo não encontrado</h1>
          <p class="text-muted mt-4">O endereço pode estar errado ou o artigo foi removido.</p>
        }
      </div>
    </article>
  `,
})
export class PostPage {
  private readonly title = inject(Title);

  readonly slug = input.required<string>();
  protected readonly post = computed(() => POSTS.find((p) => p.slug === this.slug()));
  protected readonly data = (iso: string) => formatarData(iso);

  constructor() {
    effect(() => {
      const p = this.post();
      this.title.setTitle(p ? `${p.titulo} | ${CONFIG.nome}` : `Artigo não encontrado | ${CONFIG.nome}`);
    });
  }
}
