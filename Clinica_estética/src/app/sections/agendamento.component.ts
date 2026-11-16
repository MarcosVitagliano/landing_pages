import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CONFIG } from '../core/config';
import { SERVICOS, formatarData, hojeISO, slotsDoDia } from '../core/data';
import { WhatsappService } from '../core/whatsapp.service';

/** Validador próprio: a data não pode estar no passado nem ser domingo (clínica fechada). */
function diaDisponivel(c: AbstractControl): ValidationErrors | null {
  const v = c.value as string;
  if (!v) return null;
  if (v < hojeISO()) return { passado: true };
  const [a, m, d] = v.split('-').map(Number);
  return new Date(a, m - 1, d).getDay() === 0 ? { domingo: true } : null;
}

@Component({
  selector: 'app-agendamento',
  imports: [ReactiveFormsModule],
  host: { class: 'block' },
  template: `
    <section id="agendar" class="py-24 bg-white">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-5 gap-12 lg:gap-16">

        <div class="lg:col-span-2">
          <h2 class="font-display text-4xl sm:text-5xl font-light">Agende o seu horário</h2>
          <p class="text-muted text-lg mt-5 leading-relaxed">Escolha o serviço, o dia e o horário. Enviamos o seu pedido pelo WhatsApp e a equipe confirma com você.</p>
          <ol class="mt-8 space-y-5">
            @for (p of passos; track p.n) {
              <li class="flex gap-4">
                <span class="w-9 h-9 shrink-0 rounded-full bg-brand-soft text-brand-dark font-medium flex items-center justify-center">{{ p.n }}</span>
                <p class="text-muted pt-1.5">{{ p.texto }}</p>
              </li>
            }
          </ol>
          <div class="mt-10 p-6 rounded-3xl bg-cream border border-line text-sm text-muted">
            <p class="font-medium text-ink mb-2">Horário de atendimento</p>
            @for (h of funcionamento; track h) {
              <p>{{ h }}</p>
            }
          </div>
        </div>

        <div class="lg:col-span-3">
          @if (enviado()) {
            <div class="bg-blush rounded-3xl p-10 text-center" role="status">
              <i class="fa-regular fa-circle-check text-5xl text-brand mb-5 block" aria-hidden="true"></i>
              <h3 class="font-display text-3xl font-light mb-3">Pedido enviado!</h3>
              <p class="text-wine/80 mb-8">Abrimos o WhatsApp com o seu pedido. Assim que enviar a mensagem, nossa equipe confirma o horário com você.</p>
              <button type="button" (click)="novo()" class="border border-wine text-wine font-medium px-7 py-3 rounded-full hover:bg-wine hover:text-white transition">Fazer outro agendamento</button>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="enviar()" novalidate class="bg-cream rounded-3xl p-6 sm:p-10 border border-line space-y-6">

              <div class="grid sm:grid-cols-2 gap-6">
                <div>
                  <label for="ag-nome" class="block text-sm font-medium mb-2">Nome</label>
                  <input id="ag-nome" type="text" formControlName="nome" autocomplete="name"
                         [class]="invalido('nome') ? campoErro : campo">
                  @if (invalido('nome')) { <p class="text-sm text-red-700 mt-1.5">Informe seu nome (mínimo 3 letras).</p> }
                </div>
                <div>
                  <label for="ag-tel" class="block text-sm font-medium mb-2">Telefone / WhatsApp</label>
                  <input id="ag-tel" type="tel" formControlName="telefone" autocomplete="tel" placeholder="(11) 99999-9999"
                         [class]="invalido('telefone') ? campoErro : campo">
                  @if (invalido('telefone')) { <p class="text-sm text-red-700 mt-1.5">Informe um telefone com DDD.</p> }
                </div>
              </div>

              <div>
                <label for="ag-servico" class="block text-sm font-medium mb-2">Serviço</label>
                <select id="ag-servico" formControlName="servico" [class]="invalido('servico') ? campoErro : campo">
                  <option value="">Selecione um serviço</option>
                  @for (s of servicos; track s.id) {
                    <option [value]="s.id">{{ s.nome }} ({{ s.duracao }})</option>
                  }
                </select>
                @if (invalido('servico')) { <p class="text-sm text-red-700 mt-1.5">Escolha um serviço.</p> }
              </div>

              <div>
                <label for="ag-data" class="block text-sm font-medium mb-2">Data</label>
                <input id="ag-data" type="date" formControlName="data" [min]="hoje"
                       [class]="invalido('data') ? campoErro : campo">
                @if (invalido('data')) {
                  <p class="text-sm text-red-700 mt-1.5">
                    @if (form.controls.data.hasError('domingo')) { Não atendemos aos domingos. Escolha outro dia. }
                    @else if (form.controls.data.hasError('passado')) { Escolha uma data a partir de hoje. }
                    @else { Escolha a data do atendimento. }
                  </p>
                }
              </div>

              <fieldset>
                <legend class="block text-sm font-medium mb-2">Horário</legend>
                @if (!dataSel() || form.controls.data.invalid) {
                  <p class="text-sm text-muted">Escolha uma data válida para ver os horários disponíveis.</p>
                } @else if (slots().length === 0) {
                  <p class="text-sm text-muted">Não há mais horários disponíveis neste dia. Escolha outra data.</p>
                } @else {
                  <div class="flex flex-wrap gap-2">
                    @for (h of slots(); track h) {
                      <button type="button" (click)="escolherHorario(h)" [attr.aria-pressed]="form.controls.horario.value === h"
                              class="px-4 py-2.5 rounded-full text-sm font-medium border transition"
                              [class]="form.controls.horario.value === h ? 'bg-wine text-white border-wine' : 'bg-white border-line hover:border-ink'">{{ h }}</button>
                    }
                  </div>
                }
                @if (invalido('horario') && slots().length > 0) { <p class="text-sm text-red-700 mt-2">Escolha um horário.</p> }
              </fieldset>

              <div>
                <label for="ag-obs" class="block text-sm font-medium mb-2">Observações <span class="text-muted font-normal">(opcional)</span></label>
                <textarea id="ag-obs" formControlName="obs" rows="3" [class]="campo"></textarea>
              </div>

              <button type="submit" class="w-full bg-brand hover:bg-brand-dark text-white font-medium py-4 rounded-full transition">
                <i class="fa-brands fa-whatsapp mr-2" aria-hidden="true"></i>Enviar pedido pelo WhatsApp
              </button>
              <p class="text-xs text-muted text-center">O horário só é confirmado após o retorno da nossa equipe.</p>
            </form>
          }
        </div>
      </div>
    </section>
  `,
})
export class AgendamentoComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly doc = inject(DOCUMENT);
  private readonly wa = inject(WhatsappService);

  protected readonly servicos = SERVICOS;
  protected readonly funcionamento = CONFIG.funcionamento;
  protected readonly hoje = hojeISO();
  protected readonly enviado = signal(false);

  protected readonly passos = [
    { n: 1, texto: 'Escolha o serviço e a data.' },
    { n: 2, texto: 'Selecione um horário disponível.' },
    { n: 3, texto: 'Envie o pedido e aguarde a confirmação pelo WhatsApp.' },
  ];

  protected readonly campo =
    'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none';
  protected readonly campoErro =
    'w-full rounded-xl border border-red-400 bg-white px-4 py-3 text-sm focus:outline-none';

  protected readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    telefone: ['', [Validators.required, Validators.pattern(/^\D*(\d\D*){10,11}$/)]],
    servico: ['', Validators.required],
    data: ['', [Validators.required, diaDisponivel]],
    horario: ['', Validators.required],
    obs: [''],
  });

  /** O valor da data como signal, para calcular os horários de forma reativa. */
  protected readonly dataSel = toSignal(this.form.controls.data.valueChanges, { initialValue: '' });
  protected readonly slots = computed(() => {
    const d = this.dataSel();
    return d && this.form.controls.data.valid ? slotsDoDia(d) : [];
  });

  constructor() {
    // Trocar a data limpa o horário escolhido.
    this.form.controls.data.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.horario.reset(''));

    // Vindo de um card de serviço (?servico=peeling), já seleciona o serviço.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const id = p.get('servico');
      if (id && SERVICOS.some((s) => s.id === id)) this.form.controls.servico.setValue(id);
    });
  }

  protected invalido(nome: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[nome];
    return c.invalid && (c.touched || c.dirty);
  }

  protected escolherHorario(h: string): void {
    this.form.controls.horario.setValue(h);
    this.form.controls.horario.markAsTouched();
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const servico = SERVICOS.find((s) => s.id === v.servico);
    const linhas = [
      `Olá! Gostaria de agendar ${servico?.nome ?? 'um atendimento'}.`,
      `Data: ${formatarData(v.data, true)} às ${v.horario}`,
      `Nome: ${v.nome}`,
      `Telefone: ${v.telefone}`,
      v.obs.trim() ? `Observações: ${v.obs.trim()}` : '',
    ].filter(Boolean);

    this.doc.defaultView?.open(this.wa.link(linhas.join('\n')), '_blank', 'noopener');
    this.enviado.set(true);
  }

  protected novo(): void {
    this.form.reset();
    this.enviado.set(false);
  }
}
