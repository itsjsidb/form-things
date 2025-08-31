import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormThings } from './form-things';

describe('FormThings', () => {
  let component: FormThings;
  let fixture: ComponentFixture<FormThings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormThings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormThings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
