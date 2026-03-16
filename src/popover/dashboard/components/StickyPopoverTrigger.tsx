import React, { useState, useEffect } from 'react';

const StickyPopoverTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [triggerStyle, setTriggerStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    transition: 'bottom 0.2s ease-out',
  });

  useEffect(() => {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;

    const fixedBottom = 20;
    const transitionRange = 20;

    const handleScroll = () => {
      const rect = placeholder.getBoundingClientRect();
      const viewportBottom = window.innerHeight;

      if (rect.top > viewportBottom - fixedBottom) {
        setTriggerStyle({
          position: 'fixed',
          bottom: `${fixedBottom}px`,
          right: '20px',
          zIndex: 1000,
          transition: 'bottom 0.2s ease-out',
        });
      } else {
        const overlap = viewportBottom - fixedBottom - rect.top;
        if (overlap < transitionRange) {
          const newBottom = fixedBottom - overlap;
          setTriggerStyle({
            position: 'fixed',
            bottom: `${newBottom}px`,
            right: '20px',
            zIndex: 1000,
            transition: 'bottom 0.2s ease-out',
          });
        } else {
          setTriggerStyle({
            position: 'absolute',
            right: '8px',
            zIndex: 1000,
            transition: 'none',
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div style={triggerStyle}>{children}</div>;
};

export default StickyPopoverTrigger;
