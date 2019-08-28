const PCGeocoder = require('../src/PCGeocoder.js');
const NotFoundError = 'We couldn\'t find that address. Please double check and try again';
const streetIsRequired = 'Street is required';

try {
	require('../apiKeys.js')();
} catch (e) {
	// It's ok if we don't load the keys from the apiKeys file
	// In CI we load directly
}


// const street = '414 N Rock St';
// 	const city = 'Gilbert';
// 	const state = 'AZ';
// 	const zip = '85234';
// 	const country = 'United States of America';

// 	const expectedLat = '33.358';
// 	const expectedLong = '-111.761';

describe('test failures', () => {
	it('locationiq hacks 3828 N Jokake Dr, 85251 into 3828 N Jokake Rd, 85018', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();


		geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
		geo.disableFreeServices(true);
		geo.street('3828 N Jokake Dr');
		geo.city('Scottsdale');
		geo.state('AZ');
		geo.zipcode('85251');
		geo.country('USA');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(NotFoundError);
		}
	});

	it('test without zipcode', async () => {
		expect.assertions(2);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
		geo.disableFreeServices(true);
		geo.street('414 N Rock St');
		geo.city('Gilbert');
		geo.state('AZ');
		// geo.zipcode('85234');
		geo.country('USA');

		const result = await geo.search();

		expect(String(result.lat)).toContain('33.358');
		expect(String(result.long)).toContain('-111.761');
	});

	it('openstreetmap doesnt know 3974 E Waller Ln', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'openstreetmap' }]);
		geo.disableFreeServices(true);
		geo.street('3974 E Waller Ln');
		geo.city('Phoenix');
		geo.state('AZ');
		geo.zipcode('85050');
		geo.country('USA');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(NotFoundError);
		}
	});

	it('openstreetmap doesnt know 123 114th Way', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'here', httpAdapter: 'https', appId: process.env.HERE_APP_ID, appCode: process.env.HERE_APP_CODE }]);
		geo.disableFreeServices(true);
		geo.street('123 N 114th Way');
		geo.city('Scottsdale');
		geo.state('AZ');
		geo.zipcode('85259');
		geo.country('USA');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(NotFoundError);
		}
	});

	it('locationIQ doesnt know 123 N 114th Way', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
		geo.disableFreeServices(true);
		geo.street('32657 N 58th St');
		geo.city('Cave Creek');
		geo.state('AZ');
		geo.zipcode('85331');
		geo.country('USA');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(NotFoundError);
		}
	});

	it('here doesnt know 1440 E Cullumber St', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'here', httpAdapter: 'https', appId: process.env.HERE_APP_ID, appCode: process.env.HERE_APP_CODE }]);
		geo.disableFreeServices(true);
		geo.street('1440 E Cullumber St');
		geo.city('Gilbert');
		geo.state('AZ');
		geo.zipcode('85234');
		geo.country('USA');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(NotFoundError);
		}
	});


	it('locationiq messes up city 6712 E Jean Dr (Scottsdale > Pheonix)', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
		geo.disableFreeServices(true);
		geo.street('6712 E Jean Dr');
		geo.city('Scottsdale');
		geo.state('AZ');
		geo.zipcode('85254');
		geo.country('USA');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(NotFoundError);
		}
	});
});
describe('block Non-house level input', () => {
	it('should NOT geocode city only', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.city('Gilbert');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(streetIsRequired);
		}
	});

	it('should NOT geocode only state', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.state('AZ');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(streetIsRequired);
		}
	});

	it('should NOT geocode country only', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.country('United States of America');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(streetIsRequired);
		}
	});

	it('should NOT geocode Zip only', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.zipcode('85234');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(streetIsRequired);
		}
	});

	it('should NOT geocode all but address', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.city('Gilbert');
		geo.state('AZ');
		geo.zipcode('85234');
		geo.country('United States of America');

		try {
			await geo.search();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(streetIsRequired);
		}
	});
});

