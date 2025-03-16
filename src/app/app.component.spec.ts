import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AddressService } from './services/address.service';

let component: AppComponent;
let fixture: ComponentFixture<AppComponent>;

let mockAddressService: jasmine.SpyObj<AddressService>;
let mockHttp: jasmine.SpyObj<HttpClient>;

describe('AppComponent', () => {
  beforeEach(async () => {
    mockAddressService = jasmine.createSpyObj('AddressService', [
      'searchAddress',
    ]);
    mockHttp = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        { provide: AddressService, useValue: mockAddressService },
        { provide: HttpClient, useValue: mockHttp },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should fetch and format search results on search', () => {
    const mockData = {
      options: [{ value: "Saint Mary's Road North, East Wall, Dublin 3" }],
    };

    mockAddressService.searchAddress.and.returnValue(of(mockData));
    component.onSearch();
    expect(mockAddressService.searchAddress).toHaveBeenCalled();
  });

  it('should handle option selection and make an HTTP request when needed', () => {
    const mockOption = { link: { rel: 'drilldown', title: 'Some title' } };
    const mockData = { options: [{ value: 'New data' }] };

    mockHttp.get.and.returnValue(of(mockData));

    component.onSelectOption(mockOption);

    expect(component.drilldownHeader).toBe('SOME TITLE');
    expect(mockHttp.get).toHaveBeenCalled();
  });

  it('should go back to the previous results', () => {
    const mockData = { options: [{ value: 'Previous result' }] };
    const mockPreviousLink = 'some/previous/link';

    component.previousLink = mockPreviousLink;
    mockHttp.get.and.returnValue(of(mockData));

    component.goBack();

    expect(mockHttp.get).toHaveBeenCalledWith(mockPreviousLink);
    expect(component.searchResults[0].formattedValue).toContain(
      'Previous result'
    );
  });

  it('should clear the search data', () => {
    component.searchQuery = 'some query';
    component.searchResults = [{ value: 'Result' }];
    component.drilldownHeader = 'Header';
    component.previousLink = 'some/link';

    component.clearSearch();

    expect(component.searchQuery).toBe('');
    expect(component.searchResults.length).toBe(0);
    expect(component.drilldownHeader).toBe('');
    expect(component.previousLink).toBe('');
  });

  it('should format search results correctly', () => {
    const mockData = {
      options: [
        { value: "Saint Mary's Road North, East Wall, Dublin 3" },
        { value: 'BUSINESS NAMES A - Z' },
      ],
    };

    component.formatResults(mockData);

    expect(component.searchResults[0].formattedValue).toContain(
      "Saint Mary's Road North, <b> East Wall</b>, Dublin 3"
    );
    expect(component.searchResults[1].formattedValue).toContain(
      '<b>BUSINESS NAMES A - Z</b>'
    );
  });
});
