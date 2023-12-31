
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { css } from '@emotion/react';
import { RingLoader } from 'react-spinners';

const ImageLazyLoad = ({ src, alt }) => { // functional component named ImageLazyLoad. The component takes two props src and alt (src is url of image and alt text of image)

  const [imageSrc, setImageSrc] = useState(null); // useState hook to define a state variable imageSrc and updater function, initial state of imageSrc is set to null

  const imageRef = useRef(); // The ref will be attached to the img element representing the lazy-loaded image

  useEffect(() => {
    const observer = new IntersectionObserver(  // This line creates a new IntersectionObserver object. An intersection observer is used to monitor the visibility of an element within the viewpage

      ([entry]) => {
        if (entry.isIntersecting) { // the observed element is intersecting with the viewport. If the image becomes visible within the viewport, the setImageSrc function is called
          setImageSrc(src);
          observer.unobserve(imageRef.current); // After the image becomes visible the observer stops 
        }
      },
      {
        threshold: 0.5,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);// checks if the imageRef.current exists and is not null. 
    }

    return () => {
      // if (imageRef.current) {
      //   observer.unobserve(imageRef.current);
      // }
    };
  }, [src]);// The useEffect hook dependency array

  return <img ref={imageRef} src={imageSrc} alt={alt} height="400px" width="300px"  className='img'/>;
};

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const containerRef = useRef(); // its work like as a container

  useEffect(() => {
    const fetchData = async () => { // This line defines an asynchronous arrow function named fetchData, which will be used to fetch data from the API
      setLoading(true);//Before starting the data fetching process, setLoading is called with true
      try {
        const response = await axios.get(`/api/image/pages/${page}`);// This line sends a Get request to the API and using axios library to fetching the data (`/api/image/pages/) this is api url and (${page}) is parameter
        const responseData = response.data;//Once the response is received, and then  extract the data  and stored in the responseData api response in json format
        if (responseData.images.length ) { // This line checks if the responseData contains images .if images then it will run
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
 containerRef.current.offsetHeight  && //This condition checks if the user has scrolled  to the bottom of the container. 
        !loading  //This checks if the loading state is false or no data fetched
      ) {
        fetchData(); // If the conditions within the if statement are valid then fetchData function called and this is a way to fetch new page images
      }
    };

    fetchData(); // This line immediately calls the fetchData function when the component is mounted. The purpose is to load the initial set of images from the API when the component is first rendered.

    window.addEventListener('scroll', handleScroll);// This line adds an event listener to the scroll event of the window. It attaches the handleScroll function to the scroll event. then the handleScroll will be called whenever the user scrolls on the page.

    return () => {
      window.removeEventListener('scroll', handleScroll);// This return statement defines a cleanup function that will be executed when the component is unmounted 
    };
  }, [loading, page]); // The second argument of the useEffect hook is an array of dependencies and it takes all the effect of state variables and props and The effect will be re-run whenever any dependencies change

  const getNumColumns = () => {
    if (window.innerWidth >= 1024) {
      return 3;
    } else if (window.innerWidth >= 768) {
      return 2;
    } else {
      return 1;
    }
  };

  const numColumns = getNumColumns(); // getNumColumns function called but stored in a numColumns variables
  const columnWidth = 100 / numColumns  ;

  const override = css`
    display: block;
    margin: 0 auto;
  `;

  return (
    <div >
    <h1> Images</h1>
    <hr/>
    <div ref={containerRef}> {/* containerRef attached to it.and  The reference will be used to track this container element */}
      <div  style={{ columnCount: numColumns }}> {/* columnCount to numColumns, which controls the number of columns based on the window width*/}
        {data.map((item, index) => (
          <div key={index}  style={{ width: columnWidth }}>
            <ImageLazyLoad src={item.image_path}  />
          </div>
        ))}
      </div>
      {loading && (
        <div className="spinner">
          <RingLoader color="#00000048" css={override} size={50} />
        </div>
      )}
    </div>
    </div>
  );
};

export default App;

