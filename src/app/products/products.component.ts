import { Component } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  concatMap,
  map,
  takeWhile,
  scan,
  shareReplay,
} from "rxjs";
import { Product } from "./dto/product.dto";
import { ProductService } from "./services/product.service";
import { Settings } from "./dto/product-settings.dto";
import { ProductApiResponse } from "./dto/product-api-response.dto";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})

export class ProductsComponent {
  private readonly PRODUCTS_PER_PAGE = 12;

  // Trigger pour charger plus de produits
  private loadMore$$ = new BehaviorSubject<number>(0);

  // Flux principal des produits
  private apiResponse$: Observable<ProductApiResponse>;

  products$: Observable<Product[]>;
  currentProductCount$: Observable<number>;
  hasMore$: Observable<boolean>;

  constructor(private productService: ProductService) {
    // 1) Un seul flux API (accumulation + pagination)

    //Etape A: Lancer les requêtes API à chaque loadMore$$
    this.apiResponse$ = this.loadMore$$.pipe(
      concatMap((skip) =>
        this.productService.getProducts({
          limit: this.PRODUCTS_PER_PAGE,
          skip: skip,
        })
      ),

      // Etape B: Accumuler les résultats
      scan<ProductApiResponse, ProductApiResponse>(
        (acc, response) => ({
          ...response,
          products: [...acc.products, ...response.products],
        }),
        { products: [], total: 0, limit: 0, skip: 0 }
      ),

      //Etape C (IMPORTANT): Partage le résultat avec les autres abonnés sans relancer la requête
      shareReplay(1)
    );

    // 2) Liste des produits
    this.products$ = this.apiResponse$.pipe(map((r) => r.products));

    // 3) Nombre total affiché
    this.currentProductCount$ = this.products$.pipe(map((p) => p.length));

    // 4) Indique s’il reste des produits
    this.hasMore$ = this.apiResponse$.pipe(
      map((response) => response.products.length < response.total)
    );
  }

  // Méthode pour charger plus
  loadMore(): void {
    this.loadMore$$.next(
      this.loadMore$$.value + this.PRODUCTS_PER_PAGE
    );
  }
}

