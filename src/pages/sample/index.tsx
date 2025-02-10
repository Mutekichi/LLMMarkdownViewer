'use client';
import { HighlightableReactMarkdown } from '@/components/MarkdownViewer/HighlightableReactMarkdown';
import {
  HighlightInfo,
  HighlightRange,
} from '@/components/MarkdownViewer/HighlightableReactMarkdown/HighlightableElement';
import {
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
} from '@/components/ui/drawer';
import { Box, Button, Input } from '@chakra-ui/react';
import React, { useState } from 'react';

// サンプルのMarkdown
const markdownContent = `# Sample Markdown

This is a paragraph. Select a portion of this text to trigger a popover with actions.

Another paragraph is here. You can also select text here.
`;

const Sample: React.FC = () => {
  // ハイライト情報（各要素ごとの絶対オフセット情報）をオンメモリで管理
  const [highlightedPartInfo, setHighlightedPartInfo] = useState<
    HighlightInfo[]
  >([]);
  // メモ情報もオンメモリで管理（各ハイライトごとに memo 文字列を保存）
  const [memos, setMemos] = useState<
    { id: string; range: HighlightRange; memo: string }[]
  >([]);

  // Drawer表示状態などの管理
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 現在の選択（ハイライト対象）の情報
  const [currentSelection, setCurrentSelection] = useState<{
    id: string;
    startOffset: number;
    endOffset: number;
  } | null>(null);
  // 選択時のアクション。memoの場合はメモ入力、explainの場合は未実装（console.log）
  const [actionType, setActionType] = useState<'memo' | 'explain' | null>(null);
  // Drawer内の入力内容（メモ内容）
  const [inputText, setInputText] = useState('');

  // Saveボタン押下時の処理
  const handleDrawerSave = () => {
    if (currentSelection && actionType === 'memo') {
      // ハイライト情報の更新
      setHighlightedPartInfo((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.id === currentSelection.id,
        );
        const newRange: HighlightRange = {
          startOffset: currentSelection.startOffset,
          endOffset: currentSelection.endOffset,
        };
        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          // もし同じ範囲が存在しなければ追加（※単純な比較）
          const alreadyExists = existing.ranges.some(
            (r) =>
              r.startOffset === newRange.startOffset &&
              r.endOffset === newRange.endOffset,
          );
          if (!alreadyExists) {
            const updated = {
              ...existing,
              ranges: [...existing.ranges, newRange],
            };
            return [
              ...prev.slice(0, existingIndex),
              updated,
              ...prev.slice(existingIndex + 1),
            ];
          }
          return prev;
        } else {
          return [...prev, { id: currentSelection.id, ranges: [newRange] }];
        }
      });
      // メモ情報の更新
      setMemos((prev) => {
        const idx = prev.findIndex(
          (m) =>
            m.id === currentSelection!.id &&
            m.range.startOffset === currentSelection!.startOffset &&
            m.range.endOffset === currentSelection!.endOffset,
        );
        if (idx >= 0) {
          // 編集：更新する
          const updated = { ...prev[idx], memo: inputText };
          return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
        } else {
          // 新規追加
          return [
            ...prev,
            {
              id: currentSelection!.id,
              range: { ...currentSelection! },
              memo: inputText,
            },
          ];
        }
      });
    } else if (currentSelection && actionType === 'explain') {
      // 現状、"explain" アクションは未実装として console.log する
      console.log('Explain in more detail for', currentSelection);
    }
    // Drawerを閉じ、状態をリセット
    setDrawerOpen(false);
    setCurrentSelection(null);
    setActionType(null);
    setInputText('');
  };

  // Deleteボタン押下時：該当のハイライト（およびメモ情報）を削除
  const handleDrawerDelete = () => {
    if (currentSelection) {
      setHighlightedPartInfo((prev) =>
        prev
          .map((item) => {
            if (item.id === currentSelection.id) {
              return {
                ...item,
                ranges: item.ranges.filter(
                  (r) =>
                    !(
                      r.startOffset === currentSelection.startOffset &&
                      r.endOffset === currentSelection.endOffset
                    ),
                ),
              };
            }
            return item;
          })
          .filter((item) => item.ranges.length > 0),
      );
      setMemos((prev) =>
        prev.filter(
          (m) =>
            !(
              m.id === currentSelection!.id &&
              m.range.startOffset === currentSelection!.startOffset &&
              m.range.endOffset === currentSelection!.endOffset
            ),
        ),
      );
    }
    setDrawerOpen(false);
    setCurrentSelection(null);
    setActionType(null);
    setInputText('');
  };

  /**
   * renderPopover:
   * この関数は HighlightableElement から呼ばれ、選択されたテキストの情報（絶対オフセット＋対象要素のID）を受け取ります。
   * ここでは、その情報をもとに Drawer を開くための処理を行います。
   */
  const renderPopover = (
    info: {
      id: string;
      absoluteStart: number;
      absoluteEnd: number;
      anchorRect: DOMRect;
    },
    close: () => void,
  ) => {
    return (
      <Box p={2}>
        <Button
          colorScheme="blue"
          onClick={() => {
            setCurrentSelection({
              id: info.id,
              startOffset: info.absoluteStart,
              endOffset: info.absoluteEnd,
            });
            setActionType('memo');
            setDrawerOpen(true);
            close();
          }}
          mb={2}
        >
          Add memo
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => {
            setCurrentSelection({
              id: info.id,
              startOffset: info.absoluteStart,
              endOffset: info.absoluteEnd,
            });
            setActionType('explain');
            // For explain action, just log for now.
            console.log('Explain in more detail for element', info.id);
            close();
          }}
          mb={2}
        >
          Explain in more detail
        </Button>
        <Button variant="ghost" onClick={close}>
          Cancel
        </Button>
      </Box>
    );
  };

  // onHighlightedClick: クリックされたハイライト部分（既に memo が保存されている場合）
  const onHighlightedClick = (info: { id: string; range: HighlightRange }) => {
    // 検索して memo を取得
    const memoEntry = memos.find(
      (m) =>
        m.id === info.id &&
        m.range.startOffset === info.range.startOffset &&
        m.range.endOffset === info.range.endOffset,
    );
    setCurrentSelection({
      id: info.id,
      startOffset: info.range.startOffset,
      endOffset: info.range.endOffset,
    });
    setActionType('memo');
    setInputText(memoEntry ? memoEntry.memo : '');
    setDrawerOpen(true);
  };

  return (
    <Box p={4}>
      <HighlightableReactMarkdown
        markdown={markdownContent}
        highlightedPartInfo={highlightedPartInfo}
        renderPopover={renderPopover}
        onHighlightedClick={onHighlightedClick}
      />
      {/* Drawer: 表示内容は、memo入力の場合は memo の内容、ハイライト済み部分クリックの場合は既存 memo を表示 */}
      <DrawerRoot open={drawerOpen} onOpenChange={(e) => setDrawerOpen(e.open)}>
        <DrawerContent>
          <DrawerHeader>
            {actionType === 'memo' ? 'Memo' : 'Explain in More Detail'}
          </DrawerHeader>
          <DrawerBody>
            <Input
              placeholder={
                actionType === 'memo' ? 'Enter memo...' : 'Enter explanation...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </DrawerBody>
          <DrawerFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            {/* Deleteボタン：既存のハイライトの場合のみ表示（＝すでにメモがある場合） */}
            {currentSelection &&
              memos.some(
                (m) =>
                  m.id === currentSelection.id &&
                  m.range.startOffset === currentSelection.startOffset &&
                  m.range.endOffset === currentSelection.endOffset,
              ) && (
                <Button colorScheme="red" mr={3} onClick={handleDrawerDelete}>
                  Delete
                </Button>
              )}
            <Button colorScheme="blue" onClick={handleDrawerSave}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  );
};

export default Sample;
