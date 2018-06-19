const agent = require('superagent-promise')(require('superagent'), Promise);
const chai = require('chai');
const chaiSubset = require('chai-subset');
const statusCode = require('http-status-codes');

chai.use(chaiSubset);
const { expect } = chai;

const apiUrl = 'https://api.github.com';

describe('Delete API tests', () => {
  let createdGistResponse;

  function getGistFunction(id) {
    return agent
      .get(`${apiUrl}/gists/${id}`)
      .auth('token', process.env.ACCESS_TOKEN);
  }

  describe('Gist creation post test', () => {
    const gistToCreate = {
      description: 'Promises Gist',
      public: true,
      files: {
        'promises.txt': {
          content: 'Some stuff about promises'
        }
      }
    };

    before(() =>
      agent
        .post(`${apiUrl}/gists`)
        .auth('token', process.env.ACCESS_TOKEN)
        .send(gistToCreate)
        .then((response) => {
          createdGistResponse = response;
        }));

    it('the gist should be created and contain the specified values', () => {
      expect(createdGistResponse.status).to.equal(statusCode.CREATED);
      expect(createdGistResponse.body)
        .to.containSubset(gistToCreate);
    });
  });

  describe('Gist creation get test', () => {
    let searchedGistResponse;

    before(async () => {
      searchedGistResponse = await getGistFunction(createdGistResponse.body.id);
    });

    it('the created gist should exist', () => {
      expect(searchedGistResponse.status).to.equal(statusCode.OK);
      expect(searchedGistResponse.body.description)
        .to.eql(createdGistResponse.body.description);
    });
  });

  describe('Gist deletion delete test', () => {
    let deletedGistResponse;

    before(() =>
      agent
        .del(`${apiUrl}/gists/${createdGistResponse.body.id}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          deletedGistResponse = response;
        }));

    it('The gist deletion shoud respond with a 204 status (no content)', () => {
      expect(deletedGistResponse.status).to.equal(statusCode.NO_CONTENT);
    });
  });

  describe('Gist deletion get test', () => {
    let searchedGistAfterDeleteResponse;
    let expectedError;

    before(async () => {
      try {
        searchedGistAfterDeleteResponse = await getGistFunction(createdGistResponse.body.id);
      } catch (err) {
        expectedError = await err.message;
      }
    });

    it(
      'the created and deleted gist should not exist (request should respond with a Not Found error)',
      () => {
        expect(searchedGistAfterDeleteResponse).to.equal(undefined);
        expect(expectedError).to.eql('Not Found');
      }
    );
  });
});
