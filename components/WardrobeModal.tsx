/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback } from 'react';
import { ChevronLeftIcon, UploadCloudIcon, DownloadIcon } from './icons';
import Spinner from './Spinner';
import { getFriendlyErrorMessage } from '../lib/utils';
import { generateIdPhoto } from '../services/geminiService';

interface IdPhotoToolProps {
  onBack: () => void;
}

type SizeOption = '3x4 cm' | '4x6 cm';
type BackgroundOption = 'Trắng' | 'Xanh nhạt' | 'Xám';
type AspectRatioOption = 'Dọc' | 'Vuông' | 'Ngang';

const backgroundMapping: { [key in BackgroundOption]: string } = {
    'Trắng': 'White',
    'Xanh nhạt': 'Light Blue',
    'Xám': 'Gray',
};

const aspectRatioMapping: { [key in AspectRatioOption]: string } = {
    'Dọc': 'Portrait',
    'Vuông': 'Square',
    'Ngang': 'Landscape',
};


const IdPhotoTool: React.FC<IdPhotoToolProps> = ({ onBack }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [size, setSize] = useState<SizeOption>('3x4 cm');
    const [background, setBackground] = useState<BackgroundOption>('Trắng');
    const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('Dọc');
    const [numberOfImages, setNumberOfImages] = useState<number>(1);


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
                setGeneratedImages(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!imageFile || isLoading) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        try {
            const results = await generateIdPhoto(
                imageFile, 
                size, 
                backgroundMapping[background], 
                aspectRatioMapping[aspectRatio], 
                numberOfImages
            );
            setGeneratedImages(results);
        } catch (err) {
            setError(getFriendlyErrorMessage(err, 'Không thể tạo ảnh thẻ'));
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, isLoading, size, background, aspectRatio, numberOfImages]);

    const reset = () => {
        setOriginalImage(null);
        setGeneratedImages(null);
        setImageFile(null);
        setError(null);
        setIsLoading(false);
    }

    const handleDownload = (imageUrl: string, index: number) => {
      if (!imageUrl) return;
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `id_photo_${index + 1}_${imageFile?.name ?? 'image'}.png`;
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
                    <h1 className="text-3xl font-serif text-gray-900">Chuyên gia ảnh thẻ</h1>
                    <p className="text-gray-600 mt-2">Tạo ảnh thẻ chuyên nghiệp trong vài giây. Tải lên ảnh chân dung, chọn thông số kỹ thuật của bạn và để AI lo phần còn lại.</p>
                </header>

                <div className="flex-grow flex flex-col justify-center space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">1. Tải ảnh của bạn lên</h3>
                        {!originalImage ? (
                            <label htmlFor="image-upload" className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer">
                                <UploadCloudIcon className="w-8 h-8 mb-2" />
                                <span className="font-semibold">Nhấn để tải lên</span>
                            </label>
                        ) : (
                            <div className="flex flex-col items-center">
                                <img src={originalImage} alt="Original" className="max-w-full max-h-40 rounded-lg object-contain border border-gray-200" />
                                <button onClick={reset} className="text-sm font-semibold text-gray-600 hover:underline mt-2">Sử dụng ảnh khác</button>
                            </div>
                        )}
                        <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">2. Chọn kích thước</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {(['3x4 cm', '4x6 cm'] as SizeOption[]).map(s => (
                                <button key={s} onClick={() => setSize(s)} className={`p-2 rounded-md border text-sm transition-colors ${size === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">3. Chọn nền</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {(['Trắng', 'Xanh nhạt', 'Xám'] as BackgroundOption[]).map(bg => (
                                <button key={bg} onClick={() => setBackground(bg)} className={`p-2 rounded-md border text-sm transition-colors ${background === bg ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}>{bg}</button>
                            ))}
                        </div>
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
                        disabled={!originalImage || isLoading}
                        className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <><Spinner /> Đang tạo...</> : `Tạo ${numberOfImages} ảnh`}
                    </button>
                </div>
            </div>

            <main className="flex-grow flex items-center justify-center p-4 bg-gray-100 relative">
                <div className="w-full h-full flex items-center justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center text-center text-gray-600">
                            <Spinner />
                            <p className="text-lg font-serif mt-4">Đang tạo ảnh chuyên nghiệp của bạn...</p>
                        </div>
                    ) : generatedImages && generatedImages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl max-h-[90vh] overflow-y-auto p-4">
                            {generatedImages.map((img, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={img} alt={`Generated ID ${index + 1}`} className="rounded-lg shadow-lg object-cover w-full h-full" />
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
                        <div className="text-center text-gray-500">
                             <p className="text-xl font-serif">Ảnh thẻ đã tạo của bạn sẽ xuất hiện ở đây</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default IdPhotoTool;