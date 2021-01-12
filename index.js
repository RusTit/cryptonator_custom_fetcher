const fs = require('fs');
const needle = require('needle');
const request = require('request-promise-native');

/**
 * Fetch currency or return null
 * @param jsonValue
 * @return {string|null}
 */
const getDataFromResponse = jsonValue => {
  console.log('Preprocessing response from server.');
  if (!jsonValue.success || jsonValue.error) {
    return null;
  }
  const originalPrice = jsonValue.ticker.price;
  console.log(`Original Price: ${originalPrice}`);
  const cleanPrice = originalPrice.split('.')[0];
  console.log(`Price: ${cleanPrice}`);
  return cleanPrice;
};

const OUTPUT_FILENAME = 'Output.csv';

const saveDataSync = value => {
  console.log('Saving result');
  const fileExist = fs.existsSync(OUTPUT_FILENAME);
  if (fileExist) {
    console.log('File already exist');
  } else {
    console.log('File is not exist yet');
  }
  const separator = fileExist ? ',' : '';
  fs.appendFileSync(OUTPUT_FILENAME, `${separator}${value}`);
};

const URL = 'https://api.cryptonator.com/api/ticker/btc-usd';

/*
const getJsonDataMock = async () => {
  return {
    ticker: {
      base: 'BTC',
      target: 'USD',
      price: '35064.69740179',
      volume: '431066.56041817',
      change: '-324.61925773',
    },
    timestamp: 1610429643,
    success: true,
    error: '',
  };
};
*/

/**
 * Deprecated, because it's use "request" lib, but it work with proxies, without additional code.
 * @return {Promise<*>}
 */
const getJsonDataDeprecated = async () => {
  const data = await request.get(URL, { json: true });
  return data;
};

/**
 * This should also work good.
 * @return {Promise<*>}
 */
const getJsonData = async () => {
  const response = await needle('get', URL);
  return response.body;
};

const run = async () => {
  try {
    console.log('Fetching data.');
    const jsonData = await getJsonDataDeprecated();
    const rateValue = getDataFromResponse(jsonData);
    if (rateValue) {
      saveDataSync(rateValue);
    }
  } catch (e) {
    console.error('Error while fetching data from cryptonator');
    console.error(e);
  }
};

const DELAY_BETWEEN_ITERATIONS = 30 * 1000;

const delay = (delayTime = 1000) => {
  return new Promise(resolve => {
    setTimeout(resolve, delayTime);
  });
};

const main = async () => {
  while (true) {
    console.log('Iteration started.');
    await run();
    console.log('Iteration finished. Waiting for next iteration');
    await delay(DELAY_BETWEEN_ITERATIONS);
  }
};

main().catch(e => {
  console.error('Unexpected error');
  console.error(e);
  process.exit(1);
});
