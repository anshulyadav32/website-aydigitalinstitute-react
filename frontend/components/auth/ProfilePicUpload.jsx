import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FaUpload, FaTimes, FaCamera } from 'react-icons/fa';

const ProfilePicUpload = ({ currentPic, onUpload, onCancel }) => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const createPlaceholderImage = (text) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&background=0ea5e9&color=fff&size=128`;
  };

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = imageSrc;
    
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      await onUpload(croppedImageBlob);
      setImage(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
          {currentPic ? (
            <img src={currentPic} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FaCamera size={40} />
            </div>
          )}
        </div>
        <label className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full text-white cursor-pointer hover:bg-primary-700 transition-colors shadow-md">
          <FaUpload size={16} />
          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </label>
      </div>

      {image && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl overflow-hidden w-full max-w-lg shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Crop Profile Picture</h3>
              <button onClick={() => setImage(null)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="relative h-80 w-full bg-gray-900">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setImage(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 btn-primary py-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Set Profile Picture'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePicUpload;
