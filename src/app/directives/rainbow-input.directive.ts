import { 
  Directive, 
  ElementRef, 
  HostListener,
  signal,
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

  // Signaux pour les couleurs
  color = signal('#000000');
  borderColor = signal('#CCCCCC');

  ngOnInit() {
    // Initialiser avec une couleur par défaut
    this.changeColor();
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    // Changer la couleur à chaque frappe de touche
    this.changeColor();
  }

  @HostListener('focus')
  onFocus() {
    // Effet visuel supplémentaire au focus
    this.elementRef.nativeElement.style.transform = 'translateY(-2px)';
    this.elementRef.nativeElement.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
  }

  @HostListener('blur')
  onBlur() {
    // Réinitialiser les effets au blur
    this.elementRef.nativeElement.style.transform = 'translateY(0)';
    this.elementRef.nativeElement.style.boxShadow = 'none';
  }

  private changeColor(): void {
    const randomIndex = Math.floor(Math.random() * this.colors.length);
    const randomColor = this.colors[randomIndex];
    
    // Mettre à jour les signaux
    this.color.set(randomColor);
    this.borderColor.set(randomColor);
    
    // Appliquer les styles directement via le native element
    const element = this.elementRef.nativeElement;
    element.style.color = this.color();
    element.style.borderColor = this.borderColor();
    element.style.transition = 'all 0.3s ease';
  }

  // Méthode publique pour réinitialiser depuis le composant
  resetColors(): void {
    this.color.set('#000000');
    this.borderColor.set('#CCCCCC');
    
    const element = this.elementRef.nativeElement;
    element.style.color = this.color();
    element.style.borderColor = this.borderColor();
  }
}