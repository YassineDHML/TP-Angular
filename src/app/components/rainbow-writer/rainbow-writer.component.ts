import { Component, ViewChildren, QueryList, signal, computed } from '@angular/core';
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
  // Signaux pour le state
  title = 'Simulateur d\'écriture Arc-en-Ciel avec Signaux';
  characterCount = signal(0);
  isResetting = signal(false);

  // Computed values
  showResetMessage = computed(() => this.characterCount() > 10);
  resetButtonText = computed(() => 
    this.isResetting() ? 'Réinitialisation...' : '🔄 Réinitialiser tout'
  );

  // Références aux directives
  @ViewChildren(RainbowInputDirective) rainbowInputs!: QueryList<RainbowInputDirective>;

  // Méthode pour réinitialiser un input spécifique
  resetInput(inputElement: HTMLInputElement, directive?: RainbowInputDirective): void {
    inputElement.value = '';
    this.characterCount.set(0);
    
    if (directive) {
      directive.resetColors();
    } else {
      // Fallback si la directive n'est pas disponible
      inputElement.style.color = '#000000';
      inputElement.style.borderColor = '#CCCCCC';
    }
  }

  // Méthode pour réinitialiser tous les inputs
  resetAllInputs(): void {
    this.isResetting.set(true);
    
    // Réinitialiser via les directives
    this.rainbowInputs.forEach(directive => {
      directive.resetColors();
    });

    // Réinitialiser les valeurs des inputs
    const inputs = document.querySelectorAll('input[rainbowInput]');
    inputs.forEach((input: any) => {
      input.value = '';
    });

    this.characterCount.set(0);

    // Reset le state après un délai
    setTimeout(() => {
      this.isResetting.set(false);
    }, 1000);
  }

  // Méthode pour suivre le nombre de caractères
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.characterCount.set(input.value.length);
  }

  // Méthode pour obtenir la couleur actuelle (demo des signaux)
  getCurrentColorInfo(): string {
    return this.characterCount() > 0 
      ? `Vous avez tapé ${this.characterCount()} caractère(s) avec des signaux !` 
      : 'Commencez à taper pour voir les signaux en action';
  }
}