import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SamegameComponent } from './samegame.component';

describe('SamegameComponent', () => {
  let component: SamegameComponent;
  let fixture: ComponentFixture<SamegameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SamegameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SamegameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
