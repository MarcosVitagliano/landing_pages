import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWidgetComponent } from './chat/chat-widget.component';
import { FooterComponent } from './layout/footer.component';
import { HeaderComponent } from './layout/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatWidgetComponent],
  templateUrl: './app.html',
})
export class App {}
