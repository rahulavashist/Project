



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
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/image/pages/${page}`);
        const responseData = response.data;
        if (responseData.images.length > 0) {
          setData((prevData) => [...prevData, ...responseData.images]);
          setLoading(false);
          setPage((prevPage) => prevPage + 1);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    const handleScroll = () => {
      if (
        containerRef.current &&
        window.innerHeight + window.pageYOffset >= containerRef.current.offsetHeight - 100 &&
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

