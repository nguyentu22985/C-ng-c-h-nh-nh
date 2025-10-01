/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback } from 'react';
import { ChevronLeftIcon, UploadCloudIcon, DownloadIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { getFriendlyErrorMessage } from '../lib/utils';
import { Compare } from './ui/compare';
import { removeObjectFromPhoto } from '../services/geminiService';

interface ObjectRemovalToolProps {
  onBack: () => void;
}

const ObjectRemovalTool: React.FC<ObjectRemovalToolProps> = ({ onBack }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn một tệp hình ảnh hợp lệ.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setImageFile(file);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = useCallback(async () => {
    if (!imageFile || !prompt || isLoading) return;
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const result = await removeObjectFromPhoto(imageFile, prompt);
      setEditedImage(result);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Không thể xóa vật thể'));
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt, isLoading]);

  const reset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setImageFile(null);
    setError(null);
    setIsLoading(false);
  }

  const handleDownload = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `edited_${imageFile?.name ?? 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="w-full min-h-screen bg-white flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 md:max-w-sm flex flex-col p-6 bg-gray-50/80 border-r border-gray-200/80">
        <header className="mb-8">
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-4">
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Quay lại Hub
            </button>
            <h1 className="text-3xl font-serif text-gray-900">Xóa vật thể</h1>
            <p className="text-gray-600 mt-2">Tải lên một hình ảnh và mô tả đối tượng bạn muốn xóa. AI sẽ lấp đầy không gian một cách liền mạch.</p>
        </header>

        <div className="flex-grow flex flex-col justify-center space-y-4">
            {!originalImage ? (
              <label htmlFor="image-upload" className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer">
                <UploadCloudIcon className="w-8 h-8 mb-2" />
                <span className="font-semibold">Nhấn để tải ảnh lên</span>
                <span className="text-xs mt-1">PNG, JPG, WEBP, v.v.</span>
              </label>
            ) : (
                <div className="flex flex-col items-center">
                    <img src={originalImage} alt="Original" className="max-w-full max-h-48 rounded-lg object-contain border border-gray-200" />
                    <button onClick={reset} className="text-sm font-semibold text-gray-600 hover:underline mt-3">Sử dụng ảnh khác</button>
                </div>
            )}
            <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            
            <div>
              <label htmlFor="prompt-input" className="font-semibold text-gray-700">Đối tượng cần xóa</label>
              <input
                id="prompt-input"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="ví dụ: người đàn ông ở phía sau"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Lỗi</p>
                <p>{error}</p>
            </div>}
        </div>
        
        <div className="mt-auto pt-6">
          <button
            onClick={handleRemove}
            disabled={!originalImage || !prompt || isLoading}
            className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <><Spinner /> Đang xóa...</> : 'Xóa vật thể'}
          </button>
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center p-4 bg-gray-100 relative">
          <AnimatePresence>
            {!originalImage && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center text-gray-500">
                    <p className="text-xl font-serif">Ảnh đã chỉnh sửa của bạn sẽ xuất hiện ở đây</p>
                </motion.div>
            )}
          </AnimatePresence>
          {originalImage && (
            <div className="relative w-full max-w-2xl">
                <Compare
                  firstImage={originalImage}
                  secondImage={editedImage ?? originalImage}
                  className="w-full aspect-auto rounded-2xl bg-gray-200 shadow-lg"
                />
                {editedImage && (
                    <button
                        onClick={handleDownload}
                        className="absolute top-4 right-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors z-40 flex items-center gap-2"
                        aria-label="Tải xuống ảnh đã chỉnh sửa"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Tải xuống
                    </button>
                )}
            </div>
          )}
           {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Spinner />
                  <p className="text-lg font-serif text-gray-700 mt-4">Đang xóa đối tượng và tái tạo hình ảnh...</p>
              </div>
            )}
      </main>
    </div>
  );
};

export default ObjectRemovalTool;