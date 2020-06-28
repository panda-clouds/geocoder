/* eslint-disable no-loop-func, consistent-return */

const PCNodeGeocoder = require('node-geocoder');
const PCAddressFormatter = require('@panda-clouds/address-formatter');
const NotFoundError = 'We couldn\'t find that address. Please double check and try again';
const RateLimitError = 'Our servers are recieving too much traffic right now, please try again in 1 minute.';

class PCGeocoder {
	constructor() {
		// Empty Constructor
	}
	static streetFromNumberAndName(number, name) {
		let best = '';

		if (number && name) {
			// most return seperated
			best = number + ' ' + name;
		} else if (name) {
			// mapquest only returns 'name'
			best = name;
		} else if (number) {
			// not likely
			best = number;
		}

		// no results
		return PCAddressFormatter.street(best);
	}
	// primaryProviders are attemped before 'free services'
	primaryProviders(input) {
		// geo.primaryProviders( [{provider:'locationiq',apiKey:'abc123'},{provider:'google',apiKey:'def345'}] )
		this.primaryProvidersArray = input;
	}

	// backupProviders are attemped after 'free services'
	backupProviders(input) {
		// geo.backupProviders( [{provider:'locationiq',apiKey:'abc123'},{provider:'google',apiKey:'def345'}] )
		this.backupProvidersArray = input;
	}

	// Used for:
	// A. testing individual services
	// B. people who dont want to use free services
	disableFreeServices(input) {
		// geo.blockFreeServices(true)
		this.disableFreeServices = input;
	}

	_getProviders() {
		let all = [];

		// try Primary Providers first
		if (this.primaryProvidersArray) {
			all = all.concat(this.primaryProvidersArray);
		}

		if (this.disableFreeServices !== true) {
			// then try free services 3x
			all.push({ provider: 'openstreetmap' });
			all.push({ provider: 'openstreetmap' });
			all.push({ provider: 'openstreetmap' });
			// datasciencetoolkit doesnt work
			// all.push({ provider: 'datasciencetoolkit'})
		}

		// then try backup services
		if (this.backupProvidersArray) {
			all = all.concat(this.backupProvidersArray);
		}

		return all;
	}

	generic(input) {
		this.genericValue = input;
	}

	combined() {
		let returnValue = '';

		if (this.genericValue) {
			returnValue += this.genericValue + ' ';
		}

		if (this.streetValue) {
			returnValue += this.streetValue + ' ';
		}

		if (this.cityValue) {
			returnValue += this.cityValue + ' ';
		}

		if (this.stateValue) {
			returnValue += this.stateValue + ' ';
		}

		if (this.countryValue) {
			returnValue += this.countryValue + ' ';
		}

		if (this.zipcodeValue) {
			returnValue += this.zipcodeValue + ' ';
		}

		return returnValue.trim(); // .trim() removes extra spaces
	}

	street(input) {
		this.streetValue = input;
	}

	city(input) {
		this.cityValue = input;
	}

	state(input) {
		this.stateValue = input;
	}

	country(input) {
		this.countryValue = input;
	}

	zipcode(input) {
		this.zipcodeValue = input;
	}

	addressObjectForOptions(options) {
		const addrObject = {};

		if (options.provider === 'openstreetmap') {
			// here requires 'c' instead of 'street'
			if (this.streetValue) {
				addrObject.street = this.streetValue;
			}

			if (this.cityValue) {
				addrObject.city = this.cityValue;
			}

			if (this.stateValue) {
				addrObject.state = this.stateValue;
			}

			if (this.countryValue) {
				addrObject.country = this.countryValue;
			}

			if (this.zipcodeValue) {
				addrObject.zipcode = this.zipcodeValue;
			}
		} else {
			if (this.streetValue) {
				addrObject.address = this.streetValue;
			}

			if (this.cityValue) {
				addrObject.city = this.cityValue;
			}

			if (this.stateValue) {
				addrObject.state = this.stateValue;
			}

			if (this.countryValue) {
				addrObject.country = this.countryValue;
			}

			if (this.zipcodeValue) {
				addrObject.zipcode = this.zipcodeValue;
			}
		}

		return addrObject;
	}

