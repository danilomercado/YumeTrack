import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Al cambiar de página arranca desde arriba, como en una navegación normal.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
