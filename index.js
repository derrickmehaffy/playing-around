const axios = require('axios');

const capi = axios.create({
	baseURL: 'https://api.canonn.tech:2053',
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

function prettyJSON(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

function extend(obj, src) {
  Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
  return obj;
}

async function capiGet(start, limit, where, type) {
  /*
  let start = 0;
  let limit = 1000;
  let where = {};
  let type = 'ap'
  */
  let typeQuery = type + 'sites';
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

  let response = await capi({
    url: '/graphql',
    method: 'post',
    data: {
      query,
      variables: {
        start,
        limit,
        where,
      },
    },
  });

  capiResponse = extend(await response.data.data, capiResponse);
}

let capiResponse = {};

async function capiData() {

  await capiGet(0, 5, {}, 'ap');
  await capiGet(0, 5, {}, 'bm');
  await capiGet(5, 5, {}, 'bm');
  prettyJSON(capiResponse);
};

capiData();

