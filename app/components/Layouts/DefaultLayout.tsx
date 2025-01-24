"use client";
import React, { useState, ReactNode, useEffect } from "react";
import Header from "@components/Header";
import Footer from "@components/Footer";
import { BsArrowUpCircleFill } from "react-icons/bs";

export default function DefaultLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200; // Show arrow after scrolling 200px
      setShowScrollArrow(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
        {/* <!-- ===== Header Start ===== --> */}
        <Header />
        {/* <!-- ===== Header End ===== --> */}

        {/* <!-- ===== Main Content Start ===== --> */}
        <main className="flex-grow flex flex-col justify-center items-center">
          {children}
          {showScrollArrow && (
            <BsArrowUpCircleFill onClick={scrollToTop} className="fixed animate-bounce bottom-5 cursor-pointer right-5 text-primary hover:text-meta-3 text-[40px] " aria-label="Scroll to top" />
          )}
        </main>
        {/* <!-- ===== Main Content End ===== --> */}

        {/* <!-- ===== Footer Start ===== --> */}
        <Footer />
        {/* <!-- ===== Footer End ===== --> */}

      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}
