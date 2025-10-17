import { 
  Directive, 
  ElementRef, 
  HostListener, 
  HostBinding,
  OnInit,
  inject 
} from '@angular/core';

@Directive({
  selector: 'input[rainbowInput]',
  standalone: true
})
export class RainbowInputDirective implements OnInit {
  private elementRef = inject(ElementRef);
  
  // Tableau de couleurs arc-en-ciel
  private colors: string[] = [
    '#FF0000', // Rouge
    '#FF7F00', // Orange
    '#FFFF00', // Jaune
    '#00FF00', // Vert
    '#0000FF', // Bleu
    '#4B0082', // Indigo
    '#9400D3'  // Violet
  ];

  // HostBinding pour la couleur du texte
  @HostBinding('style.color')
  color!: string;

  // HostBinding pour la couleur de la bordure
  @HostBinding('style.borderColor')
  borderColor!: string;

  ngOnInit() {
    // Initialiser avec une couleur par défaut
    this.changeColor();
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    // Changer la couleur à chaque frappe de touche
    this.changeColor();
  }

  private changeColor(): void {
    const randomIndex = Math.floor(Math.random() * this.colors.length);
    const randomColor = this.colors[randomIndex];
    
    this.color = randomColor;
    this.borderColor = randomColor;
  }
}