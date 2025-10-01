/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { Tool } from '../types';
import { cn } from '../lib/utils';

interface HubScreenProps {
  tools: Tool[];
  onSelectTool: (tool: Tool) => void;
}

const HubScreen: React.FC<HubScreenProps> = ({ tools, onSelectTool }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <header className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
          Bộ công cụ hình ảnh AI
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Giải pháp tất cả trong một của bạn để tạo và chỉnh sửa hình ảnh do AI cung cấp. Chọn một công cụ bên dưới để bắt đầu.
        </p>
      </header>
      
      <motion.main 
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tools.map((tool) => (
          <motion.div key={tool.id} variants={itemVariants}>
            <button
              onClick={() => onSelectTool(tool)}
              disabled={!tool.isAvailable}
              className={cn(
                "w-full h-full text-left p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col group",
                !tool.isAvailable && "opacity-60 cursor-not-allowed hover:shadow-sm hover:-translate-y-0"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <tool.icon className="w-6 h-6 text-gray-700" />
                </div>
                {!tool.isAvailable && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Sắp ra mắt
                  </span>
                )}
              </div>
              <h2 className="text-xl font-serif font-semibold text-gray-800 mt-4">{tool.name}</h2>
              <p className="text-sm text-gray-600 mt-1 flex-grow">{tool.description}</p>
              <div className="mt-4 text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {tool.isAvailable ? 'Khởi chạy công cụ →' : 'Không có sẵn'}
              </div>
            </button>
          </motion.div>
        ))}
      </motion.main>
    </div>
  );
};

export default HubScreen;