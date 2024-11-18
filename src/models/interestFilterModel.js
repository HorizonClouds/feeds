// InterestFilterModel.js

import mongoose from 'mongoose'; // Import Mongoose

// Create a schema for InterestFilter with validation
const interestFilterSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'userId is required'],
  },
  categoryList: {
    type: [String],
    enum: {
      values: ['NATURE', 'CITY', 'CULTURE','ADVENTURE','RELAX'], 
      message: '{VALUE} is not a valid role', 
    }
  },
});

// Create the model from the schema
const InterestFilterModel = mongoose.model('InterestFilter', interestFilterSchema);

export default InterestFilterModel; // Export the model
