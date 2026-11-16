import { Component, ElementRef, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { ChatStateService } from '../core/chat-state.service';
import { MODALIDADES, Modalidade, PLANOS, brl } from '../core/data';
import { WhatsappService } from '../core/whatsapp.service';

interface Mensagem {
  de: 'bot' | 'user';
  texto: string;
}

/** Opção clicável: ou abre um link (href) ou executa um passo do fluxo (run). */
interface Opcao {
  label: string;
  href?: string;
  run?: () => void;
}

const normalizar = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Atendimento automático no site. Responde dúvidas comuns e, quando o visitante
 * quiser, leva a conversa ao WhatsApp com a mensagem já preenchida.
 * O bot que responde DENTRO do WhatsApp fica em backend/bot_whatsapp.py.
 */
@Component({
  selector: 'app-chat-widget',
  host: { '(document:keydown.escape)': 'aoEscape()' },
  template: `
    <button #toggle type="button" (click)="alternar()"
            aria-controls="chat-panel" [attr.aria-expanded]="chat.aberto()"
            [attr.aria-label]="chat.aberto() ? 'Fechar atendimento automático' : 'Abrir atendimento automático'"
            class="fixed bottom-5 right-5 z-50 bg-[#25d366] hover:bg-[#20ba5a] text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl transition hover:scale-105">
      <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
    </button>

    @if (chat.aberto()) {
      <section id="chat-panel" role="dialog" aria-label="Atendimento automático Dojo Alpha"
               class="fixed z-50 bottom-24 right-4 sm:right-5 w-[calc(100vw-2rem)] sm:w-96 max-h-[75vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between bg-[#075e54] px-4 py-3">
          <div>
            <p class="font-bold">Assistente Dojo Alpha</p>
            <p class="text-xs text-emerald-100">Atendimento automático</p>
          </div>
          <button type="button" (click)="fechar()" class="text-xl p-1" aria-label="Fechar atendimento">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div #log role="log" aria-live="polite" class="flex-1 overflow-y-auto p-4 flex flex-col gap-2 text-sm min-h-32">
          @for (m of mensagens(); track $index) {
            <div class="max-w-[85%] px-3 py-2 rounded-xl whitespace-pre-line"
                 [class]="m.de === 'bot' ? 'self-start bg-slate-800' : 'self-end bg-brand-red'">{{ m.texto }}</div>
          }
        </div>

        <div class="px-4 pb-3 flex flex-wrap gap-2">
          @for (o of opcoes(); track o.label) {
            @if (o.href) {
              <a [href]="o.href" target="_blank" rel="noopener noreferrer"
                 class="px-3 py-2 rounded-full bg-[#25d366] text-slate-950 font-bold text-sm hover:bg-[#20ba5a] transition">{{ o.label }}</a>
            } @else {
              <button type="button" (click)="escolher(o)"
                      class="px-3 py-2 rounded-full border border-slate-600 hover:bg-slate-800 text-sm transition">{{ o.label }}</button>
            }
          }
        </div>

        <form (submit)="enviar($event, campo)" class="flex gap-2 p-3 border-t border-slate-800">
          <label for="chat-input" class="sr-only">Digite sua mensagem</label>
          <input #campo id="chat-input" type="text" autocomplete="off" maxlength="200" placeholder="Digite sua mensagem"
                 class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-500">
          <button type="submit" class="bg-brand-red hover:bg-brand-red-hover px-4 rounded-lg font-bold text-sm">Enviar</button>
        </form>
      </section>
    }
  `,
})
export class ChatWidgetComponent {
  protected readonly chat = inject(ChatStateService);
  private readonly wa = inject(WhatsappService);

  protected readonly mensagens = signal<Mensagem[]>([]);
  protected readonly opcoes = signal<Opcao[]>([]);

  private readonly log = viewChild<ElementRef<HTMLElement>>('log');
  private readonly campoRef = viewChild<ElementRef<HTMLInputElement>>('campo');
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');

  private iniciado = false;
  private aguardandoNome = false;
  private rascunho: { nome?: string } = {};

  constructor() {
    // Ao abrir (por qualquer componente): saudação na primeira vez e foco no campo.
    effect(() => {
      if (!this.chat.aberto()) return;
      untracked(() => {
        if (!this.iniciado) {
          this.iniciado = true;
          this.dizer('Olá! Sou o assistente virtual da Dojo Alpha.');
          this.menu();
        }
        setTimeout(() => {
          this.campoRef()?.nativeElement.focus();
          this.rolarParaOFim();
        });
      });
    });
  }

  protected alternar(): void {
    if (this.chat.aberto()) this.fechar();
    else this.chat.abrir();
  }

  protected fechar(): void {
    this.chat.fechar();
    setTimeout(() => this.toggle()?.nativeElement.focus());
  }

  protected aoEscape(): void {
    if (this.chat.aberto()) this.fechar();
  }

  protected escolher(o: Opcao): void {
    this.dizer(o.label, 'user');
    o.run?.();
  }

  protected enviar(ev: Event, campo: HTMLInputElement): void {
    ev.preventDefault();
    const texto = campo.value.trim();
    if (!texto) return;
    campo.value = '';
    this.dizer(texto, 'user');
    if (this.aguardandoNome) {
      this.aguardandoNome = false;
      this.rascunho.nome = texto.slice(0, 60);
      this.fluxoModalidadeExperimental();
    } else {
      this.interpretar(texto);
    }
  }

  // ---------- utilitários ----------
  private dizer(texto: string, de: 'bot' | 'user' = 'bot'): void {
    this.mensagens.update((l) => [...l, { de, texto }]);
    setTimeout(() => this.rolarParaOFim());
  }

  private rolarParaOFim(): void {
    const el = this.log()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  private voltar(): Opcao {
    return { label: 'Voltar ao menu', run: () => this.menu() };
  }

  // ---------- fluxos ----------
  private menu(): void {
    this.aguardandoNome = false;
    this.dizer('Como posso ajudar?');
    this.opcoes.set([
      { label: 'Planos e valores', run: () => this.fluxoPlanos() },
      { label: 'Grade de horários', run: () => this.fluxoHorarios() },
      { label: 'Aula experimental', run: () => this.fluxoExperimental() },
      { label: 'Falar com atendente', run: () => this.fluxoAtendente() },
    ]);
  }

  private fluxoPlanos(): void {
    this.dizer(
      PLANOS.map((p) => `${p.nome}: ${brl(p.preco)}/mês\n${p.itens.join(' · ')}`).join('\n\n'),
    );
    this.opcoes.set([
      ...PLANOS.map((p) => ({
        label: `Assinar ${p.nome.replace('Plano ', '')}`,
        href: this.wa.link(`Olá! Quero assinar o ${p.nome}.`),
      })),
      this.voltar(),
    ]);
  }

  private fluxoHorarios(): void {
    this.dizer('De qual modalidade você quer ver os horários?');
    this.opcoes.set([
      ...MODALIDADES.map((m) => ({ label: m.nome, run: () => this.fluxoHorariosDe(m) })),
      this.voltar(),
    ]);
  }

  private fluxoHorariosDe(m: Modalidade): void {
    this.dizer(
      `${m.nome}\n` + m.horarios.map((h) => `${h.dias}, ${h.hora}\n${h.aula} (${h.local})`).join('\n\n'),
    );
    this.opcoes.set([
      { label: 'Agendar aula experimental', run: () => this.fluxoExperimental() },
      { label: 'Outra modalidade', run: () => this.fluxoHorarios() },
      this.voltar(),
    ]);
  }

  private fluxoExperimental(): void {
    this.rascunho = {};
    this.aguardandoNome = true;
    this.opcoes.set([]);
    this.dizer('Vamos agendar sua aula experimental. Qual é o seu nome?');
    setTimeout(() => this.campoRef()?.nativeElement.focus());
  }

  private fluxoModalidadeExperimental(): void {
    const nome = this.rascunho.nome ?? '';
    this.dizer(`Prazer, ${nome}! Qual modalidade você quer experimentar?`);
    this.opcoes.set(
      MODALIDADES.map((m) => ({
        label: m.nome,
        run: () => {
          this.dizer('Ótimo! Toque no botão para enviar o pedido ao atendente pelo WhatsApp. Ele confirma o horário com você.');
          this.opcoes.set([
            {
              label: 'Enviar pelo WhatsApp',
              href: this.wa.link(`Olá! Me chamo ${nome} e quero agendar uma aula experimental de ${m.nome}.`),
            },
            this.voltar(),
          ]);
        },
      })),
    );
  }

  private fluxoAtendente(): void {
    this.dizer('Certo! Toque no botão para falar com um atendente no WhatsApp.');
    this.opcoes.set([
      { label: 'Abrir WhatsApp', href: this.wa.link('Olá! Vim pelo site e gostaria de falar com um atendente.') },
      this.voltar(),
    ]);
  }

  /** Entende palavras-chave digitadas pelo visitante. */
  private interpretar(texto: string): void {
    const t = normalizar(texto);
    if (/(atendente|humano|pessoa|falar com)/.test(t)) return this.fluxoAtendente();
    if (/(experimental|testar|agendar|aula gratis)/.test(t)) return this.fluxoExperimental();
    if (/(plano|preco|valor|mensalidade|quanto)/.test(t)) return this.fluxoPlanos();
    if (/(horario|hora|grade|turma)/.test(t)) return this.fluxoHorarios();
    const m = MODALIDADES.find((x) => t.includes(normalizar(x.nome)));
    if (m) return this.fluxoHorariosDe(m);

    this.dizer('Não entendi bem. Escolha uma das opções abaixo ou fale com um atendente.');
    this.opcoes.set([
      { label: 'Planos e valores', run: () => this.fluxoPlanos() },
      { label: 'Grade de horários', run: () => this.fluxoHorarios() },
      { label: 'Falar com atendente', run: () => this.fluxoAtendente() },
    ]);
  }
}
