import { Component, inject } from "@angular/core";
import { FormBuilder, AbstractControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged, switchMap, tap, of, catchError, startWith } from "rxjs";
import { CvService } from "../services/cv.service";
import { Cv } from "../model/cv";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-autocomplete",
    templateUrl: "./autocomplete.component.html",
    styleUrls: ["./autocomplete.component.css"],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule],
})
export class AutocompleteComponent {
  formBuilder = inject(FormBuilder);
  cvService = inject(CvService);
  
  // Formulaire réactif avec un champ de recherche
  form = this.formBuilder.group({ search: [""] });
  
  // Getter pour faciliter l'accès au contrôle de recherche
  get search(): AbstractControl {
    return this.form.get("search")!;
  }
  
  // CV sélectionné à afficher
  selectedCv: Cv | null = null;
  
  // Flux réactif des CVs filtrés basé sur la recherche
  // Optimisé pour minimiser les appels HTTP
  filteredCvs$ = this.search.valueChanges.pipe(
    startWith(''), // Commence avec une valeur vide pour afficher tous les CVs au départ
    debounceTime(300), // Attend 300ms après la dernière frappe avant de lancer la recherche
    distinctUntilChanged(), // Ne lance la recherche que si la valeur a changé
    tap(() => this.selectedCv = null), // Réinitialise le CV sélectionné à chaque nouvelle recherche
    switchMap(searchTerm => {
      // Si le champ est vide, retourner un tableau vide (pas d'appel HTTP)
      if (!searchTerm || searchTerm.trim() === '') {
        return of([]);
      }
      // Sinon, appeler l'API avec le filtre
      return this.cvService.selectByName(searchTerm).pipe(
        catchError(err => {
          console.error('Erreur lors de la recherche:', err);
          return of([]); // Retourner un tableau vide en cas d'erreur
        })
      );
    })
  );
  
  /**
   * Sélectionne un CV et l'affiche
   * @param cv Le CV sélectionné
   */
  selectCv(cv: Cv): void {
    this.selectedCv = cv;
    // Optionnel: Mettre à jour le champ de recherche avec le nom complet
    this.search.setValue(`${cv.firstname} ${cv.name}`, { emitEvent: false });
    // Notifier le service de la sélection (pour d'autres composants qui écoutent)
    this.cvService.selectCv(cv);
  }
  
  /**
   * Réinitialise la recherche et la sélection
   */
  clearSelection(): void {
    this.selectedCv = null;
    this.search.setValue('', { emitEvent: true });
  }
}
