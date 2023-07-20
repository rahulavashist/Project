const express = require('express');
const axios = require('axios');
const ImageModel = require('../models/ImageModel');

const router = express.Router();

const apiUrl = 'https://api.unsplash.com/photos/?client_id=3jYahgSqx0nT3SRASQL6HY3jIs4v60ezRluSDq48y1E'; // unsplash api with access key


async function fetchAndStoreImages(page = 1, perPage = 10) { // async function is define to  fetch the api  . And its taking 2 url (page and perpage) page define current page and perpage define 10 image on a single page
  try {
    const apiUrlWithParams = `${apiUrl}&page=${page}&per_page=${perPage}`; //api url  store into a apiurlParams . ${page} and ${perpage} is a parameter which is pass in url
    const response = await axios.get(apiUrlWithParams); // In this line we trying to fetch the data with the help of axios 
    const images = response.data.map((ele) => ({ image_path: ele.urls.small, page })); // the data we fetched now track the data with the help of higher order function  and find the image which type of image we need 

    // const existingImages = await ImageModel.find(); 
    // const existingUrls = existingImages.map((image) => image.image_path);
    // //

    // const uniqueImages = images.filter((image) => !existingUrls.includes(image.image_path));

    // if (uniqueImages.length > 0) {
    //   const data = await ImageModel.insertMany(uniqueImages);
    //   return data;
    // } else {
    //   console.log('No new unique images found.');
     
    // }
  } catch (error) {
    console.log(error); // if something went wrong while api called then shows error 
  }
}




router.get('/', async (req, res) => {  // this is a get req  when we want get anything
  try {
    var data = await ImageModel.find().sort({ image_path: -1 });  // now we find the images and if we found  and sort (filter) the image by latest images come first 
    res.send({ result: 'Done', total: data.length, data: data }); // if we get then done message will print and total length of the images or then images data 
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).send({ result: 'Fail', message: 'Internal Server Error' }); // if the image not found or make any mistake then the error will show
  }
});


router.get('/pages/:page', async (req, res) => {  // (/pages/:page) is the parameters when we need to secrch image by page 
  const page =req.params['page'] ;
  const perPage = 10; // 10 image on single page

  try {
    const totalCount = await ImageModel.countDocuments({ page }).exec() ; // remove exec() function....// ..  countDocument is mongodb query to check or help to find the total images and returns the number of documents in the collection .exec() mongo query execute the query and return a Promise

    const skip = (page - 1) * perPage; // first page images is 10 and when we trying to search image by page then it calculate the images per page
    const images = await ImageModel.find().skip(skip).limit(perPage).exec() ; // remove exec() function....// ..  skip() method is used to skip the given number of elements from the collection and return remaining collections

    res.json({
      page,
      perPage,
      totalCount,
      images, // res.json convert the data into json format
    });
  } catch (error) {
    console.error('Error:', error); // if any error while fetching the images by page 
    res.status(500).json({ error: 'An error occurred while fetching images' }); // if error then show error by status
  }
});

(async () => {
  try {
    const initialPage = 1; // current page
    const nextPage = initialPage + 1; //next page images with increment page 

    await fetchAndStoreImages(initialPage, 10); // fetch function called and fetch the image and store in database
    console.log(`Images fetched and stored for page ${initialPage}.`);

    await fetchAndStoreImages(nextPage, 10);  // again fetch function called and fetch the next page images and store  in database 
    console.log(`Images fetched and stored for page ${nextPage}.`);
  } catch (error) {
    console.log(error); // if error then error print on console
  }
})();

module.exports = router;









