const agent = require('superagent-promise')(require('superagent'), Promise);
const chai = require('chai');

const { expect } = chai;

const apiUrl = 'https://api.github.com';

describe('Post && Patch API tests', () => {
  let loggedUser;
  let selectedRepo;
  let createdIssueResponse;
  let updatedIssueResponse;

  const postIssueArguments = {
    title: 'The Issue'
  };

  const patchIssueArguments = {
    body: 'This is the body of an issue'
  };

  describe('User get request ', () => {
    before(() =>
      agent
        .get(`${apiUrl}/user`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          loggedUser = response.body;
        }));

    it('should have at least one public repo', () => {
      expect(loggedUser.public_repos).to.be.above(0);
    });
  });

  describe('Chosen repo get request', () => {
    before(() =>
      agent
        .get(`${apiUrl}/users/${loggedUser.login}/repos`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          [selectedRepo] = response.body;
        }));

    it('the selected repo should exist', () =>
      expect(selectedRepo).to.exist);
  });

  describe('Chosen repo issue post request', () => {
    before(() =>
      agent
        .post(`${apiUrl}/repos/${loggedUser.login}/${selectedRepo.name}/issues`)
        .auth('token', process.env.ACCESS_TOKEN)
        .send(postIssueArguments)
        .then((response) => {
          createdIssueResponse = response;
        }));

    it('the post request body should contain the correct title and an empty issue body', () => {
      expect(createdIssueResponse.body.body).to.eql(null);
      expect(createdIssueResponse.body.title).to.eql(postIssueArguments.title);
    });
  });

  describe('Chosen repo issue patch request', () => {
    before(() =>
      agent
        .patch(`${apiUrl}/repos/${loggedUser.login}/${selectedRepo.name}/issues/${createdIssueResponse.body.number}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .send(patchIssueArguments)
        .then((response) => {
          updatedIssueResponse = response;
        }));

    it('the patch request body should contain the correct title and the updated issue body', () => {
      expect(updatedIssueResponse.body.body).to.eql(patchIssueArguments.body);
      expect(updatedIssueResponse.body.title).to.eql(postIssueArguments.title);
    });
  });
});
