import { Pipe, PipeTransform } from '@angular/core';

const fibonnaci = (n: number): number => {
  if (n == 1 || n == 0) return 1;
  return fibonnaci(n - 1) + fibonnaci(n - 2);
};

@Pipe({
  name: 'fibo',
  pure: true // Garantit la Memoization
})
export class FiboPipe implements PipeTransform {
  transform(n: number): number {
    console.log(`Calcul Fibo pour ${n}`);
    return fibonnaci(n);
  }
}