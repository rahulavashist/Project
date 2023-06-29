const mongoose = require("mongoose")

const imageSchema = new mongoose.Schema({
  
    image_path:String
  
  });
  

  const Image = mongoose.model('Image', imageSchema);
  module.exports =Image