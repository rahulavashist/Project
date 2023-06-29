const express = require('express');
const axios = require('axios');
const ImageModel = require('../models/ImageModel');

const router = express.Router();

const apiUrl = 'https://api.unsplash.com/photos/?client_id=3jYahgSqx0nT3SRASQL6HY3jIs4v60ezRluSDq48y1E';




async function fetchAndStoreImages(page = 1, perPage = 10) {
  try {
    const apiUrlWithParams = `${apiUrl}&page=${page}&per_page=${perPage}`;
    const response = await axios.get(apiUrlWithParams);
    const images = response.data.map((ele) => ({ image_path: ele.urls.small, page }));

    const existingImages = await ImageModel.find();
    const existingUrls = existingImages.map((image) => image.image_path);

    const uniqueImages = images.filter((image) => !existingUrls.includes(image.image_path));

    if (uniqueImages.length > 0) {
      const data = await ImageModel.insertMany(uniqueImages);
      return data;
    } else {
      console.log('No new unique images found.');
     
    }
  } catch (error) {
    console.log(error);
  }
}




router.get('/', async (req, res) => {
  try {
    var data = await ImageModel.find().sort({ image_path: -1 });
    res.send({ result: 'Done', total: data.length, data: data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ result: 'Fail', message: 'Internal Server Error' });
  }
});


router.get('/pages/:page', async (req, res) => {
  const page =req.params['page'] ;
  const perPage = 10;

  try {
    const totalCount = await ImageModel.countDocuments({ page }).exec();

    const skip = (page - 1) * perPage;
    const images = await ImageModel.find().skip(skip).limit(perPage).exec();

    res.json({
      page,
      perPage,
      totalCount,
      images,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching images' });
  }
});

(async () => {
  try {
    const initialPage = 1;
    const nextPage = initialPage + 1;

    await fetchAndStoreImages(initialPage, 10);
    console.log(`Images fetched and stored for page ${initialPage}.`);

    await fetchAndStoreImages(nextPage, 10);
    console.log(`Images fetched and stored for page ${nextPage}.`);
  } catch (error) {
    console.log(error);
  }
})();

module.exports = router;









