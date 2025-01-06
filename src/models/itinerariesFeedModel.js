import mongoose from 'mongoose';

const itinerariesFeedSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'userId is required'],
  },
  creationDate: {
    type: Date,
    required: [true, 'creationDate is required'],
  },
  itineraryList: {
    type: [Object],
    required: [true, 'itineraryList is required'],
    maxLenght: [50, 'itineraryList can have at most 50 elements'],
  },
});

const ItinerariesFeedModel = mongoose.model('ItinerariesFeed', itinerariesFeedSchema);

export default ItinerariesFeedModel;