import { RequiredLabel } from './../../../form-things/src/lib/directives/required-label';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, RequiredLabel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('demo-form-things');
  nameControl = new FormControl('', Validators.required);
}
