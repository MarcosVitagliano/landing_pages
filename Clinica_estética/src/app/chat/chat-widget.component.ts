import { Component, ElementRef, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChatStateService } from '../core/chat-state.service';
import { CONFIG } from '../core/config';
import { CATEGORIAS, SERVICOS, Servico } from '../core/data';
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
 * Atendimento automático no site: responde dúvidas comuns, leva o visitante ao
 * formulário de agendamento ou ao WhatsApp. O bot que responde DENTRO do
 * WhatsApp fica em backend/bot_whatsapp.py.
 */
@Component({
  selector: 'app-chat-widget',
  host: { '(document:keydown.escape)': 'aoEscape()' },
  template: `
    <button #toggle type="button" (click)="alternar()"
            aria-controls="chat-panel" [attr.aria-expanded]="chat.aberto()"
            [attr.aria-label]="chat.aberto() ? 'Fechar atendimento automático' : 'Abrir atendimento automático'"
            class="fixed bottom-5 right-5 z-50 bg-wine hover:bg-brand text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xl transition hover:scale-105">
      <i class="fa-regular fa-comments" aria-hidden="true"></i>
    </button>

    @if (chat.aberto()) {
      <section id="chat-panel" role="dialog" [attr.aria-label]="'Atendimento automático ' + nome"
               class="fixed z-50 bottom-24 right-4 sm:right-5 w-[calc(100vw-2rem)] sm:w-96 max-h-[75vh] flex flex-col bg-white border border-line rounded-3xl shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between bg-wine text-white px-5 py-4">
          <div>
            <p class="font-display text-lg leading-tight">Assistente {{ nome }}</p>
            <p class="text-xs text-blush/80">Atendimento automático</p>
          </div>
          <button type="button" (click)="fechar()" class="text-xl p-1" aria-label="Fechar atendimento">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div #log role="log" aria-live="polite" class="flex-1 overflow-y-auto p-4 flex flex-col gap-2 text-sm min-h-32 bg-cream">
          @for (m of mensagens(); track $index) {
            <div class="max-w-[85%] px-4 py-2.5 rounded-2xl whitespace-pre-line"
                 [class]="m.de === 'bot' ? 'self-start bg-white border border-line' : 'self-end bg-brand text-white'">{{ m.texto }}</div>
          }
        </div>

        <div class="px-4 py-3 flex flex-wrap gap-2 bg-cream">
          @for (o of opcoes(); track o.label) {
            @if (o.href) {
              <a [href]="o.href" target="_blank" rel="noopener noreferrer"
                 class="px-4 py-2 rounded-full bg-wine text-white text-sm font-medium hover:bg-brand transition">{{ o.label }}</a>
            } @else {
              <button type="button" (click)="escolher(o)"
                      class="px-4 py-2 rounded-full border border-line bg-white hover:border-ink text-sm transition">{{ o.label }}</button>
            }
          }
        </div>

        <form (submit)="enviar($event, campo)" class="flex gap-2 p-3 border-t border-line bg-white">
          <label for="chat-input" class="sr-only">Digite sua mensagem</label>
          <input #campo id="chat-input" type="text" autocomplete="off" maxlength="200" placeholder="Digite sua mensagem"
                 class="flex-1 bg-cream border border-line rounded-full px-4 py-2 text-sm placeholder-muted focus:border-brand focus:outline-none">
          <button type="submit" class="bg-brand hover:bg-brand-dark text-white px-5 rounded-full font-medium text-sm transition">Enviar</button>
        </form>
      </section>
    }
  `,
})
export class ChatWidgetComponent {
  protected readonly chat = inject(ChatStateService);
  protected readonly nome = CONFIG.nome;
  private readonly wa = inject(WhatsappService);
  private readonly router = inject(Router);

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
          this.dizer(`Olá! Sou o assistente virtual da ${CONFIG.nome}.`);
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
      this.fluxoEscolherServico();
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

  /** Fecha o chat e leva o visitante ao formulário de agendamento (opcionalmente com o serviço escolhido). */
  private irParaFormulario(servicoId?: string): void {
    this.chat.fechar();
    this.router.navigate(['/'], {
      fragment: 'agendar',
      queryParams: servicoId ? { servico: servicoId } : {},
    });
  }

