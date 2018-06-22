const fetch = require('isomorphic-fetch');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const statusCode = require('http-status-codes');

chai.use(chaiSubset);
const { expect } = chai;

const apiUrl = 'https://api.github.com';

describe('Delete API tests (WITH ISOMORPHIC-FETCH LIBRARY)', () => {
  let createdGistResponse;

  const authorizationHeaders = {
    Authorization: `token ${process.env.ACCESS_TOKEN}`
  };

  const getOptions = {
    method: 'GET',
    headers: authorizationHeaders
  };

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

    const postOptions = {
      method: 'POST',
      body: JSON.stringify(gistToCreate),
      headers: authorizationHeaders
    };

    before(() =>
      fetch(`${apiUrl}/gists`, postOptions)
        .then((response) => {
          createdGistResponse = response;
          return response.json();
        }).then((body) => {
          createdGistResponse.body = body;
        }));

    it('the gist should be created and contain the specified values', () => {
      expect(createdGistResponse.status).to.equal(statusCode.CREATED);
      expect(createdGistResponse.body)
        .to.containSubset(gistToCreate);
    });
  });

  describe('Gist creation get test', () => {
    let searchedGistResponse;

    before(async () =>
      fetch(`${apiUrl}/gists/${createdGistResponse.body.id}`, getOptions)
        .then((response) => {
          searchedGistResponse = response;
          return response.json();
        }).then((body) => {
          searchedGistResponse.body = body;
        }));

    it('the created gist should exist', () => {
      expect(searchedGistResponse.status).to.equal(statusCode.OK);
      expect(searchedGistResponse.body.description)
        .to.eql(createdGistResponse.body.description);
    });
  });

  describe('Gist deletion delete test', () => {
    let deletedGistResponse;

    const deleteOptions = {
      method: 'DELETE',
      headers: authorizationHeaders
    };

    before(() =>
      fetch(`${apiUrl}/gists/${createdGistResponse.body.id}`, deleteOptions)
        .then((response) => {
          deletedGistResponse = response;
        }));

    it('The gist deletion shoud respond with a 204 status (no content)', () => {
      expect(deletedGistResponse.status).to.equal(statusCode.NO_CONTENT);
    });
  });

  describe('Gist deletion get test', () => {
    let searchedGistAfterDeleteResponse;

    before(async () => {
      await fetch(`${apiUrl}/gists/${createdGistResponse.body.id}`, getOptions)
        .then((response) => {
          searchedGistAfterDeleteResponse = response;
        });
    });

    it(
      'the created and deleted gist should not exist (request should respond with a Not Found error)',
      () => {
        expect(searchedGistAfterDeleteResponse.status).to.equal(statusCode.NOT_FOUND);
      }
    );
  });
});
