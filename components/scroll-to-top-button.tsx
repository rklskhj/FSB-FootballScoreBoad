"use client";
import React, { useEffect, useState } from "react";

const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 50); // 200px 이상 스크롤 시 버튼 표시
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return visible ? (
    <button
      onClick={scrollToTop}
      className={`fixed right-8 bottom-24 z-[1000] flex items-center justify-center w-12 h-12 rounded-full bg-white text-gray-500 border shadow-md cursor-pointer text-base transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-label="최상단으로 이동"
    >
      ↑
    </button>
  ) : null;
};

export default ScrollToTopButton;
