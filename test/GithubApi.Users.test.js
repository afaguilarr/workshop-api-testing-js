const agent = require('superagent-promise')(require('superagent'), Promise);
const responseTime = require('superagent-response-time');
const chai = require('chai');
const statusCode = require('http-status-codes');

const { expect } = chai;

const apiUrl = 'https://api.github.com';
const usersPath = 'users';
const expectedTime = 5000;

describe('Response time Api Tests', () => {
  describe('Get All users time response test', () => {
    let timeQueryResponse;
    let queryTime;
    let tenUsersQueryResponse;
    let fiftyUsersQueryResponse;

    const queryParametersTenUsers = {
      per_page: 10
    };
    const queryParametersFiftyUsers = {
      per_page: 50
    };

    const callback = (request, time) => {
      queryTime = time;
    };

    function getAllUsersTimeFunction() {
      return agent
        .get(`${apiUrl}/${usersPath}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .use(responseTime(callback))
        .then(response => response); // Line needed because super-agent-response-time has issues
    }

    function getAllUsersPaginationFunction(queryParameters) {
      return agent
        .get(`${apiUrl}/${usersPath}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .query(queryParameters)
        .then(response => response);
    }

    before(async () => {
      timeQueryResponse = await getAllUsersTimeFunction();
      tenUsersQueryResponse = await
      getAllUsersPaginationFunction(queryParametersTenUsers);
      fiftyUsersQueryResponse = await
      getAllUsersPaginationFunction(queryParametersFiftyUsers);
    });

    it('The response should have 200 OK as status and should be less than 5000 ms', () => {
      expect(timeQueryResponse.status).to.equal(statusCode.OK);
      expect(queryTime).to.be.below(expectedTime);
    });

    it('The response body should have 10 users', () => {
      expect(tenUsersQueryResponse.body.length).to.equal(10);
    });

    it('The response body should have 50 users', () => {
      expect(fiftyUsersQueryResponse.body.length).to.equal(50);
    });
  });
});
