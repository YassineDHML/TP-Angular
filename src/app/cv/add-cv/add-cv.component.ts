import { Component, inject, OnInit, DestroyRef } from "@angular/core";
import { AbstractControl, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CvService } from "../services/cv.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { APP_ROUTES } from "src/config/routes.config";
import { Cv } from "../model/cv";
import { JsonPipe } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { startWith } from "rxjs";

@Component({
  selector: "app-add-cv",
  templateUrl: "./add-cv.component.html",
  styleUrls: ["./add-cv.component.css"],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, JsonPipe],
})
export class AddCvComponent implements OnInit {
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
    // Surveille les changements de l'âge
    this.age.valueChanges
      .pipe(
        startWith(this.age.value), // déclenche la logique pour l'état initial
        takeUntilDestroyed(this.destroyRef)       // évite les fuites mémoire
      )
      .subscribe((ageValue) => {
        const numericAge = Number(ageValue);
        if (!Number.isFinite(numericAge) || numericAge < 18) {
          this.path?.setValue("");
          this.path?.disable();
        } else {
          this.path?.enable();
        }
      });
  }

  // Méthode pour ajouter un CV
  addCv() {
    this.cvService.addCv(this.form.value as Cv).subscribe({
      next: (cv) => {
        this.router.navigate([APP_ROUTES.cv]);
        this.toastr.success(`Le cv ${cv.firstname} ${cv.name} a été ajouté`);
      },
      error: () => {
        this.toastr.error("Une erreur s'est produite. Veuillez contacter l'admin");
      },
    });
  }

  // Getters pour accéder facilement aux FormControls
  get name(): AbstractControl {
    return this.form.get("name")!;
  }
  get firstname(): AbstractControl {
    return this.form.get("firstname")!;
  }
  get age(): AbstractControl {
    return this.form.get("age")!;
  }
  get job(): AbstractControl {
    return this.form.get("job")!;
  }
  get path(): AbstractControl {
    return this.form.get("path")!;
  }
  get cin(): AbstractControl {
    return this.form.get("cin")!;
  }
}
