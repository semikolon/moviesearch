import mongoose from 'mongoose';

var Schema = mongoose.Schema;

var MovieSearchSchema = new Schema({
    term: String,
    numberOfMatches: Number,
    createdAt: Date
}, { collection: "MovieSearch" });


var MovieSearch = mongoose.model('MovieSearch', MovieSearchSchema);

export default MovieSearch;
