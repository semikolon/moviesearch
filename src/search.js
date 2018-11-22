import {Router} from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import MovieSearch from './mongoose/moviesearch';
import bodyParser from 'body-parser';
import settings from './settings';

mongoose.connect('mongodb://localhost:27017/local')
var db = mongoose.connection;
db.on('error', () => {console.error( 'Failed to connect to mongoose/MongoDB' )});
db.once('open', () => {console.log( 'Connected to mongoose/MongoDB' )});

export const saveSearch = (term, data) => {
  var search = new MovieSearch({
    term: term,
    numberOfMatches: data['total_results'],
    createdAt: Date.now()
  });

  search.save((err, result)=> {
    if (err) { console.error("Search save failed: " + err); }
    // console.log("Search saved successfully: " + JSON.stringify(search));
  });
  return search;
};

export const getMostSearched = async () => {
  await MovieSearch.aggregate([
    {
      $group : {
        _id : "$term",
        count: {
          $sum: 1
        }
      }
    }
  ], function (err, search) {
    if (err) console.error(err);
    console.log(search);
    return search;
  });
};

export default (router = new Router()) => {
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.post('/search', async (req, res) => {
    const result = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${settings.movieDbApiKey}&language=en-US&query=${req.body.term}&page=1&include_adult=false`
    );
    const { data } = result;
    saveSearch(req.body.term, data);
    return res.json(data);
  });

  router.get('/most_searched', async (req, res) => {
    const data = getMostSearched();
    return res.json(data);
  });

  return router;
};