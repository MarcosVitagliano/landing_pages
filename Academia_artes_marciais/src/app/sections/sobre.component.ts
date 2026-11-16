import { Component } from '@angular/core';

/** TEXTOS DE EXEMPLO: substitua pela história real da empresa (datas, fundador, unidades). */
@Component({
  selector: 'app-sobre',
  host: { class: 'block' },
  template: `
    <section id="sobre" class="py-24 bg-slate-900 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          <div>
            <h2 class="font-display text-4xl sm:text-5xl font-bold uppercase tracking-wide">Nossa história</h2>
            <div class="h-1 w-16 bg-brand-red mt-4"></div>
            <p class="text-slate-300 text-lg leading-relaxed mt-6 max-w-prose">
              A Dojo Alpha nasceu de um tatame pequeno e de uma ideia simples: ensinar artes marciais com seriedade técnica e respeito por quem está começando. Com o tempo, a procura cresceu e abrimos novas unidades, sempre com o mesmo padrão de ensino.
            </p>
            <p class="text-slate-400 leading-relaxed mt-4 max-w-prose">
              Hoje, a rede reúne alunos de todas as idades, de crianças no primeiro dia de aula a atletas de competição.
            </p>
          </div>

          <ol class="relative border-l border-slate-700 space-y-10 pl-8 self-center">
            @for (marco of marcos; track marco.titulo) {
              <li>
                <span class="absolute -left-[7px] mt-1.5 w-3.5 h-3.5 rounded-full bg-brand-red"></span>
                <p class="font-display text-2xl text-brand-gold">{{ marco.titulo }}</p>
                <p class="text-slate-400 mt-1">{{ marco.texto }}</p>
              </li>
            }
          </ol>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          @for (b of blocos; track b.titulo) {
            <div class="border-t-2 border-brand-red pt-6">
              <h3 class="font-display text-2xl font-bold uppercase tracking-wide mb-3">{{ b.titulo }}</h3>
              <p class="text-slate-400 leading-relaxed">{{ b.texto }}</p>
            </div>
          }
        </div>

        <div>
          <h3 class="font-display text-3xl font-bold uppercase tracking-wide">Nossos objetivos</h3>
          <div class="h-1 w-12 bg-brand-red mt-3 mb-8"></div>
          <ul class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (o of objetivos; track o.titulo) {
              <li class="flex gap-4">
                <i class="fa-solid text-brand-gold text-2xl mt-1" [class]="o.icone" aria-hidden="true"></i>
                <div>
                  <p class="font-bold">{{ o.titulo }}</p>
                  <p class="text-slate-400 text-sm mt-1">{{ o.texto }}</p>
                </div>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
})
export class SobreComponent {
  protected readonly marcos = [
    { titulo: 'Fundação', texto: 'Abertura da primeira academia, com turmas de Jiu-Jitsu e Muay Thai.' },
    { titulo: 'Expansão', texto: 'Chegada do Boxe e do Judô e abertura de novas unidades.' },
    { titulo: 'Hoje', texto: 'Rede com plano único: o aluno treina em qualquer unidade.' },
  ];

  protected readonly blocos = [
    {
      titulo: 'Missão',
      texto: 'Promover o desenvolvimento físico e mental dos alunos por meio de artes marciais de alta qualidade, com foco em saúde, autodefesa e autoconfiança.',
    },
    {
      titulo: 'Visão',
      texto: 'Ser a rede de academias de artes marciais mais respeitada da região pela qualidade dos professores, da estrutura e da formação de atletas e cidadãos.',
    },
    {
      titulo: 'Valores',
      texto: 'Respeito, disciplina, espírito de comunidade, superação contínua e integridade em cada treino.',
    },
  ];

  protected readonly objetivos = [
    { icone: 'fa-graduation-cap', titulo: 'Ensino técnico de qualidade', texto: 'Metodologia por níveis, com graduação acompanhada.' },
    { icone: 'fa-heart-pulse', titulo: 'Saúde e bem-estar', texto: 'Condicionamento físico e equilíbrio mental para o dia a dia.' },
    { icone: 'fa-trophy', titulo: 'Formar atletas', texto: 'Equipe de competição e apoio em campeonatos.' },
    { icone: 'fa-people-group', titulo: 'Comunidade', texto: 'Um ambiente acolhedor para crianças, jovens e adultos.' },
  ];
}
