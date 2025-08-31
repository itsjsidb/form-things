import {
  Directive,
  ElementRef,
  inject,
  isDevMode,
  Renderer2,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { startWith, Subscription } from 'rxjs';

/**
 * @brief Angular directive that automatically appends a required asterisk to associated label(s) for a form control with required validation.
 *
 * - Dynamically tracks status changes to update the required indicator.
 * - Appends <span class="required-indicator" aria-hidden="true"> *</span> to label elements.
 * - Follows accessibility and best practice patterns for Angular 20.
 *
 * @usage
 * ```
 * <input ngRequiredLabel formControlName="myField" id="myFieldId" />
 * <label for="myFieldId">My Field</label>
 * ```
 */
@Directive({
  selector: '[ngRequiredLabel]',
})
export class RequiredLabel implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly renderer = inject(Renderer2);
  private asteriskSpan: HTMLElement | null = null;
  private status$?: Subscription;

  /**
   * @brief Initializes the directive, subscribing to form control status changes.
   */
  ngOnInit(): void {
    if (!this.ngControl?.control) {
      return;
    }
    this.status$ = this.ngControl.control.statusChanges
      .pipe(startWith(this.ngControl.control.status))
      .subscribe(() => this.updateLabel());
  }

  /**
   * @brief Cleans up the subscription to status changes on destroy.
   */
  ngOnDestroy(): void {
    this.status$?.unsubscribe();
  }

  /**
   * @brief Updates the associated label(s) by toggling the required asterisk and aria-required attribute.
   */
  private updateLabel(): void {
    const isRequired = this.hasRequiredValidator();
    const hostElement = this.elementRef.nativeElement;
    const associatedLabels = this.findAssociatedLabels(hostElement);

    // Warn in development if labels are missing.
    if (associatedLabels.length === 0 && isDevMode()) {
      console.warn(
        'RequiredLabelDirective: No associated label found for the form control.',
        hostElement
      );
      return;
    }

    if (isRequired) {
      this.renderer.setAttribute(hostElement, 'aria-required', 'true');
      if (!this.asteriskSpan) {
        this.asteriskSpan = this.renderer.createElement('span');
        this.renderer.setAttribute(this.asteriskSpan, 'aria-hidden', 'true');
        this.renderer.addClass(this.asteriskSpan, 'required-indicator');
        const asteriskText = this.renderer.createText(' *');
        this.renderer.appendChild(this.asteriskSpan, asteriskText);
      }
      // Add to each associated label if not present
      associatedLabels.forEach((label) => {
        if (!label.contains(this.asteriskSpan)) {
          this.renderer.appendChild(label, this.asteriskSpan);
        }
      });
    } else {
      this.renderer.removeAttribute(hostElement, 'aria-required');
      if (this.asteriskSpan) {
        associatedLabels.forEach((label) => {
          if (label.contains(this.asteriskSpan)) {
            this.renderer.removeChild(label, this.asteriskSpan);
          }
        });
        this.asteriskSpan = null;
      }
    }
  }

  /**
   * @brief Retrieves label(s) associated with the host element via native property or for attribute.
   * @param element HTMLElement to find labels for.
   * @return Associated label elements.
   */
  private findAssociatedLabels(element: HTMLElement): HTMLElement[] {
    // Primary: native labels property
    if ('labels' in element && (element as HTMLInputElement).labels) {
      const labels = Array.from((element as HTMLInputElement).labels as NodeListOf<HTMLElement>);
      if (labels.length > 0) return labels;
    }
    // Fallback: search by 'for' attribute
    if (element.id) {
      const matchingLabels = document.querySelectorAll<HTMLElement>(`label[for="${element.id}"]`);
      if (matchingLabels.length > 0) return Array.from(matchingLabels);
    }
    return [];
  }

  /**
   * @brief Determines whether the attached form control has a required validator.
   * @return True if required validator is present; otherwise false.
   */
  private hasRequiredValidator(): boolean {
    if (!this.ngControl?.control?.validator) return false;
    const validator = this.ngControl.control.validator({} as AbstractControl);
    return !!(validator && (validator as Record<string, any>)['required']);
  }
}
