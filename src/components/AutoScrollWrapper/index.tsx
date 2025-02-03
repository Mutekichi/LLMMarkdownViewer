import { Box } from '@chakra-ui/react';
import React, { ReactNode, useEffect, useRef } from 'react';

interface AutoScrollWrapperProps {
  children: ReactNode;
  /** コンテンツが更新されたことを検知するための依存配列 */
  dependencies: any[];
  /** 一番下とみなす閾値（ピクセル） デフォルトは20px */
  threshold?: number;
  /** コンテナのカスタムクラス */
  className?: string;
}

const AutoScrollWrapper: React.FC<AutoScrollWrapperProps> = ({
  children,
  dependencies,
  threshold = 20,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);

  // スクロール位置の監視
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // 指定された閾値以内にいる場合は「一番下」とみなす
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) < threshold;
    isScrolledToBottomRef.current = isAtBottom;
  };

  // コンテンツ更新時の自動スクロール
  useEffect(() => {
    if (!containerRef.current || !isScrolledToBottomRef.current) return;

    const scrollToBottom = () => {
      if (!containerRef.current) return;
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    };

    scrollToBottom();
  }, dependencies);

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      className={`w-full h-full overflow-y-auto ${className}`}
      w="100%"
    >
      {children}
    </Box>
  );
};

export default AutoScrollWrapper;