  // ---------- fluxos ----------
  private menu(): void {
    this.aguardandoNome = false;
    this.dizer('Como posso ajudar?');
    this.opcoes.set([
      { label: 'Serviços', run: () => this.fluxoServicos() },
      { label: 'Agendar horário', run: () => this.fluxoAgendar() },
      { label: 'Horário e endereço', run: () => this.fluxoFuncionamento() },
      { label: 'Falar com atendente', run: () => this.fluxoAtendente() },
    ]);
  }

  private fluxoServicos(): void {
    this.dizer(
      CATEGORIAS.map(
        (c) => `${c}\n` + SERVICOS.filter((s) => s.categoria === c).map((s) => `• ${s.nome}`).join('\n'),
      ).join('\n\n') + '\n\nToque em um serviço para saber mais.',
    );
    this.opcoes.set([
      ...SERVICOS.map((s) => ({ label: s.nome, run: () => this.fluxoServico(s) })),
      this.voltar(),
    ]);
  }

  private fluxoServico(s: Servico): void {
    this.dizer(`${s.nome} (${s.duracao})\n${s.desc}`);
    this.opcoes.set([
      { label: 'Agendar este serviço', run: () => this.irParaFormulario(s.id) },
      { label: 'Outros serviços', run: () => this.fluxoServicos() },
      this.voltar(),
    ]);
  }

  private fluxoAgendar(): void {
    this.dizer('Você pode agendar pelo formulário do site, escolhendo dia e horário, ou enviar o pedido direto pelo WhatsApp.');
    this.opcoes.set([
      { label: 'Abrir o formulário', run: () => this.irParaFormulario() },
      { label: 'Agendar pelo WhatsApp', run: () => this.fluxoPedirNome() },
      this.voltar(),
    ]);
  }

  private fluxoPedirNome(): void {
    this.rascunho = {};
    this.aguardandoNome = true;
    this.opcoes.set([]);
    this.dizer('Qual é o seu nome?');
    setTimeout(() => this.campoRef()?.nativeElement.focus());
  }

  private fluxoEscolherServico(): void {
    const nome = this.rascunho.nome ?? '';
    this.dizer(`Prazer, ${nome}! Qual serviço você quer agendar?`);
    this.opcoes.set(
      SERVICOS.map((s) => ({
        label: s.nome,
        run: () => {
          this.dizer('Ótimo! Toque no botão para enviar o pedido ao WhatsApp. Nossa equipe confirma o horário com você.');
          this.opcoes.set([
            {
              label: 'Enviar pelo WhatsApp',
              href: this.wa.link(`Olá! Me chamo ${nome} e gostaria de agendar ${s.nome}.`),
            },
            this.voltar(),
          ]);
        },
      })),
    );
  }

  private fluxoFuncionamento(): void {
    this.dizer(`${CONFIG.endereco}\n\n${CONFIG.funcionamento.join('\n')}`);
    this.opcoes.set([{ label: 'Agendar horário', run: () => this.fluxoAgendar() }, this.voltar()]);
  }

  private fluxoAtendente(): void {
    this.dizer('Certo! Toque no botão para falar com uma pessoa da nossa equipe no WhatsApp.');
    this.opcoes.set([
      { label: 'Abrir WhatsApp', href: this.wa.link('Olá! Vim pelo site e gostaria de falar com um atendente.') },
      this.voltar(),
    ]);
  }

  /** Entende palavras-chave digitadas pelo visitante. */
  private interpretar(texto: string): void {
    const t = normalizar(texto);
    if (/(atendente|humano|pessoa|falar com)/.test(t)) return this.fluxoAtendente();
    if (/(endereco|onde fica|localizacao|funcionamento|abre|fecha|horario de atendimento)/.test(t)) return this.fluxoFuncionamento();
    if (/(agendar|agendamento|marcar|consulta|avaliacao|horario)/.test(t)) return this.fluxoAgendar();

    const servico = SERVICOS.find((s) => t.includes(normalizar(s.nome)));
    if (servico) return this.fluxoServico(servico);
    if (/(servico|procedimento|tratamento|facial|corporal|laser)/.test(t)) return this.fluxoServicos();

    this.dizer('Não entendi bem. Escolha uma das opções abaixo ou fale com a nossa equipe.');
    this.opcoes.set([
      { label: 'Serviços', run: () => this.fluxoServicos() },
      { label: 'Agendar horário', run: () => this.fluxoAgendar() },
      { label: 'Falar com atendente', run: () => this.fluxoAtendente() },
    ]);
  }
}
