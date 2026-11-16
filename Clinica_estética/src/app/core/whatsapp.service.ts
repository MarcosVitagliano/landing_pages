import { Injectable } from '@angular/core';
import { CONFIG } from './config';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  /** Link wa.me com a mensagem já preenchida (e codificada). */
  link(mensagem: string): string {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
  }
}
