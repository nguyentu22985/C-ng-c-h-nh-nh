/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ChevronLeftIcon } from './icons';

interface ComingSoonToolProps {
  onBack: () => void;
  toolName?: string;
}

const ComingSoonTool: React.FC<ComingSoonToolProps> = ({ onBack, toolName = "Công cụ" }) => {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-4">
       <div className="absolute top-6 left-6">
          <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Quay lại Hub
          </button>
       </div>
       <div className="text-center">
        <h1 className="text-4xl font-serif text-gray-800">{toolName}</h1>
        <p className="mt-4 text-2xl font-bold text-gray-900">Sắp ra mắt!</p>
        <p className="mt-2 text-gray-600">Tính năng này đang được xây dựng. Vui lòng kiểm tra lại sau!</p>
       </div>
    </div>
  );
};

export default ComingSoonTool;