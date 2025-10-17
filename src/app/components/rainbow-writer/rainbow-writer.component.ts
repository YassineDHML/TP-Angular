import { Component } from '@angular/core';
import { RainbowInputDirective } from '../../directives/rainbow-input.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rainbow-writer',
  standalone: true,
  imports: [CommonModule, RainbowInputDirective],
  templateUrl: './rainbow-writer.component.html',
  styleUrls: ['./rainbow-writer.component.css']
})
export class RainbowWriterComponent {
 
  title = 'Simulateur d\'écriture Arc-en-Ciel';
  
  
  resetInput(inputElement: HTMLInputElement) {
    inputElement.value = '';
    // Réinitialiser aussi les couleurs si nécessaire
    inputElement.style.color = '#000000';
    inputElement.style.borderColor = '#CCCCCC';
  }
}