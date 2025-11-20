import { Component, computed, signal, Signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { switchMap, scan, tap } from "rxjs/operators";
import { Product } from "./dto/product.dto";
import { ProductService } from "./services/product.service";
import { ProductApiResponse } from "./dto/product-api-response.dto";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})
export class ProductsComponent {
  private readonly PRODUCTS_PER_PAGE = 12;

  // ÉTAT 1 : Signal mutable pour suivre l'index de départ (le 'skip')
  private skip = signal(0);
  
  // ÉTAT 2 : Signal pour suivre l'état de chargement (utilisé par le template)
  public isLoading = signal(true); 

  // Flux asynchrone principal : Convertit le Signal 'skip' en un Observable pour l'appel API
  private apiResponseSignal = toSignal(
    toObservable(this.skip).pipe(
      
      // Mettre à jour l'état de chargement AVANT l'appel API
      tap(() => this.isLoading.set(true)), 

      // Lance l'appel API à chaque changement de 'skip'
      switchMap((currentSkip) =>
        this.productService.getProducts({
          limit: this.PRODUCTS_PER_PAGE,
          skip: currentSkip,
        })
      ),
      
      // Mettre à jour l'état de chargement APRÈS la réponse API
      tap(() => this.isLoading.set(false)), 

      // Accumule les produits de toutes les réponses API
      scan<ProductApiResponse, ProductApiResponse>(
        (acc, response) => ({
          ...response,
          products: [...acc.products, ...response.products],
        }),
        // Valeur initiale pour l'accumulateur
        { products: [], total: 0, limit: 0, skip: 0 }
      )
    ),
    // Valeur initiale pour toSignal (pour garantir l'existence d'un objet de réponse)
    { initialValue: { products: [], total: 0, limit: 0, skip: 0 } as ProductApiResponse }
  );

  // ÉTAT 3 : Signals dérivés (Computed) - Dérivent leurs valeurs du Signal principal

  // Le Signal contenant le tableau des produits accumulés
  public products: Signal<Product[]> = computed(() => 
    this.apiResponseSignal().products
  );

  // Le Signal du nombre de produits actuellement affichés
  public currentProductCount: Signal<number> = computed(() => 
    this.products().length
  );
  
  // Le Signal qui détermine s'il reste des produits à charger
  public hasMore: Signal<boolean> = computed(() => {
    const response = this.apiResponseSignal();
    // Vrai si le nombre de produits chargés est inférieur au total disponible sur l'API
    return response.products.length < response.total;
  });

  constructor(private productService: ProductService) {}

  // Méthode appelée lors du clic sur "More Products"
  loadMore(): void {
    // Met à jour l'état du signal 'skip', ce qui relance le flux dans toObservable
    this.skip.update((currentSkip) => currentSkip + this.PRODUCTS_PER_PAGE);
  }
}