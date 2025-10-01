/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tool } from './types';
import HubScreen from './components/StartScreen';
import PhotoRestorationTool from './components/Canvas';
import IdPhotoTool from './components/WardrobeModal';
import ComingSoonTool from './components/OutfitStack';
import Footer from './components/Footer';
import ProductShowcaseTool from './components/ProductShowcaseTool';
import ObjectRemovalTool from './components/ObjectRemovalTool';
import OfficeHeadshotTool from './components/OfficeHeadshotTool';
import { 
  SparklesIcon, 
  IdCardIcon, 
  BoxIcon, 
  ScissorsIcon, 
  BriefcaseIcon 
} from './components/icons';

const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const tools: Tool[] = [
    {
      id: 'restoration',
      name: 'Phục hồi ảnh',
      description: 'Phục hồi ảnh cũ, mờ hoặc hỏng về trạng thái ban đầu bằng công nghệ cải tiến do AI cung cấp.',
      icon: SparklesIcon,
      isAvailable: true,
    },
    {
      id: 'id-photo',
      name: 'Ảnh thẻ chuyên nghiệp',
      description: 'Tạo ảnh thẻ chuyên nghiệp (3x4, 4x6) với ánh sáng và trang phục hoàn hảo.',
      icon: IdCardIcon,
      isAvailable: true,
    },
    {
      id: 'product',
      name: 'Trưng bày sản phẩm',
      description: 'Tạo những bức ảnh sản phẩm chuyên nghiệp, tuyệt đẹp cho thương mại điện tử và tiếp thị.',
      icon: BoxIcon,
      isAvailable: true,
    },
    {
      id: 'remove-object',
      name: 'Xóa vật thể',
      description: 'Dễ dàng xóa các vật thể, người hoặc văn bản không mong muốn khỏi bất kỳ hình ảnh nào của bạn.',
      icon: ScissorsIcon,
      isAvailable: true,
    },
    {
      id: 'office-photo',
      name: 'Ảnh đại diện công sở',
      description: 'Biến những bức ảnh đời thường của bạn thành ảnh chân dung chuyên nghiệp phù hợp với hồ sơ công ty.',
      icon: BriefcaseIcon,
      isAvailable: true,
    },
  ];

  const handleSelectTool = (tool: Tool) => {
    if (tool.isAvailable) {
      setActiveToolId(tool.id);
    }
  };

  const handleBackToHub = () => {
    setActiveToolId(null);
  };
  
  const getActiveTool = () => tools.find(t => t.id === activeToolId);
  
  const renderActiveTool = () => {
    const tool = getActiveTool();
    if (!tool) return null;

    switch (tool.id) {
      case 'restoration':
        return <PhotoRestorationTool onBack={handleBackToHub} />;
      case 'id-photo':
        return <IdPhotoTool onBack={handleBackToHub} />;
      case 'product':
        return <ProductShowcaseTool onBack={handleBackToHub} />;
      case 'remove-object':
        return <ObjectRemovalTool onBack={handleBackToHub} />;
      case 'office-photo':
        return <OfficeHeadshotTool onBack={handleBackToHub} />;
      default:
        // Fallback for any unhandled tool IDs
        return <ComingSoonTool onBack={handleBackToHub} toolName={tool.name} />;
    }
  };

  const viewVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeToolId || 'hub'}
          variants={viewVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {!activeToolId ? (
            <HubScreen tools={tools} onSelectTool={handleSelectTool} />
          ) : (
            renderActiveTool()
          )}
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default App;