	async find() {
		let isRateLimitError;
		const fullSearch = this.combined();

		if (!fullSearch || fullSearch.length < 1) {
			throw new Error('Please enter an address');
		}

		const currentProviders = this._getProviders();
		// This function loops through all providers in order
		// one at a time and skips the rest once it finds a lat long


		for (const anOption of currentProviders) {
			try {
				const PCGeocoder_any = PCNodeGeocoder(anOption);
				const objects = await PCGeocoder_any.geocode(fullSearch);

				/* [{
				'latitude':33.495999,
				'longitude':-112.033232,
				'country':'United States',
				'city':'Phoenix',
				'state':'Arizona',
				'zipcode':'85016',
				'streetName':'E Monterosa St',
				'streetNumber':'2230',
				'countryCode':'US',
				'provider':'locationiq'
				}]*/

				/*
				Google response
				[
  {
    "formattedAddress": "8183 E Lowry Blvd, Denver, CO 80230, USA",
    "latitude": 39.7181746,
    "longitude": -104.8935301,
    "extra": {
      "googlePlaceId": "Eig4MTgzIEUgTG93cnkgQmx2ZCwgRGVudmVyLCBDTyA4MDIzMCwgVVNBIhsSGQoUChIJ9SaJxVd8bIcR30cmzkDjDHUQ9z8",
      "confidence": 0.9,
      "premise": null,
      "subpremise": null,
      "neighborhood": "East",
      "establishment": null
    },
    "administrativeLevels": {
      "level2long": "Denver County",
      "level2short": "Denver County",
      "level1long": "Colorado",
      "level1short": "CO"
    },
    "streetNumber": "8183",
    "streetName": "East Lowry Boulevard",
    "city": "Denver",
    "country": "United States",
    "countryCode": "US",
    "zipcode": "80230",
    "provider": "google"
  }
]*/

				if (objects && objects.length > 0) {
					// we found results!

					// Google is a giant turd and return "state" as administrativeLevels
					for (let i = objects.length - 1; i >= 0; i--) {
						const aLocation = objects[i];

						if (aLocation.provider === 'google' && !aLocation.state) {
							if (aLocation.administrativeLevels.level1short) {
								aLocation.state = aLocation.administrativeLevels.level1short;
							} else if (aLocation.administrativeLevels.level1long) {
								aLocation.state = aLocation.administrativeLevels.level1short;
							} else if (aLocation.administrativeLevels.level2short) {
								aLocation.state = aLocation.administrativeLevels.level1short;
							} else if (aLocation.administrativeLevels.level2long) {
								aLocation.state = aLocation.administrativeLevels.level1short;
							}
						}
					}

					return objects;
				}
			} catch (e) {
				// ignore throws

				if (e.message === 'Response status code is 429') {
					isRateLimitError = true;
				}
			}
		}

		if (isRateLimitError) {
			throw new Error(RateLimitError);
		} else {
			throw new Error(NotFoundError);
		}
	}


	async first() {
		const results = await this.search();

		return results;
	}

	// depritiated because "search" isn't clear that it's only one
	async search() {
		let lat, long, raw, whole, isRateLimitError;

		if (!this.streetValue || this.streetValue.length < 3) {
			throw new Error('Street is required');
		}

		const currentProviders = this._getProviders();
		// This function loops through all providers in order
		// one at a time and skips the rest once it finds a lat long


		for (const anOption of currentProviders) {
			try {
				const PCGeocoder_any = PCNodeGeocoder(anOption);
				const addrObject = this.addressObjectForOptions(anOption);

				const object = await PCGeocoder_any.geocode(addrObject);

				/* [{
				'latitude':33.495999,
				'longitude':-112.033232,
				'country':'United States',
				'city':'Phoenix',
				'state':'Arizona',
				'zipcode':'85016',
				'streetName':'E Monterosa St',
				'streetNumber':'2230',
				'countryCode':'US',
				'provider':'locationiq'
				}]*/

				// Saftey checks
				// returning will move on to the next provider.
				if (!object || object.length > 1) {
					continue; // Too many results
				}

				const first = object[0];

				if (!first) {
					continue; // No First Object
				}

				const street = PCGeocoder.streetFromNumberAndName(first.streetNumber, first.streetName);

				if (!street) {
					continue; // Not Specific enough
				}

				if (anOption.provider !== 'mapquest') {
					// openstreetmap always returns a house number if there is one
					if (!first.streetNumber) {
						continue; // Not Specific enough
					}

					const userInputHouseNumber = this.streetValue.split(' ')[0];

					if (first.streetNumber !== userInputHouseNumber) {
						continue; // House Numbers don't match
					}
				}

				// zipcode check
				// this ensures that providers don't 'guess' at a house in another zipcode
				const userZip = this.zipcodeValue;
				const providerZip = PCAddressFormatter.zipcode(first.zipcode);

				if (userZip && userZip !== providerZip) {
					// zipcode is incorrect
					continue;
				}

				// city check
				if (this.cityValue && first && first.city) {
					const providerCity = first.city.toLowerCase().split(' ').join(''); // ' Paradise Valley ' => 'paradisevalley'
					const userCity = this.cityValue.toLowerCase().split(' ').join('');

					if (userCity !== providerCity) {
						// city is incorrect
						continue;
					}
				}


				first.street = street;

				if (!first || first.latitude === 0 || first.longitude === 0) {
					continue; // not a valid place
				}

				whole = first;
				raw = object.raw;
				lat = first.latitude;
				long = first.longitude;

				return { lat: lat, long: long, address: whole, raw: raw };
			} catch (e) {
				// ignore throws

				if (e.message === 'Response status code is 429') {
					isRateLimitError = true;
				}
			}
		}

		if (isRateLimitError) {
			throw new Error(RateLimitError);
		} else {
			throw new Error(NotFoundError);
		}
	}
}
module.exports = PCGeocoder;
