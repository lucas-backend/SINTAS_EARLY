import { useState } from "react";
import { ads } from "./adData";

import ChevronLeftSharpIcon from "@mui/icons-material/ChevronLeftSharp";
import ChevronRightSharpIcon from "@mui/icons-material/ChevronRightSharp";

export default function AdSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // State untuk mencegah spam klik
  const [isClickable, setIsClickable] = useState(true);

  if (!ads || ads.length === 0) return null;

  const handleSlideChange = (direction: "prev" | "next") => {
    // Jika tombol sedang dalam jeda klik, hentikan eksekusi
    if (!isClickable) return;

    // Matikan kemampuan klik sementara
    setIsClickable(false);

    if (direction === "next") {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
    }

    // Nyalakan kembali kemampuan klik setelah 250ms (sesuaikan jika perlu)
    setTimeout(() => {
      setIsClickable(true);
    }, 250);
  };

  const currentItem = ads[currentIndex];

  const imageElement = (
    <img
      src={currentItem.imageLink}
      alt={currentItem.title || currentItem.name}
      // Tambahkan 'select-none' agar gambar tidak ter-highlight saat klik cepat
      className="rounded-xl w-full h-38 object-cover select-none"
      draggable={false} // Mencegah gambar terseret (drag) secara tidak sengaja
    />
  );

  return (
    // Tambahkan 'select-none' pada container utama
    <div className="relative w-full overflow-hidden group select-none bg-black/10">
      <div>
        {currentItem.link ? (
          <a href={currentItem.link} target="_blank" rel="noopener noreferrer">
            {imageElement}
          </a>
        ) : (
          imageElement
        )}
      </div>

      {ads.length > 1 && (
        <>
          <button
            onClick={() => handleSlideChange("prev")}
            // Tambahkan disabled styling dan 'touch-manipulation'
            disabled={!isClickable}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center touch-manipulation transition-opacity ${!isClickable ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
            aria-label="Previous slide"
          >
            <ChevronLeftSharpIcon />
          </button>

          <button
            onClick={() => handleSlideChange("next")}
            // Tambahkan disabled styling dan 'touch-manipulation'
            disabled={!isClickable}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center touch-manipulation transition-opacity ${!isClickable ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
            aria-label="Next slide"
          >
            <ChevronRightSharpIcon />
          </button>
        </>
      )}
    </div>
  );
}
