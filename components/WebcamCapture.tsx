// app/components/WebcamCapture.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImage(imageSrc);
        onCapture(imageSrc);
        setShowWebcam(false);
      }
    }
  }, [webcamRef, onCapture]);

  return (
    <div className="space-y-4">
      {image && (
        <div className="relative">
          <img src={image} alt="Captured" className="w-48 h-48 object-cover rounded-lg" />
          <button
            onClick={() => setImage(null)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
          >
            ×
          </button>
        </div>
      )}

      {showWebcam ? (
        <div className="space-y-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full max-w-md rounded-lg"
          />
          <div className="flex space-x-2">
            <button
              onClick={capture}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Capture Photo
            </button>
            <button
              onClick={() => setShowWebcam(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowWebcam(true)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          {image ? 'Retake Photo' : 'Take Photo with Webcam'}
        </button>
      )}
    </div>
  );
}