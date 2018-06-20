const agent = require('superagent-promise')(require('superagent'), Promise);
const chai = require('chai');
const chaiSubset = require('chai-subset');
const statusCode = require('http-status-codes');

chai.use(chaiSubset);
const { expect } = chai;

const apiUrl = 'https://github.com';
const user = 'aperdomob';
const redirectingPath = 'redirect-test';
const redirectedPath = 'new-redirect-test';

describe('Head Api Tests', () => {
  function headToRedirectingPathFunction() {
    return agent
      .head(`${apiUrl}/${user}/${redirectingPath}`)
      .auth('token', process.env.ACCESS_TOKEN);
  }

  function getToRedirectingPathFunction() {
    return agent
      .get(`${apiUrl}/${user}/${redirectingPath}`)
      .auth('token', process.env.ACCESS_TOKEN);
  }

  describe('Head redirection tests', () => {
    let expectedError;
    let headQueryResponse;

    before(async () => {
      try {
        headQueryResponse = await headToRedirectingPathFunction();
      } catch (err) {
        expectedError = await err;
      }
    });

    it('the request should return 301 (moved permanently) as status', () => {
      expect(headQueryResponse).to.equal(undefined);
      expect(expectedError.status).to.equal(statusCode.MOVED_PERMANENTLY);
    });

    it('the request should have the redirecting path and the response head should have the redirected path', () => {
      expect(expectedError.response.request.url).to.equal(`${apiUrl}/${user}/${redirectingPath}`);
      expect(expectedError.response.header.location).to.equal(`${apiUrl}/${user}/${redirectedPath}`);
    });
  });

  describe('Get redirection test', () => {
    let getQueryResponse;

    before(async () => {
      getQueryResponse = await getToRedirectingPathFunction();
    });

    it('the response should have the redirected path in its redirects attribute', () => {
      expect(getQueryResponse.status).to.equal(statusCode.OK);
      expect(getQueryResponse.redirects).to.include(`${apiUrl}/${user}/${redirectedPath}`);
    });
  });
});
