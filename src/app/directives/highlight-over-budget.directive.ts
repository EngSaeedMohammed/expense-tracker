import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appHighlightOverBudget]',
})
export class HighlightOverBudgetDirective {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly amount = input.required<number>({ alias: 'appHighlightOverBudget' });
  readonly threshold = input(100);

  constructor() {
    effect(() => {
      const overBudget = this.amount() > this.threshold();
      this.host.nativeElement.style.backgroundColor = overBudget ? '#ffe4d6' : '';
    });
  }
}
