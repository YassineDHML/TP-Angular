import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RainbowWriterComponent } from './rainbow-writer.component';

describe('RainbowWriterComponent', () => {
  let component: RainbowWriterComponent;
  let fixture: ComponentFixture<RainbowWriterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RainbowWriterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RainbowWriterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
