import { Directive, ElementRef, inject, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[ngRequiredLabel]',
})
export class RequiredLabel {
  private readonly elementRef = inject(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly renderer = inject(Renderer2);

  constructor() {}

  ngOnInit(): void {
    if (this.ngControl && this.ngControl.control) {
      // We now have access to the AbstractControl instance
      const control = this.ngControl.control;
      console.log('Associated FormControl:', control);
    }
  }
}
