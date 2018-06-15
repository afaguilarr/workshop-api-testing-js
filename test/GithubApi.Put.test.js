const agent = require('superagent-promise')(require('superagent'), Promise);
const statusCode = require('http-status-codes');
const chai = require('chai');
const chaiSubset = require('chai-subset');

chai.use(chaiSubset);

const { expect } = chai;

const apiUrl = 'https://api.github.com';
const userToFollow = 'aperdomob';
const userFollowing = 'afaguilarr';

describe('Following Github Api Tests', () => {
  describe('Following put test', () => {
    let queryResponse;

    before(() =>
      agent
        .put(`${apiUrl}/user/following/${userToFollow}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          queryResponse = response;
        }));

    it('response should have no content', () => {
      expect(queryResponse.status).to.equal(statusCode.NO_CONTENT);
      expect(queryResponse.body).to.eql({});
    });
  });

  describe('Following get test', () => {
    let queryResponse;

    const expectedFollowedUserUserame = [{
      login: userToFollow
    }];

    before(() =>
      agent
        .get(`${apiUrl}/user/following`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          queryResponse = response;
        }));

    it(`${userToFollow} should now be followed by ${userFollowing}`, () => {
      expect(queryResponse.body).to.containSubset(expectedFollowedUserUserame);
    });
  });

  describe('Idempotence tests', () => {
    let putQueryResponse;
    let getQueryResponse;

    const expectedFollowedUserUserame = [{
      login: userToFollow
    }];

    before(() =>
      agent
        .put(`${apiUrl}/user/following/${userToFollow}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          putQueryResponse = response;
        }));

    it('Put method should work the same as before', () => {
      expect(putQueryResponse.status).to.equal(statusCode.NO_CONTENT);
      expect(putQueryResponse.body).to.eql({});
    });

    before(() =>
      agent
        .get(`${apiUrl}/user/following`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          getQueryResponse = response;
        }));

    it(`${userToFollow} should still be followed by ${userFollowing}`, () => {
      expect(getQueryResponse.body).to.containSubset(expectedFollowedUserUserame);
    });
  });
});
