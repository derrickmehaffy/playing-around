const axios = require('axios');
// FOR DEBUG ONLY
const fs = require('fs');

let sites = {
	apsites: [],
	bmsites: [],
	btsites: [],
	cssites: [],
	fgsites: [],
	fmsites: [],
	gvsites: [],
	gysites: [],
	lssites: [],
	tbsites: [],
	twsites: [],
};

const API_ENDPOINT = `https://api.canonn.tech:2053`;
const API_LIMIT = 1000;

const capi = axios.create({
	baseURL: API_ENDPOINT,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

const go = async types => {
	let typeKeys = Object.keys(types);
	// loop through types to get all the data
	for (i = 0; i < typeKeys.length; i++) {
		console.log('Fetching ' + typeKeys[i]);
		sites[typeKeys[i]] = await getSites(typeKeys[i]);
	}
	// FOR DEBUG ONLY
	fs.writeFile('data/data.json', JSON.stringify(sites, null, 2), err => {
		if (err) throw err;
		console.log('Saved to data/data.json');
	});
};

const getSites = async type => {
	let records = [];
	let keepGoing = true;
	let API_START = 0;
	while (keepGoing) {
		let response = await reqSites(API_START, type);

		//trying to return `apsites`
		let responseKeys = Object.keys(response.data.data);

		// push data into array under `apsites`
		await records.push.apply(records, response.data.data[responseKeys[0]]);

		let page = 1;
		API_START += API_LIMIT;
		page += 1;

		// if more data under apsites then keep asking for it
		if (response.data.data[responseKeys[0]].length < API_LIMIT) {
			keepGoing = false;
			return records;
		}
	}
};

const reqSites = async (API_START, type) => {
	let typeQuery = type;
	let where = {};
	let query = `query ($limit:Int, $start:Int, $where:JSON){ 
    ${typeQuery} (limit: $limit, start: $start, where: $where){ 
      system{ 
        systemName
        edsmCoordX
        edsmCoordY
        edsmCoordZ
      } 
      siteID
      type {
        type
      }
    }
  }`;

	let payload = await capi({
		url: '/graphql',
		method: 'post',
		data: {
			query,
			variables: {
				start: API_START,
				limit: API_LIMIT,
				where,
			},
		},
	});

	return payload;
};

go(sites);
