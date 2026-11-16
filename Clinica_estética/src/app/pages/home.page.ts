import { Component } from '@angular/core';
import { AgendamentoComponent } from '../sections/agendamento.component';
import { BlogComponent } from '../sections/blog.component';
import { GaleriaComponent } from '../sections/galeria.component';
import { HeroComponent } from '../sections/hero.component';
import { ServicosComponent } from '../sections/servicos.component';
import { SobreComponent } from '../sections/sobre.component';

@Component({
  selector: 'app-home-page',
  imports: [HeroComponent, ServicosComponent, SobreComponent, GaleriaComponent, AgendamentoComponent, BlogComponent],
  template: `
    <app-hero />
    <app-galeria />
    <app-servicos />
    <app-sobre />
    <app-agendamento />
    <app-blog />
  `,
})
export class HomePage {}
