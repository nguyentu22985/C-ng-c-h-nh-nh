/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REMIX_SUGGESTIONS = [
  "Ý tưởng Remix: Thêm xử lý hàng loạt để phục hồi nhiều ảnh cùng lúc.",
  "Ý tưởng Remix: Sử dụng công cụ ảnh thẻ để tạo ảnh chân dung LinkedIn chuyên nghiệp.",
  "Ý tưởng Remix: Cho phép người dùng nhập lời nhắc nền tùy chỉnh cho ảnh thẻ.",
  "Ý tưởng Remix: Thêm tùy chọn tô màu cho công cụ phục hồi ảnh.",
  "Ý tưởng Remix: Tạo công cụ 'Trưng bày sản phẩm' bằng cách tạo hình ảnh.",
  "Ý tưởng Remix: Xây dựng công cụ để xóa các vật thể không mong muốn khỏi hình ảnh.",
];

interface FooterProps {
}

const Footer: React.FC<FooterProps> = () => {
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prevIndex) => (prevIndex + 1) % REMIX_SUGGESTIONS.length);
    }, 4000); // Change suggestion every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200/60 p-3 z-50">
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 max-w-7xl px-4">
        <p>
          Tạo bởi{' '}
          <a 
            href="https://x.com/ammaar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-gray-800 hover:underline"
          >
            @ammaar
          </a>
        </p>
        <div className="h-4 mt-1 sm:mt-0 flex items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={suggestionIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="text-center sm:text-right"
              >
                {REMIX_SUGGESTIONS[suggestionIndex]}
              </motion.p>
            </AnimatePresence>
        </div>
      </div>
    </footer>
  );
};

export default Footer;