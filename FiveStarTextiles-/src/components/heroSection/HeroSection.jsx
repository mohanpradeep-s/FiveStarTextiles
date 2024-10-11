"use client";
import React, { useState , useEffect} from 'react'

const HeroSection = () => {
  const [currentIndex,setCurrentIndex] = useState(2);
  const slides = [
    {
      URL: "https://images.adsttc.com/media/images/6398/bd3f/65b1/c201/700f/09a7/newsletter/heimtextil-2023-the-fabric-made-of-resources_6.jpg?1670954318"
    },
    {
      URL: "https://textilefocus.com/wp-content/uploads/2016/11/textile-industry.jpg"
    },
    {
      URL: "https://www.innovationintextiles.com/uploads/12484/INTERSECTION-724x408-boxed.jpg"
    },
  ];

  useEffect(() => {
    const autoplay = setInterval(() => {
      nextSlide()
    }, 3000)
    return () => clearInterval(autoplay)
  }, [currentIndex]);

  const prevSlide = () =>{
    setCurrentIndex((prevIndex) =>
      (prevIndex === 0 ? slides.length - 1 : prevIndex -1)
    )
  }
  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
    (prevIndex === slides.length - 1 ? 0 : prevIndex + 1)
    )
  }
  return (
    <div className='max-w-[1500px] h-[780px] w-full m-auto py-10 px-4 relative group'>
      <div style={{backgroundImage: `url(${slides[currentIndex].URL})`}}
      className='w-full h-full rounded-2xl bg-center bg-cover duration-500'>

      </div>
    </div>
  )
}

export default HeroSection