/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback } from 'react';
import { ChevronLeftIcon, UploadCloudIcon, DownloadIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { getFriendlyErrorMessage } from '../lib/utils';
import { generateProductShowcase } from '../services/geminiService';

interface ProductShowcaseToolProps {
  onBack: () => void;
}

type AspectRatioOption = 'Dọc' | 'Vuông' | 'Ngang';

const aspectRatioMapping: { [key in AspectRatioOption]: string } = {
    'Dọc': '9:16',
    'Vuông': '1:1',
    'Ngang': '16:9',
};

const ProductShowcaseTool: React.FC<ProductShowcaseToolProps> = ({ onBack }) => {
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [characterImageFile, setCharacterImageFile] = useState<File | null>(null);
  
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('Vuông');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'character' | 'product') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn một tệp hình ảnh hợp lệ.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        if (imageType === 'character') {
          setCharacterImage(imageUrl);
          setCharacterImageFile(file);
        } else {
          setProductImage(imageUrl);
          setProductImageFile(file);
        }
        setGeneratedImages(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!characterImageFile || !productImageFile || !prompt || isLoading) return;
    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);
    try {
      const results = await generateProductShowcase(characterImageFile, productImageFile, prompt, aspectRatioMapping[aspectRatio], numberOfImages);
      setGeneratedImages(results);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Không thể tạo ảnh sản phẩm'));
    } finally {
      setIsLoading(false);
    }
  }, [characterImageFile, productImageFile, prompt, isLoading, aspectRatio, numberOfImages]);

  const reset = (imageType: 'character' | 'product') => {
    if (imageType === 'character') {
        setCharacterImage(null);
        setCharacterImageFile(null);
    } else {
        setProductImage(null);
        setProductImageFile(null);
    }
    setGeneratedImages(null);
    setError(null);
  }

  const handleDownload = (imageUrl: string, index: number) => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `product_showcase_${index + 1}_generated.png`;
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
            <h1 className="text-3xl font-serif text-gray-900">Trưng bày sản phẩm</h1>
            <p className="text-gray-600 mt-2">Tải lên ảnh người mẫu và sản phẩm, sau đó mô tả một bối cảnh để kết hợp chúng.</p>
        </header>

        <div className="flex-grow flex flex-col justify-center space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">1. Tải ảnh nhân vật</h3>
              {!characterImage ? (
                <label htmlFor="character-image-upload" className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer">
                  <UploadCloudIcon className="w-8 h-8 mb-2" />
                  <span className="font-semibold">Nhấn để tải lên</span>
                </label>
              ) : (
                  <div className="flex flex-col items-center">
                      <img src={characterImage} alt="Character" className="max-w-full max-h-32 rounded-lg object-contain border border-gray-200" />
                      <button onClick={() => reset('character')} className="text-sm font-semibold text-gray-600 hover:underline mt-2">Sử dụng ảnh khác</button>
                  </div>
              )}
              <input id="character-image-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'character')} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">2. Tải ảnh sản phẩm</h3>
              {!productImage ? (
                <label htmlFor="product-image-upload" className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer">
                  <UploadCloudIcon className="w-8 h-8 mb-2" />
                  <span className="font-semibold">Nhấn để tải lên</span>
                </label>
              ) : (
                  <div className="flex flex-col items-center">
                      <img src={productImage} alt="Product" className="max-w-full max-h-32 rounded-lg object-contain border border-gray-200" />
                      <button onClick={() => reset('product')} className="text-sm font-semibold text-gray-600 hover:underline mt-2">Sử dụng ảnh khác</button>
                  </div>
              )}
              <input id="product-image-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'product')} />
            </div>
            
            <div>
              <label htmlFor="prompt-input" className="font-semibold text-gray-700">3. Mô tả bối cảnh</label>
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="ví dụ: người mẫu đang cầm túi xách trên một con phố ở Paris"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">4. Tỷ lệ khung hình</h3>
              <div className="grid grid-cols-3 gap-2">
                  {(['Dọc', 'Vuông', 'Ngang'] as AspectRatioOption[]).map(ratio => (
                      <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`p-2 rounded-md border text-sm transition-colors ${aspectRatio === ratio ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}>{ratio}</button>
                  ))}
              </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-700 mb-2">5. Số lượng ảnh</h3>
                  <select
                    value={numberOfImages}
                    onChange={(e) => setNumberOfImages(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>


            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Lỗi</p>
                <p>{error}</p>
            </div>}
        </div>
        
        <div className="mt-auto pt-6">
          <button
            onClick={handleGenerate}
            disabled={!characterImageFile || !productImageFile || !prompt || isLoading}
            className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <><Spinner /> Đang tạo...</> : `Tạo ${numberOfImages} ảnh`}
          </button>
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center p-4 bg-gray-100 relative">
        {isLoading ? (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Spinner />
                <p className="text-lg font-serif text-gray-700 mt-4">Đang tạo bối cảnh sản phẩm của bạn...</p>
            </div>
        ) : generatedImages && generatedImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl max-h-[90vh] overflow-y-auto p-4">
                {generatedImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                        <img src={img} alt={`Generated Product ${index + 1}`} className="rounded-lg shadow-lg object-cover w-full h-full" />
                        <button
                            onClick={() => handleDownload(img, index)}
                            className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500 transition-colors shadow-md z-10"
                            aria-label="Tải xuống ảnh"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        ) : (
          <AnimatePresence>
            {!characterImage && !productImage ? (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center text-gray-500">
                    <p className="text-xl font-serif">Ảnh sản phẩm của bạn sẽ xuất hiện ở đây</p>
                </motion.div>
            ) : (
                <div className="flex items-center justify-center gap-4 max-w-2xl w-full">
                    {characterImage && <img src={characterImage} alt="Character Preview" className="max-w-[45%] max-h-[80vh] rounded-lg object-contain shadow-lg" />}
                    {productImage && <img src={productImage} alt="Product Preview" className="max-w-[45%] max-h-[80vh] rounded-lg object-contain shadow-lg" />}
                </div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default ProductShowcaseTool;