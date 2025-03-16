import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AddressService {
  apiKey = 'pub_99d490b7-e1ea-4c6d-9313-b2dc755c614a';
  apiUrl = 'https://api.autoaddress.com/3.0/autocomplete';

  constructor(private http: HttpClient) {}

  searchAddress(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?address=${query}&key=${this.apiKey}`);
  }
}
