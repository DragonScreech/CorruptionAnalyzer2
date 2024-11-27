import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const App = () => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [result, setResult] = useState({ blue: 0, pink: 0 });

  const videoConstraints = {
    facingMode: "environment", // Rear-facing camera
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    analyzeColors(imageSrc);
  };

  const analyzeColors = (imageDataUrl) => {
    const image = new Image();
    image.src = imageDataUrl;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let totalBrightness = 0;
      let totalPixels = 0;
      let blueCount = 0;
      let pinkCount = 0;

      // Calculate average brightness
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b; // Standard grayscale conversion
        totalBrightness += brightness;
        totalPixels++;
      }

      const avgBrightness = totalBrightness / totalPixels;

      // Adjust pixel values based on average brightness
      const brightnessAdjustmentFactor = 128 / avgBrightness; // Normalize to mid-brightness level

      for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i] * brightnessAdjustmentFactor;
        let g = pixels[i + 1] * brightnessAdjustmentFactor;
        let b = pixels[i + 2] * brightnessAdjustmentFactor;

        // Clamp values to [0, 255]
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        // Color detection logic
        if (b > 128 && b > r && b > g) {
          blueCount++;
        }

        if (r > 150 && g > 50 && b > 100 && r > g && r > b) {
          pinkCount++;
        }
      }

      const bluePercentage = ((blueCount / totalPixels) * 100).toFixed(2);
      const pinkPercentage = ((pinkCount / totalPixels) * 100).toFixed(2);

      setResult({ blue: bluePercentage, pink: pinkPercentage });
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-pink-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Color Analyzer</h1>

      {!imageSrc && (
        <div className="flex flex-col items-center">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full max-w-md rounded-lg border-2 border-gray-300"
            videoConstraints={videoConstraints} // Rear-facing camera specified here
          />
          <button
            onClick={capture}
            className="mt-4 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600"
          >
            Capture Image
          </button>
        </div>
      )}

      {imageSrc && (
        <div className="flex flex-col items-center">
          <img
            src={imageSrc}
            alt="Captured"
            className="w-full max-w-md rounded-lg border-2 border-gray-300"
          />
          <div className="mt-4 p-4 bg-white shadow-lg rounded-lg border-2 border-gray-100">
            <p className="text-lg font-semibold text-blue-500">
              Corrupted: {result.blue}%
            </p>
            <p className="text-lg font-semibold text-pink-500">
              Good: {result.pink}%
            </p>
          </div>
          <button
            onClick={() => setImageSrc(null)}
            className="mt-4 px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-lg hover:bg-pink-600"
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
