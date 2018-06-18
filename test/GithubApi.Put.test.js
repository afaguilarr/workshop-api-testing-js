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
  let putQueryResponse;
  let getQueryResponse;

  function putFunction() {
    return agent
      .put(`${apiUrl}/user/following/${userToFollow}`)
      .auth('token', process.env.ACCESS_TOKEN);
  }

  function getFunction() {
    return agent
      .get(`${apiUrl}/user/following`)
      .auth('token', process.env.ACCESS_TOKEN);
  }

  describe('Following put test', () => {
    before(async () => {
      putQueryResponse = await putFunction();
    });

    it('response should have no content', () => {
      expect(putQueryResponse.status).to.equal(statusCode.NO_CONTENT);
      expect(putQueryResponse.body).to.eql({});
    });
  });

  describe('Following get test', () => {
    const expectedFollowedUserUserame = [{
      login: userToFollow
    }];

    before(async () => {
      getQueryResponse = await getFunction();
    });

    it(`${userToFollow} should now be followed by ${userFollowing}`, () => {
      expect(getQueryResponse.body).to.containSubset(expectedFollowedUserUserame);
    });
  });

  describe('Idempotence put test', () => {
    before(async () => {
      putQueryResponse = await putFunction();
    });

    it('Put method should work the same as before', () => {
      expect(putQueryResponse.status).to.equal(statusCode.NO_CONTENT);
      expect(putQueryResponse.body).to.eql({});
    });
  });

  describe('Idempotence get test', () => {
    const expectedFollowedUserUserame = [{
      login: userToFollow
    }];

    before(async () => {
      getQueryResponse = await getFunction();
    });

    it(`${userToFollow} should still be followed by ${userFollowing}`, () => {
      expect(getQueryResponse.body).to.containSubset(expectedFollowedUserUserame);
    });
  });
});
