const PCGeocoder = require('../src/PCGeocoder.js');
// const NotFoundError = 'We couldn\'t find that address. Please double check and try again';
const addressMissing = 'Please enter an address';

try {
	require('../apiKeys.js')();
} catch (e) {
	// It's ok if we don't load the keys from the apiKeys file
	// In CI we load directly
}

describe('number of charaters in USA', () => {
	it('should fail undefined characters', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
		geo.disableFreeServices(true);
		geo.generic();

		try {
			await geo.find();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(addressMissing);
		}
	});

	it('should fail null characters', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
		geo.disableFreeServices(true);
		geo.generic(null);

		try {
			await geo.find();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(addressMissing);
		}
	});

	it('should fail 0 characters', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
		geo.disableFreeServices(true);
		geo.generic('');

		try {
			await geo.find();

			expect(1).toBe(2);
		} catch (error) {
			expect(error.message).toBe(addressMissing);
		}
	});

	it('should pass 1 character', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
		geo.disableFreeServices(true);
		geo.country('USA');
		geo.generic('4');

		const results = await geo.find();

		expect(results).toHaveLength(10);
	});

	// too many locationIQ for the tests
	// rate limit error
	// it('should pass 2 character', async () => {
	// 	expect.assertions(1);
	// 	const geo = new PCGeocoder();

	// 	geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
	// 	geo.disableFreeServices(true);
	// 	geo.country('USA');
	// 	geo.generic('41');

	// 	const results = await geo.find();

	// 	expect(results).toHaveLength(10);
	// });

	// it('should pass 3 character', async () => {
	// 	expect.assertions(1);
	// 	const geo = new PCGeocoder();

	// 	geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
	// 	geo.disableFreeServices(true);
	// 	geo.generic('414');
	// 	geo.country('USA');

	// 	const results = await geo.find();

	// 	expect(results).toHaveLength(10);
	// });

	it('should pass 414 N Rock St', async () => {
		expect.assertions(1);
		const geo = new PCGeocoder();

		geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
		geo.disableFreeServices(true);
		geo.generic('414 N Rock St');
		geo.country('USA');

		const results = await geo.find();

		expect(results).toHaveLength(7);
	});
});

function testAddress(genericValue, expectedLat, expectedLong) {
	const name = 'combined services (' + genericValue + ')';

	describe(name, () => {
		it('should geocode full address', async () => {
			expect.assertions(3);

			const geo = new PCGeocoder();

			geo.generic(genericValue);

			const results = await geo.find();
			const result = results[0];

			expect(result).toBeDefined();
			expect(result.latitude.toString()).toContain(expectedLat);
			expect(result.longitude.toString()).toContain(expectedLong);
		}, 10 * 1000);

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
		// 	geo.generic(street);
		// 	geo.city(city);
		// 	geo.state(state);
		// 	geo.zipcode(zip);
		// 	geo.country(country);

		// 	const results = await geo.find();
		//  const result = results[0];

		// 	expect(result).toBeDefined();
		// 	expect(result.latitude.toString()).toContain(expectedLat);
		// 	expect(result.longitude.toString()).toContain(expectedLong);
		// });

		it('open street map', async () => {
			expect.assertions(3);

			const geo = new PCGeocoder();


			// we are testing only the here service
			geo.primaryProviders([{ provider: 'openstreetmap' }]);
			geo.disableFreeServices(true);
			geo.generic(genericValue);

			const results = await geo.find();
			const result = results[0];

			expect(result).toBeDefined();
			expect(result.latitude.toString()).toContain(expectedLat);
			expect(result.longitude.toString()).toContain(expectedLong);
		});

		it('google', async () => {
			expect.assertions(4);

			const geo = new PCGeocoder();

			// we are testing only the here service
			geo.primaryProviders([{ provider: 'google', apiKey: process.env.GOOGLE_API_KEY, httpAdapter: 'request', formatter: null }]);
			geo.disableFreeServices(true);
			geo.generic(genericValue);

			const results = await geo.find();
			const result = results[0];

			expect(result).toBeDefined();
			expect(result.state).toBeDefined();
			expect(result.latitude.toString()).toContain(expectedLat);
			expect(result.longitude.toString()).toContain(expectedLong);
		});

		it('here', async () => {
			expect.assertions(3);

			const geo = new PCGeocoder();


			// we are testing only the here service
			geo.primaryProviders([{ provider: 'here', httpAdapter: 'https', appId: process.env.HERE_APP_ID, appCode: process.env.HERE_APP_CODE }]);
			geo.disableFreeServices(true);
			geo.generic(genericValue);

			const results = await geo.find();
			const result = results[0];

			expect(result).toBeDefined();
			expect(result.latitude.toString()).toContain(expectedLat);
			expect(result.longitude.toString()).toContain(expectedLong);
		});

		it('locationiq', async () => {
			expect.assertions(3);

			const geo = new PCGeocoder();


			// we are testing only the here service
			geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }]);
			geo.disableFreeServices(true);
			geo.generic(genericValue);

			const results = await geo.find();
			const result = results[0];

			expect(result).toBeDefined();
			expect(result.latitude.toString()).toContain(expectedLat);
			expect(result.longitude.toString()).toContain(expectedLong);
		});

		it('mapquest', async () => {
			expect.assertions(3);

			const geo = new PCGeocoder();


			// we are testing only the here service
			geo.primaryProviders([{ provider: 'mapquest', apiKey: process.env.MAP_QUEST_API_KEY }]);
			geo.disableFreeServices(true);
			geo.generic(genericValue);

			const results = await geo.find();
			const result = results[0];

			expect(result).toBeDefined();
			expect(result.latitude.toString()).toContain(expectedLat);
			expect(result.longitude.toString()).toContain(expectedLong);
		});
	});
}

testAddress('2753 E Windrose Dr Phoenix Arizona 85032 USA', '33.602', '-112.022');

testAddress('2230 East Monterosa Street Phoenix Arizona 85016 United States of America', '33.495', '-112.033');

testAddress('414 N Rock St Gilbert Arizona 85234 United States of America', '33.358', '-111.761');
