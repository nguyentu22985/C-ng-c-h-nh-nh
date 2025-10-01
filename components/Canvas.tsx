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
import { restorePhoto } from '../services/geminiService';

interface PhotoRestorationToolProps {
  onBack: () => void;
}

const PhotoRestorationTool: React.FC<PhotoRestorationToolProps> = ({ onBack }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState({
    fixDamage: true,
    enhanceColors: true,
    sharpenDetails: true,
  });

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

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
        setRestoredImage(null);
        setError(null);
        setOptions({ fixDamage: true, enhanceColors: true, sharpenDetails: true });
      };
      reader.readAsDataURL(file);
    }
  };

  // FIX: Defined handler functions inside the component to give them access to state variables (e.g. `imageFile`, `isLoading`) and state setters (e.g. `setError`, `setIsLoading`). This resolves the "Cannot find name" errors.
  const handleRestore = useCallback(async () => {
    if (!imageFile || isLoading) return;
    setIsLoading(true);
    setError(null);
    setRestoredImage(null);
    try {
      const result = await restorePhoto(imageFile, options);
      setRestoredImage(result);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Không thể phục hồi ảnh'));
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, isLoading, options]);

  const reset = () => {
    setOriginalImage(null);
    setRestoredImage(null);
    setImageFile(null);
    setError(null);
    setIsLoading(false);
    setOptions({
        fixDamage: true,
        enhanceColors: true,
        sharpenDetails: true,
    });
  }

  const handleDownload = () => {
    if (!restoredImage) return;
    const link = document.createElement('a');
    link.href = restoredImage;
    link.download = `restored_${imageFile?.name ?? 'image'}.png`;
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
            <h1 className="text-3xl font-serif text-gray-900">Phục hồi ảnh</h1>
            <p className="text-gray-600 mt-2">Thổi luồng sinh khí mới vào những kỷ niệm xưa. Tải ảnh lên để sửa vết xước, cải thiện màu sắc và tăng cường độ rõ nét.</p>
        </header>

        <div className="flex-grow flex flex-col justify-start space-y-6">
            <div>
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
            </div>

            {originalImage && (
                <div className="w-full">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Gợi ý phục hồi</h3>
                <p className="text-sm text-gray-600 mb-4">Chọn các cải tiến bạn muốn áp dụng. Để có kết quả tốt nhất, hãy bật tất cả các tùy chọn.</p>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input 
                        type="checkbox" 
                        checked={options.fixDamage} 
                        onChange={() => handleOptionChange('fixDamage')}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                        <span className="font-semibold text-gray-800">Sửa hư hỏng vật lý</span>
                        <p className="text-xs text-gray-600">Loại bỏ vết xước, vết rách và các khuyết điểm khác.</p>
                    </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input 
                        type="checkbox" 
                        checked={options.enhanceColors} 
                        onChange={() => handleOptionChange('enhanceColors')}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                        <span className="font-semibold text-gray-800">Cải thiện màu sắc</span>
                        <p className="text-xs text-gray-600">Khôi phục màu sắc bị phai và điều chỉnh cân bằng trắng.</p>
                    </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input 
                        type="checkbox" 
                        checked={options.sharpenDetails} 
                        onChange={() => handleOptionChange('sharpenDetails')}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                        <span className="font-semibold text-gray-800">Tăng độ nét chi tiết</span>
                        <p className="text-xs text-gray-600">Làm rõ các chi tiết bị mờ, đặc biệt là khuôn mặt.</p>
                    </div>
                    </label>
                </div>
                </div>
            )}

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6 rounded-md" role="alert">
                <p className="font-bold">Lỗi</p>
                <p>{error}</p>
            </div>}
        </div>
        
        <div className="mt-auto pt-6">
          <button
            onClick={handleRestore}
            disabled={!originalImage || isLoading}
            className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <><Spinner /> Đang phục hồi...</> : 'Phục hồi ảnh'}
          </button>
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center p-4 bg-gray-100 relative">
          <AnimatePresence>
            {!originalImage && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center text-gray-500">
                    <p className="text-xl font-serif">Ảnh đã phục hồi của bạn sẽ xuất hiện ở đây</p>
                </motion.div>
            )}
          </AnimatePresence>
          {originalImage && (
             <div className="relative w-full max-w-2xl">
                <Compare
                  firstImage={originalImage}
                  secondImage={restoredImage ?? originalImage}
                  className="w-full aspect-[3/4] rounded-2xl bg-gray-200 shadow-lg"
                />
                {restoredImage && (
                    <button
                        onClick={handleDownload}
                        className="absolute top-4 right-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors z-40 flex items-center gap-2"
                        aria-label="Tải xuống ảnh"
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
                  <p className="text-lg font-serif text-gray-700 mt-4">Đang phục hồi những kỷ niệm của bạn...</p>
              </div>
            )}
      </main>
    </div>
  );
};

export default PhotoRestorationTool;