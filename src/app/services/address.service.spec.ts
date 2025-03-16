import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AddressService } from './address.service';

describe('AddressService', () => {
  let service: AddressService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddressService],
    });

    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return data when searchAddress is called', () => {
    const mockResponse = { options: [{ value: 'Address 1' }] };

    service.searchAddress('Test query').subscribe((data) => {
      expect(data.options).toEqual([{ value: 'Address 1' }]);
    });

    const req = httpMock.expectOne(
      `${service.apiUrl}?address=Test query&key=${service.apiKey}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
