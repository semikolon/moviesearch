import search, { saveSearch, getMostSearched } from './search';
import express from 'express';
import moxios from 'moxios';
import request from 'supertest';

const initSearch = () => {
  const app = express();
  app.use(search());
  return app;
}

describe('POST /search', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });

  test('It should do a search for a movie with 1 result', async () => {
    moxios.stubRequest(/api.themoviedb.org/, {
      status: 200,
      response: {"page":1,"total_results":1,"total_pages":1,"results":[{"vote_count":4766,"id":489,"video":false,"vote_average":8,"title":"Good Will Hunting","popularity":13.891,"poster_path":"/jq8LjngZ7XZEQge5JFTdOGMrHyZ.jpg","original_language":"en","original_title":"Good Will Hunting","genre_ids":[18],"backdrop_path":"/8vA6dxBzRqSajvqdmTLtoguAa3T.jpg","adult":false,"overview":"Will Hunting has a genius-level IQ but chooses to work as a janitor at MIT. When he solves a difficult graduate-level math problem, his talents are discovered by Professor Gerald Lambeau, who decides to help the misguided youth reach his potential. When Will is arrested for attacking a police officer, Professor Lambeau makes a deal to get leniency for him if he will get treatment from therapist Sean Maguire.","release_date":"1997-12-05"}]}
    });
    const app = initSearch();
    const res = await request(app)
      .post('/search')
      .send({ term: 'good will hunting' })
      .set('Accept', 'application/json')
      .expect(200);
    expect(res.body['total_results']).toEqual(1);
  });

  test('It should do a search for a movie with empty result', async () => {
    moxios.stubRequest(/api.themoviedb.org/, {
      status: 200,
      response: {"page":1,"total_results":0,"total_pages":1,"results":[]}
    });
    const app = initSearch();
    const res = await request(app)
      .post('/search')
      .send({ term: 'thismoviedoesnotexist' })
      .set('Accept', 'application/json')
      .expect(200);
    expect(res.body['total_results']).toEqual(0);
  });

});

describe('saveSearch', () => {
  test('It should store a search with 1 result', async () => {
    const term = 'good will hunting';
    const data = {"page":1,"total_results":1,"total_pages":1,"results":[{"vote_count":4766,"id":489,"video":false,"vote_average":8,"title":"Good Will Hunting","popularity":13.891,"poster_path":"/jq8LjngZ7XZEQge5JFTdOGMrHyZ.jpg","original_language":"en","original_title":"Good Will Hunting","genre_ids":[18],"backdrop_path":"/8vA6dxBzRqSajvqdmTLtoguAa3T.jpg","adult":false,"overview":"Will Hunting has a genius-level IQ but chooses to work as a janitor at MIT. When he solves a difficult graduate-level math problem, his talents are discovered by Professor Gerald Lambeau, who decides to help the misguided youth reach his potential. When Will is arrested for attacking a police officer, Professor Lambeau makes a deal to get leniency for him if he will get treatment from therapist Sean Maguire.","release_date":"1997-12-05"}]};

    expect(saveSearch(term, data)).toMatchObject({ "numberOfMatches": 1, "term": "good will hunting" });
  });

  test('It should store a search with 1 result', async () => {
    const term = 'thismoviedoesnotexist';
    const data = {"page":1,"total_results":0,"total_pages":1,"results":[]};

    expect(saveSearch(term, data)).toMatchObject({ "numberOfMatches": 0, "term": "thismoviedoesnotexist" });
  });
});

describe('getMostSearched', () => {
  test('It should find most searched movies', async () => {
    saveSearch('matrix', {"page":1,"total_results":200,"total_pages":1,"results":[]});
    saveSearch('matrix', {"page":1,"total_results":200,"total_pages":1,"results":[]});
    saveSearch('matrix', {"page":1,"total_results":200,"total_pages":1,"results":[]});
    saveSearch('inception', {"page":1,"total_results":10,"total_pages":1,"results":[]});
    saveSearch('inception', {"page":1,"total_results":10,"total_pages":1,"results":[]});
    saveSearch('good will hunting', {"page":1,"total_results":1,"total_pages":1,"results":[]});
    saveSearch('thismoviedoesnotexist', {"page":1,"total_results":0,"total_pages":1,"results":[]});

    expect(getMostSearched()).toEqual([
      { _id: 'inception', count: 2 },
      { _id: 'thismoviedoesnotexist', count: 4 },
      { _id: 'matrix', count: 3 },
      { _id: 'good will hunting', count: 4 } ]
    );
  });
});
