const axios = require('axios');

let types = [
  "ap",
  "tw"
];
let sites = [];

const API_ENDPOINT = `https://api.canonn.tech:2053`;
const API_LIMIT = 10;

const capi = axios.create({
	baseURL: API_ENDPOINT,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

function prettyJSON(obj) {
	console.log(JSON.stringify(obj, null, 2));
}

const go = async (types) => {
  // loop through types to get all the data
  /*
  for (i=0; i < types.length; i++) {
    sites = await getSites(types[i]);
  }
  */
  sites = await getSites(types[0]);
  prettyJSON(sites);
}

const getSites = async (type) => {
	let records = [];
	let keepGoing = true;
	let API_START = 0;
	while (keepGoing) {
    let response = await reqSites(API_START, type);

    //trying to return `apsites`
    let responseKeys = Object.keys(response.data.data);

    // push data into array under `apsites`
    await records.push.apply(records.responseKeys[0], response.data.data.responseKeys[0]);
    
    API_START += API_LIMIT;
    
    // if more data under apsites then keep asking for it
		if (response.data.data.responseKeys[0].length < API_LIMIT) {
			keepGoing = false;
			return records;
		}
  }
};

const reqSites = async (API_START, type) => {
	let typeQuery = type + 'sites';
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

go(types);