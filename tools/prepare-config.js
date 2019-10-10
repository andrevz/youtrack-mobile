const updateJsonFile = require('update-json-file');

const ANALYTICS_ID = process.env.googleAnalyticsID;
const KONNECTOR_URL = process.env.konnectorURL;
const BUILD_NUMBER = process.env.buildNumber;
const VERSION_NUMBER = process.env.versionNumber;
const EXCEPTION_REPORTER_TOKEN = process.env.exeptionReporterToken;


if (!ANALYTICS_ID || !KONNECTOR_URL || !BUILD_NUMBER || !VERSION_NUMBER) {
  console.error('process.env', process.env); //eslint-disable-line
  throw new Error('Some of env params `ANALYTICS_ID`, `KONNECTOR_URL`, `BUILD_NUMBER`, `VERSION_NUMBER` is not set');
}

updateJsonFile('package.json', data => {
  data.config.ANALYTICS_ID = ANALYTICS_ID;
  data.config.EXCEPTION_REPORTER_TOKEN = EXCEPTION_REPORTER_TOKEN;
  data.config.KONNECTOR_URL = KONNECTOR_URL;
  console.info('Config', data.config); //eslint-disable-line

  data.version = `${VERSION_NUMBER }-${ BUILD_NUMBER}`;
  console.info('Version', data.version); //eslint-disable-line

  return data;
});
