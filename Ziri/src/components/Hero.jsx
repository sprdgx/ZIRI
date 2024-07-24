import styles from "../style";
import hero from "../assets/hero.gif";
import GetStarted from "./GetStarted";
import { motion, useAnimation, useInView } from 'framer-motion'
import { useEffect, useRef } from "react";

const Hero = () => {

  const ref = useRef(null)
  const isInView = useInView(ref)
  const mainAnimate = useAnimation()

  useEffect(() => {
    if (isInView) {
      mainAnimate.start("visible")
    }
  }, [isInView])

  return (
    <motion.section
      ref={ref}
      variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden"
      animate={mainAnimate}
      transition={{ duration: 1, delay: 0.7 }}
      className={`flex top-0 md:flex-row flexcol relative`}
      style={{ 
        backgroundImage: `url(${hero})`,
        zIndex: 1,
      }}
    >
      {/* Black transparent overlay */}
      <div className="flex absolute inset-0 bg-black opacity-50  "></div>

      <div id="home" className={`flex-auto flex justify-center items-start flex-col ss:w-full pt-10 xl:px-0 sm:px-16 px-6 relative z-10`}>
        <div className="flex-row justify-between items-center w-full ss:w-full">
          <div>
              <h1 className="   ss:mt-[3.15cm] rounded-lg bg-black bg-opacity-50 ss:w-[350px] font-poppins font-semibold ss:text-[40px]  text-2xl absolute top-0 mt-[3.5cm] text-center text-white ss:leading-12 leading-12 ">
              LOCAL TECH REVOLUTION
              </h1 >
          </div>
          <div>
            <h1 className="  mb-[7rem] ss:mb-[0rem] top-0 mt-[5cm] ss:mt-[6.5cm] absolute text-gradient font-poppins font-semibold ss:text-[40px] text-2xl  ss:leading-16 leading-12 text-center ">
              <div className=" text-white bg-black bg-opacity-50 w-[190px] ss:w-[260px] rounded-lg">
                FOR EMERGING MARKETS
              </div>
            </h1>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Hero;
