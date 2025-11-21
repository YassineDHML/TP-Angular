import { Component, inject, OnInit, DestroyRef } from "@angular/core";
import { AbstractControl, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CvService } from "../services/cv.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { APP_ROUTES } from "src/config/routes.config";
import { Cv } from "../model/cv";
import { JsonPipe } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { startWith, debounceTime } from "rxjs";

// Clé de stockage pour le brouillon dans localStorage
const FORM_DRAFT_KEY = 'addCvFormDraft';

@Component({
  selector: "app-add-cv",
  templateUrl: "./add-cv.component.html",
  styleUrls: ["./add-cv.component.css"],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, JsonPipe],
})
export class AddCvComponent implements OnInit {
  // Injection des services
  private cvService = inject(CvService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  // Formulaire réactif
  form = this.formBuilder.group({
    name: ["", Validators.required],
    firstname: ["", Validators.required],
    path: [""],
    job: ["", Validators.required],
    cin: ["", [Validators.required, Validators.pattern("[0-9]{8}")]],
    age: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    // 1. Charger le brouillon depuis localStorage si existant
    this.loadFormDraft();

    // 2. Désactiver/activer le champ 'path' selon l'âge
    this.age.valueChanges
      .pipe(
        startWith(this.age.value),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((ageValue) => {
        const numericAge = Number(ageValue);
        if (!Number.isFinite(numericAge) || numericAge < 18) {
          this.path?.setValue("", { emitEvent: false }); 
          this.path?.disable({ emitEvent: false });
        } else {
          this.path?.enable({ emitEvent: false });
        }
      });

    // 3. Sauvegarde automatique du brouillon
    this.form.valueChanges
      .pipe(
        debounceTime(500),           // attend 500ms sans changement pour optimiser
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.form.value) {
          localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(this.form.getRawValue()));
        }
      });
  }

  /**
   * Charger le brouillon depuis localStorage
   */
  private loadFormDraft(): void {
    const draft = localStorage.getItem(FORM_DRAFT_KEY);
    if (draft) {
      try {
        const savedValue = JSON.parse(draft);
        // patchValue pour charger sans déclencher valueChanges
        this.form.patchValue(savedValue, { emitEvent: false });
        this.toastr.info("Brouillon de CV récupéré automatiquement.", "Chargement");
      } catch (e) {
        console.error("Erreur lors du chargement du brouillon :", e);
        localStorage.removeItem(FORM_DRAFT_KEY);
      }
    }
  }

  /**
   * Ajouter un CV
   */
  addCv() {
    const cvToAdd = this.form.getRawValue();

    // Assurer que path est vide si mineur
    if ((cvToAdd.age ?? 0) < 18) {
      cvToAdd.path = "";
    }

    this.cvService.addCv(cvToAdd as Cv).subscribe({
      next: (cv) => {
        localStorage.removeItem(FORM_DRAFT_KEY); // nettoyer le brouillon
        this.router.navigate([APP_ROUTES.cv]);
        this.toastr.success(`Le cv ${cv.firstname} ${cv.name} a été ajouté`);
      },
      error: () => {
        this.toastr.error("Une erreur s'est produite. Veuillez contacter l'admin");
      },
    });
  }

  // Getters pour un accès simple aux FormControls
  get name(): AbstractControl { return this.form.get("name")!; }
  get firstname(): AbstractControl { return this.form.get("firstname")!; }
  get age(): AbstractControl { return this.form.get("age")!; }
  get job(): AbstractControl { return this.form.get("job")!; }
  get path(): AbstractControl { return this.form.get("path")!; }
  get cin(): AbstractControl { return this.form.get("cin")!; }
}
