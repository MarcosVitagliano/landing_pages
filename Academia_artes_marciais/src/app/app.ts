import { Component } from '@angular/core';
import { ChatWidgetComponent } from './chat/chat-widget.component';
import { FooterComponent } from './layout/footer.component';
import { HeaderComponent } from './layout/header.component';
import { GaleriaComponent } from './sections/galeria.component';
import { HeroComponent } from './sections/hero.component';
import { HorariosComponent } from './sections/horarios.component';
import { ModalidadesComponent } from './sections/modalidades.component';
import { PlanosComponent } from './sections/planos.component';
import { SobreComponent } from './sections/sobre.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    HeroComponent,
    ModalidadesComponent,
    SobreComponent,
    HorariosComponent,
    PlanosComponent,
    GaleriaComponent,
    FooterComponent,
    ChatWidgetComponent,
  ],
  templateUrl: './app.html',
})
export class App {}
