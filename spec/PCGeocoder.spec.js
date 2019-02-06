const PCGeocoder = require("../src/PCGeocoder.js");
try{
	require("../apiKeys.js")();
}catch(e){
	// It's ok if we don't load the keys from the apiKeys file
	// In CI we load directly
}


// const street = "414 N Rock St";
// 	const city = "Gilbert";
// 	const state = "AZ";
// 	const zip = "85234";
// 	const country = "United States of America";

// 	const expectedLat = "33.358";
// 	const expectedLong = "-111.761";
describe('Block Non-house level input', () => {
	it('should NOT geocode city only', (done) => {

		const geo = new PCGeocoder();
		geo.city("Gilbert");

		geo.search()
			.then(done.fail).catch(done);
	});

	it('should NOT geocode only state', (done) => {

		const geo = new PCGeocoder();
		geo.state("AZ");
		geo.search()
			.then(done.fail).catch(done);
	});

	it('should NOT geocode country only', (done) => {

		const geo = new PCGeocoder();
		geo.country("United States of America");

		geo.search()
			.then(done.fail).catch(done);
	});

	it('should NOT geocode Zip only', (done) => {

		const geo = new PCGeocoder();
		geo.zipcode("85234");

		geo.search()
			.then(done.fail).catch(done);
	});

	it('should NOT geocode all but address', (done) => {

		const geo = new PCGeocoder();
		geo.city("Gilbert");
		geo.state("AZ");
		geo.zipcode("85234");
		geo.country("United States of America");

		geo.search()
			.then(done.fail).catch(done);
	});

})

function testAddress(street,city,state,zip,country,expectedLat,expectedLong){

	describe('combined services (' + street + ')', () => {

		it('should geocode full address', (done) => {

			const geo = new PCGeocoder();
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			geo.search()
				.then((result)=>{
					expect(result).toBeDefined();
					expect(result.lat.toString()).toContain(expectedLat);
					expect(result.long.toString()).toContain(expectedLong);
					expect(result.address[0].latitude.toString()).toContain(expectedLat);
					expect(result.address[0].longitude.toString()).toContain(expectedLong);
				})
				.then(done).catch(done.fail);
		}, 10 * 1000);


		it('should geocode street, state and zip only', (done) => {

			const geo = new PCGeocoder();
			geo.street(street);
			geo.state(state);
			geo.zipcode(zip);

			geo.search()
				.then((result)=>{
					expect(result).toBeDefined();
					expect(result.lat.toString()).toContain(expectedLat);
					expect(result.long.toString()).toContain(expectedLong);
					expect(result.address[0].latitude.toString()).toContain(expectedLat);
					expect(result.address[0].longitude.toString()).toContain(expectedLong);
				})
				.then(done).catch(done.fail);
		}, 10 * 1000);

	});

	describe('indiviual services', () => {

		// Disabled because datasciencetoolkit require http only connection
		// and i can't figure out how to pass that option.
		// TODO: fix passing http to datasciencetoolkit
		xit('Data Science Tool Kit', (done) => {

			const geo = new PCGeocoder();

			// we are testing only the here service
			geo.primaryProviders([{ provider: 'datasciencetoolkit' , httpAdapter: 'http'}])
			geo.disableFreeServices(true);
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			geo.search()
				.then((result)=>{
					// Unfortunatly, 4 digits of accuracy won't pass reliable
					// so we have to do 3
					expect(result).toBeDefined();
					expect(result.lat.toString()).toContain(expectedLat);
					expect(result.long.toString()).toContain(expectedLong);
				})
				.then(done).catch(done.fail);
		});

		it('Open Street Map', (done) => {

			const geo = new PCGeocoder();

			// we are testing only the here service
			geo.primaryProviders([{ provider: 'openstreetmap' }])
			geo.disableFreeServices(true);
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			geo.search()
				.then((result)=>{
					expect(result).toBeDefined();
					expect(result.lat.toString()).toContain(expectedLat);
					expect(result.long.toString()).toContain(expectedLong);
				})
				.then(done).catch(done.fail);
		});


		it('Here', (done) => {

			const geo = new PCGeocoder();

			// we are testing only the here service
			geo.primaryProviders([{ provider: 'here', httpAdapter: 'https', appId: process.env.HERE_APP_ID, appCode: process.env.HERE_APP_CODE}])
			geo.disableFreeServices(true);
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			geo.search()
				.then((result)=>{
					expect(result).toBeDefined();
					expect(result.lat.toString()).toContain(expectedLat);
					expect(result.long.toString()).toContain(expectedLong);
				})
				.then(done).catch(done.fail);
		});

		it('locationiq', (done) => {

			const geo = new PCGeocoder();

			// we are testing only the here service
			geo.primaryProviders([{ provider: 'locationiq', apiKey: process.env.LOCATION_IQ_API_KEY }])
			geo.disableFreeServices(true);
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			geo.search()
				.then((result)=>{
					expect(result).toBeDefined();
					expect(result.lat.toString()).toContain(expectedLat);
					expect(result.long.toString()).toContain(expectedLong);
				})
				.then(done).catch(done.fail);
		});

		it('mapquest', (done) => {

			const geo = new PCGeocoder();

			// we are testing only the here service
			geo.primaryProviders([{ provider: 'mapquest', apiKey: process.env.MAP_QUEST_API_KEY }])
			geo.disableFreeServices(true);
			geo.street(street);
			geo.city(city);
			geo.state(state);
			geo.zipcode(zip);
			geo.country(country);

			geo.search()
				.then((result)=>{
					expect(result).toBeDefined();
					expect(result.lat.toString()).toContain(expectedLat);
					expect(result.long.toString()).toContain(expectedLong);
				})
				.then(done).catch(done.fail);
		});

	});

}

// Unfortunatly, 4 digits of accuracy won't pass reliable
// so we have to do 3

// Randomly picked address on google maps
testAddress("2753 E Windrose Dr","Phoenix","Arizona","85032","USA", "33.602","-112.022")

testAddress("2230 East Monterosa Street","Phoenix","Arizona","85016","United States of America", "33.495","-112.033")

testAddress("414 N Rock St","Gilbert","Arizona","85234","United States of America", "33.358","-111.761")
