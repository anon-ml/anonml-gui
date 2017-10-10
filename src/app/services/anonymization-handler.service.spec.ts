import { TestBed, inject } from '@angular/core/testing';

import { AnonymizationHandlerService } from './anonymization-handler.service';

describe('AnonymizationHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnonymizationHandlerService]
    });
  });

  it('should be created', inject([AnonymizationHandlerService], (service: AnonymizationHandlerService) => {
    expect(service).toBeTruthy();
  }));
});
