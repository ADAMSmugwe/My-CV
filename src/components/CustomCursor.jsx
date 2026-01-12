import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const updateCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      
      // Check if hovering over interactive elements
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('project-card') ||
        target.classList.contains('experience-card') ||
        target.classList.contains('cursor-magnetic') ||
        target.hasAttribute('data-cursor-magnetic');
      
      if (isInteractive) {
        setIsHovering(true);
        
        // Magnetic effect - pull cursor toward center of element
        const rect = (target.closest('button') || target.closest('a') || target).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate magnetic pull (30% toward center)
        const pullStrength = 0.3;
        const magneticX = e.clientX + (centerX - e.clientX) * pullStrength;
        const magneticY = e.clientY + (centerY - e.clientY) * pullStrength;
        
        cursorX.set(magneticX);
        cursorY.set(magneticY);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('project-card') ||
        target.classList.contains('experience-card') ||
        target.classList.contains('cursor-magnetic');
      
      if (isInteractive) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Hide default cursor */}
      <style>{`
        * {
          cursor: none !important;
        }
        
        /* Show default cursor on inputs and textareas */
        input, textarea {
          cursor: text !important;
        }
      `}</style>

      {/* Custom cursor dot */}
      <motion.div
        className="pointer-events-none fixed z-[9999] mix-blend-difference"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: '-50%',
          y: '-50%',
        }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute rounded-full border-2 border-white"
          animate={{
            width: isHovering ? 60 : 40,
            height: isHovering ? 60 : 40,
            x: isHovering ? -30 : -20,
            y: isHovering ? -30 : -20,
          }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
        
        {/* Inner dot */}
        <motion.div
          className="absolute bg-white rounded-full"
          animate={{
            width: isHovering ? 8 : 6,
            height: isHovering ? 8 : 6,
            x: isHovering ? -4 : -3,
            y: isHovering ? -4 : -3,
          }}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;
