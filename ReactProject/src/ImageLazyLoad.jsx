



import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { css } from '@emotion/react';
import { RingLoader } from 'react-spinners';

const ImageLazyLoad = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const imageRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.unobserve(imageRef.current);
        }
      },
      {
        threshold: 0.5,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src]);

  return <img ref={imageRef} src={imageSrc} alt={alt} height="400px" width="300px"  className='img'/>;
};

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const containerRef = useRef();

  useEffect(() => {
    const fetchData = async () => { // This line defines an asynchronous arrow function named fetchData, which will be used to fetch data from the API
      setLoading(true);//Before starting the data fetching process, setLoading is called with true
      try {
        const response = await axios.get(`/api/image/pages/${page}`);// This line sends a Get request to the API and using axios library to fetching the data (`/api/image/pages/) this is api url and (${page}) is parameter
        const responseData = response.data;//Once the response is received, and then  extract the data  and stored in the responseData api response in json format
        if (responseData.images.length > 0) { // This line checks if the responseData contains images .if images then it will run
          setData((prevData) => [...prevData, ...responseData.images]);// setData function is called to update the data state.It uses the updater function to add the new images from the responseData to the existing data array. The spread operator ... is used to spread the existing prevData array and the new responseData.images array into a new array
          setLoading(false);// After updating the data state, setLoading is called with false
          setPage((prevPage) => prevPage + 1);// This line updates the page state using the setPage function. It takes the current value of the page state (prevPage) and increments page by 1
        } else {
          setLoading(false);// If the API response does not contain any images or responseData is empty
        }
      } catch (error) {
        console.error('Error fetching data:', error); //  If an error during the API call or missing anything when api call
        setLoading(false);// After logging the error, setLoading is called with false
      }
    };

    const handleScroll = () => {// This line defines the handleScroll function, which will be called whenever the user scrolls on the page
      if (
        containerRef.current && //This checks if the containerRef has been attached to a DOM element and also measure the scrolling position
        window.innerHeight + window.pageYOffset >= // it checks the current vertical scroll position of the window by adding the viewport height and also check 
the number of pixels the page has been scrolled vertically 
 containerRef.current.offsetHeight - 100 &&
        !loading
      ) {
        fetchData();
      }
    };

    fetchData();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, page]);

  const getNumColumns = () => {
    if (window.innerWidth >= 1024) {
      return 3;
    } else if (window.innerWidth >= 768) {
      return 2;
    } else {
      return 1;
    }
  };

  const numColumns = getNumColumns();
  const columnWidth = 100 / numColumns + '%';

  const override = css`
    display: block;
    margin: 0 auto;
  `;

  return (
    <div ref={containerRef}>
      <div className="gallery-container" style={{ columnCount: numColumns }}>
        {data.map((item, index) => (
          <div key={index} className="gallery-item" style={{ width: columnWidth }}>
            <ImageLazyLoad src={item.image_path}  />
          </div>
        ))}
      </div>
      {loading && (
        <div className="spinner">
          <RingLoader color="#000" css={override} size={50} />
        </div>
      )}
    </div>
  );
};

export default App;

