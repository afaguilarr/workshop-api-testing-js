const agent = require('superagent-promise')(require('superagent'), Promise);
const chai = require('chai');
const chaiSubset = require('chai-subset');
const md5 = require('md5');

chai.use(chaiSubset);
const { expect } = chai;

const apiUrl = 'https://api.github.com';
const user = 'aperdomob';
const repository = 'jasmine-awesome-report';
const fileName = 'README.md';

describe('Get Api Tests', () => {
  describe('User tests', () => {
    let queryResponse;

    const expectedAttributes = {
      name: 'Alejandro Perdomo',
      company: 'PSL',
      location: 'Colombia'
    };

    before(() =>
      agent
        .get(`${apiUrl}/users/${user}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          queryResponse = response;
        }));

    it('should have as name: Alejandro Perdomo, company: PSL and location: Colombia', () => {
      expect(queryResponse.body).to.include(expectedAttributes);
    });
  });

  describe('Repo tests', () => {
    let foundRepository;
    let file;
    let unexpectedMd5;

    const repoQueryParameter = {
      q: repository
    };

    const repoExpectedAttributes = {
      name: repository,
      private: false,
      description: 'An awesome html report for Jasmine'
    };

    before(() =>
      agent.get(`${apiUrl}/search/repositories`)
        .auth('token', process.env.ACCESS_TOKEN)
        .query(repoQueryParameter)
        .then((response) => {
          foundRepository = (response.body.items).find(repo => repo.name === repository);
        }));

    it(`should have a repo called ${repository} with some characteristics`, () =>
      expect(foundRepository).to.include(repoExpectedAttributes));

    before(() =>
      agent.get(`github.com/${user}/${repository}/archive/development.zip`)
        .auth('token', process.env.ACCESS_TOKEN)
        .buffer(true)
        .then((response) => {
          file = response.text;
          unexpectedMd5 = 'd41d8cd98f00b204e9800998ecf8427e';
        }));

    it('should be downloadable', () =>
      expect(md5(file)).to.not.eql(unexpectedMd5));
  });

  describe('File tests', () => {
    let queryResponse;
    let file;
    let expectedMd5;

    const expectedValues = [{
      name: fileName,
      path: fileName,
      sha: '9bcf2527fd5cd12ce18e457581319a349f9a56f3'
    }];


    before(() =>
      agent.get(`${apiUrl}/repos/${user}/${repository}/contents/`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          queryResponse = response;
        }));

    it(`should have a ${fileName} with some characteristics`, () => {
      expect(queryResponse.body).to.containSubset(expectedValues);
    });

    before(() =>
      agent.get(`https://raw.githubusercontent.com/${user}/${repository}/development/${fileName}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .buffer(true)
        .then((response) => {
          file = response.text;
          expectedMd5 = '8a406064ca4738447ec522e639f828bf';
        }));

    it(`should be downloadable (${fileName})`, () =>
      expect(md5(file)).to.eql(expectedMd5));
  });
});
