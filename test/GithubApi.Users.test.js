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
    let queryResponse;
    let queryTime;

    const callback = (request, time) => {
      queryTime = time;
    };

    function getAllUsersFunction() {
      return agent
        .get(`${apiUrl}/${usersPath}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .use(responseTime(callback))
        .then(response => response); // Line needed because super-agent-response-time has issues
    }

    before(async () => {
      queryResponse = await getAllUsersFunction();
    });

    it('The response should have 200 OK as status and should be less than 5000 ms', () => {
      expect(queryResponse.status).to.equal(statusCode.OK);
      expect(queryTime).to.be.below(expectedTime);
    });
  });
});
