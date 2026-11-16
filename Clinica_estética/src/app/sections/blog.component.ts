import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { POSTS, formatarData } from '../core/data';

@Component({
  selector: 'app-blog',
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    <section id="blog" class="py-24 bg-cream">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="max-w-2xl mb-14">
          <h2 class="font-display text-4xl sm:text-5xl font-light">Blog</h2>
          <p class="text-muted text-lg mt-5">Dicas e informações para você cuidar bem da pele no dia a dia.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (p of posts; track p.slug) {
            <article class="group">
              <a [routerLink]="['/blog', p.slug]" class="block">
                <div class="aspect-[16/10] rounded-3xl bg-linear-to-br mb-5 flex items-end p-5" [class]="p.capa">
                  <span class="bg-white/80 text-ink text-xs font-medium px-3 py-1.5 rounded-full">{{ p.categoria }}</span>
                </div>
                <p class="text-sm text-muted mb-2">{{ data(p.data) }} · {{ p.leitura }} min de leitura</p>
                <h3 class="font-display text-2xl font-light leading-snug group-hover:text-brand-dark transition">{{ p.titulo }}</h3>
                <p class="text-muted text-sm leading-relaxed mt-3">{{ p.resumo }}</p>
                <span class="inline-block mt-4 text-sm font-medium text-brand-dark">Ler artigo <i class="fa-solid fa-arrow-right ml-1 text-xs" aria-hidden="true"></i></span>
              </a>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class BlogComponent {
  protected readonly posts = POSTS;
  protected readonly data = (iso: string) => formatarData(iso);
}
