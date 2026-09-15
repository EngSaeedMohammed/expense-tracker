import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notFutureDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) {
      return null;
    }

    const selected = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selected > today ? { futureDate: true } : null;
  };
}
