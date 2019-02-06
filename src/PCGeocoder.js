var PCNodeGeocoder = require('node-geocoder');

class PCGeocoder  {

	constructor() {
	//Empty Constructor
	}
	static streetFromNumberAndName(number,name){
		if(number && name){
			// most return seperated
			return number + ' ' + name;
		}else if(name){
			// mapquest only returns 'name'
			return name;
		}else if(number){
			// not likely
			return number;
		}

		// no results
		return null;

	}
	// primaryProviders are attemped before "free services"
	primaryProviders(input){
		// geo.primaryProviders( [{provider:"locationiq",apiKey:"abc123"},{provider:"google",apiKey:"def345"}] )
		this.primaryProvidersArray = input;
	}

	// backupProviders are attemped after "free services"
	backupProviders(input){
		// geo.backupProviders( [{provider:"locationiq",apiKey:"abc123"},{provider:"google",apiKey:"def345"}] )
		this.backupProvidersArray = input;
	}

	// Used for:
	// A. testing individual services
	// B. people who dont want to use free services
	disableFreeServices(input){
		// geo.blockFreeServices(true)
		this.disableFreeServices = input;
	}

	_getProviders(){

		let all = [];

		// try Primary Providers first
		if(this.primaryProvidersArray) all = all.concat(this.primaryProvidersArray)

		if(this.disableFreeServices != true){
			// then try free services
			all.push({ provider: 'openstreetmap' })
			all.push({ provider: 'datasciencetoolkit'})
		}

		// then try backup services
		if(this.backupProvidersArray) all = all.concat(this.backupProvidersArray)

		return all;

	}

	street(input) {
		this.street = input;
	}

	city(input) {
		this.city = input;
	}

	state(input) {
		this.state = input;
	}

	country(input) {
		this.country = input;
	}

	zipcode(input) {
		this.zipcode = input
	}

	addressObjectForOptions(options){
		const addrObject = {}
		if(options.provider == 'openstreetmap'){
			// here requires "c" instead of "street"
			if(this.street)addrObject.street = this.street;
			if(this.city)addrObject.city = this.city;
			if(this.state)addrObject.state = this.state;
			if(this.country)addrObject.country = this.country;
			if(this.zipcode)addrObject.zipcode = this.zipcode;
		}else{
			if(this.street)addrObject.address = this.street;
			if(this.city)addrObject.city = this.city;
			if(this.state)addrObject.state = this.state;
			if(this.country)addrObject.country = this.country;
			if(this.zipcode)addrObject.zipcode = this.zipcode;
		}
		return addrObject;
	}
	search(){
		let lat, long, raw, whole;
		if(!this.street || this.street.length < 3) return Promise.reject("Street is required")
		let promise = new Promise(function(resolve) {
			resolve();
		});

		// const testProm = new Promise(function(resolve) {
		// 	resolve();
		// });
		// for (var i = 0; i < currentProviders.length; i++) {
		// 	const anOption = currentProviders[i]

		// 	testProm.then(()=>{
		// 		console.log("")
		// 	})
		// }

		const currentProviders = this._getProviders();
		// This function loops through all providers in order
		// one at a time and skips the rest once it finds a lat long
		for (var i = 0; i < currentProviders.length; i++) {
			const anOption = currentProviders[i]

			promise = promise.then(()=>{
				if(!lat && !long){

					const PCGeocoder_any = PCNodeGeocoder(anOption);
					const addrObject = this.addressObjectForOptions(anOption);
					return PCGeocoder_any.geocode(addrObject)
						.then((object)=>{
							/*[{
							"latitude":33.495999,
							"longitude":-112.033232,
							"country":"United States",
							"city":"Phoenix",
							"state":"Arizona",
							"zipcode":"85016",
							"streetName":"E Monterosa St",
							"streetNumber":"2230",
							"countryCode":"US",
							"provider":"locationiq"
							}]*/

							// Saftey checks
							// returning will move on to the next provider.
							if(!object || object.length > 1) return; // Too many results
							// eslint-disable-next-line no-console
							console.log("not too many ")
							const first = object[0];
							// eslint-disable-next-line no-console
							console.log("after first ")
							if(!first) return; // No First Object
							// eslint-disable-next-line no-console
							console.log("first " + JSON.stringify(first))
							const street = PCGeocoder.streetFromNumberAndName(first.streetNumber,first.streetName);
							if(!street) return; // Not Specific enough
							object.street = street;
							// eslint-disable-next-line no-console
							console.log("yes street")
							if(!first || first.latitude == 0 || first.longitude == 0) return ; // not a valid place

							whole = object;
							raw = object.raw;
							lat = first.latitude;
							long = first.longitude;
						})
						.catch((error)=>{
							// eslint-disable-next-line no-console
							console.log("Failed " + anOption.provider + ", continuing to next" + error)
						});
				}

			})
		}

		promise = promise.then(()=>{
			if(!lat && !long){
				// throw new Error("We couldn't find that address. Please double check and try again")
				return Promise.reject("We couldn't find that address. Please double check and try again");
			}else{
				return {"lat":lat,"long":long,"address":whole,"raw":raw};
			}
		})

		return promise;
	}
}
module.exports = PCGeocoder;