function testAddress(street, city, state, zip, country, expectedLat, expectedLong) {
	const name = 'combined services (' + street + ')';

	describe(name, () => {
		it('should geocode full address', async () => {
			expect.assertions(5);

			const geo = new PCGeocoder();

			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			const result = await geo.search();

			expect(result).toBeDefined();
			expect(result.lat.toString()).toContain(expectedLat);
			expect(result.long.toString()).toContain(expectedLong);
			expect(result.address.latitude.toString()).toContain(expectedLat);
			expect(result.address.longitude.toString()).toContain(expectedLong);
		}, 10 * 1000);


		it('should geocode street, state and zip only', async () => {
			expect.assertions(5);

			const geo = new PCGeocoder();

			geo.street(street);
			geo.state(state);
			geo.zipcode(zip);

			const result = await geo.search();

			expect(result).toBeDefined();
			expect(result.lat.toString()).toContain(expectedLat);
			expect(result.long.toString()).toContain(expectedLong);
			expect(result.address.latitude.toString()).toContain(expectedLat);
			expect(result.address.longitude.toString()).toContain(expectedLong);
		}, 10 * 1000);
	});

	describe('indiviual services', () => {
		// Disabled because datasciencetoolkit require http only connection
		// and i can't figure out how to pass that option.
		// TODO: fix passing http to datasciencetoolkit

		// eslint-disable-next-line jest/no-disabled-tests
		// it('data science tool kit', async () => {
		// 	expect.assertions(1);

		// 	const geo = new PCGeocoder();


		// 	// we are testing only the here service
		// 	geo.primaryProviders([{ provider: 'datasciencetoolkit', httpAdapter: 'http' }]);
		// 	geo.disableFreeServices(true);
		// 	geo.street(street);
		// 	geo.city(city);
		// 	geo.state(state);
		// 	geo.zipcode(zip);
		// 	geo.country(country);

		// 	const result = await geo.search();

		// 	expect(result).toBeDefined();
		// 	expect(result.lat.toString()).toContain(expectedLat);
		// 	expect(result.long.toString()).toContain(expectedLong);
		// });

		it('open street map', async () => {
			expect.assertions(3);

			const geo = new PCGeocoder();


			// we are testing only the here service
			geo.primaryProviders([{ provider: 'openstreetmap' }]);
			geo.disableFreeServices(true);
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			const result = await geo.search();

			expect(result).toBeDefined();
			expect(result.lat.toString()).toContain(expectedLat);
			expect(result.long.toString()).toContain(expectedLong);
		});


		it('here', async () => {
			expect.assertions(3);

			const geo = new PCGeocoder();


			// we are testing only the here service
			geo.primaryProviders([{ provider: 'here', httpAdapter: 'https', appId: process.env.HERE_APP_ID, appCode: process.env.HERE_APP_CODE }]);
			geo.disableFreeServices(true);
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			const result = await geo.search();

			expect(result).toBeDefined();
			expect(result.lat.toString()).toContain(expectedLat);
			expect(result.long.toString()).toContain(expectedLong);
		});

		it('locationiq', async () => {
			expect.assertions(3);

			const geo = new PCGeocoder();


			// we are testing only the here service
			geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
			geo.disableFreeServices(true);
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			const result = await geo.search();

			expect(result).toBeDefined();
			expect(result.lat.toString()).toContain(expectedLat);
			expect(result.long.toString()).toContain(expectedLong);
		});

		it('mapquest', async () => {
			expect.assertions(3);

			const geo = new PCGeocoder();


			// we are testing only the here service
			geo.primaryProviders([{ provider: 'mapquest', apiKey: process.env.MAP_QUEST_API_KEY }]);
			geo.disableFreeServices(true);
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			const result = await geo.search();

			expect(result).toBeDefined();
			expect(result.lat.toString()).toContain(expectedLat);
			expect(result.long.toString()).toContain(expectedLong);
		});
	});
}

// Unfortunatly, 4 digits of accuracy won't pass reliable
// so we have to do 3

// Randomly picked address on google maps
testAddress('2753 E Windrose Dr', 'Phoenix', 'Arizona', '85032', 'USA', '33.602', '-112.022');

testAddress('2230 East Monterosa Street', 'Phoenix', 'Arizona', '85016', 'United States of America', '33.495', '-112.033');

testAddress('414 N Rock St', 'Gilbert', 'Arizona', '85234', 'United States of America', '33.358', '-111.761');

// open street map && locationiq fail
// here && mapquest pass
// testAddress('6712 E Jean Dr', 'Scottsdale', 'Arizona', '85254', 'USA', '33.609', '-111.936');
