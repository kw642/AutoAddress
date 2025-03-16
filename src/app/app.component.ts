import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AddressService } from './services/address.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  searchResults: any[] = []; // Array to store the search results
  selectedOption: string = ''; // Stores the currently selected option from search results
  searchQuery: string = ''; // Stores the search input query
  drilldownHeader: string = ''; // Stores the header for drilldown information
  previousLink: string = ''; // Stores the link to go back to previous search results

  constructor(
    private addressService: AddressService, // Injecting AddressService to fetch address data
    private http: HttpClient // Injecting HttpClient to make HTTP requests
  ) {}

  // Method triggered when the user performs a search
  onSearch() {
    this.searchResults = []; // Clear previous search results
    // Make an HTTP request to fetch address data based on the search query
    this.addressService.searchAddress(this.searchQuery).subscribe({
      next: (data: any) => {
        if (data.options) {
          this.formatResults(data); // Format and display the results if options are found
        } else {
          //Clear if no results
          this.drilldownHeader = '';
          this.previousLink = '';
        }
      },
      error: () => {
        this.searchResults = []; // Clear search results if an error occurs
      },
    });
  }

  // Method triggered when a user selects an option from the search results
  onSelectOption(option: any): void {
    // If the option has a 'drilldown' link, set the header accordingly
    if (option && option.link.rel === 'drilldown') {
      this.drilldownHeader = option.link.title.toUpperCase();
    }
    // If the option is not 'lookup', follow the link to fetch more details
    if (option && option.link.rel !== 'lookup') {
      this.http.get<any>(option.link.href).subscribe((newData) => {
        if (newData && newData.options) {
          // If data has options, check if the first option includes the < character which mean it can go back
          if (newData.options[0]?.value.includes('<')) {
            this.previousLink = newData.options[0].link.href;
          }
          this.formatResults(newData); // Format and display results
        }
      });
    } else {
      // If it's a 'lookup' option, play a sound to indicate no further action
      new Audio('/assets/button-sound.mp3').play();
    }
  }

  // Method to navigate back to the previous results
  goBack() {
    // Make an HTTP request to fetch the previous results
    this.http.get<any>(this.previousLink).subscribe((newData) => {
      if (newData && newData.options) {
        this.formatResults(newData); // Format and display the previous search results
        if (this.searchResults[0]?.value.includes('<')) {
          // If the first result includes a '<', update the previous link and header
          this.previousLink = this.searchResults[0].link.href;
          this.drilldownHeader = this.searchResults[0].link.title
            .toUpperCase()
            .replace('<', '');
        } else {
          // Clear the previous link and header if there's no '<' in the first result
          this.drilldownHeader = '';
          this.previousLink = '';
        }
      }
    });
  }

  // Method to clear the current search query and results
  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.drilldownHeader = '';
    this.previousLink = '';
  }

  // Method to format the search results for display
  formatResults(data: any) {
    // Map through the options in the data and format them as needed
    this.searchResults =
      data.options.map((option: any) => {
        let cleanValue = option.value.replace(/</g, ''); // Remove '<' characters from the value
        let parts = cleanValue.split(','); // Split the value by commas

        // If the option value includes '<', make the first part bold
        if (option.value.includes('<')) {
          return {
            ...option,
            formattedValue: `<b>${parts[0]}</b>,${parts.slice(1).join(',')}`,
          };
        } else if (option.value === 'BUSINESS NAMES A - Z') {
          // If the value is 'BUSINESS NAMES A - Z', make the first part bold
          return {
            ...option,
            formattedValue: `<b>${parts[0]}</b>`,
          };
        } else {
          // If there are multiple parts, make the second part bold
          if (parts.length > 1) {
            return {
              ...option,
              formattedValue: `${parts[0]}, <b>${parts[1]}</b>,${parts
                .slice(2)
                .join(',')}`,
            };
          } else {
            return { ...option, formattedValue: cleanValue };
          }
        }
      }) || []; // Ensure an empty array if no options are present
  }
}
