/* eslint-disable no-loop-func, consistent-return */

const PCNodeGeocoder = require('node-geocoder');
const PCAddressFormatter = require('@panda-clouds/address-formatter');

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
	async search() {
		let lat, long, raw, whole;

		if (!this.streetValue || this.streetValue.length < 3) {
			throw new Error('Street is required');
		}

		const currentProviders = this._getProviders();
		// This function loops through all providers in order
		// one at a time and skips the rest once it finds a lat long


		for (const anOption of currentProviders) {
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
		}

		if (!lat && !long) {
			throw new Error('We couldn\'t find that address. Please double check and try again');
		}
	}
}
module.exports = PCGeocoder;
