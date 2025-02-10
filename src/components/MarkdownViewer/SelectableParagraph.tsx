import React from 'react';

interface SelectableParagraphProps {
  children?: React.ReactNode;
}

const SelectableParagraph: React.FC<SelectableParagraphProps> = (props) => {
  const handleMouseUp = (e: React.MouseEvent<HTMLParagraphElement>) => {
    // 現在の選択範囲を取得
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return; // 選択がない場合は何もしない

    const range = selection.getRangeAt(0);

    // 選択範囲が複数のノードにまたがっていないか判定
    if (range.startContainer !== range.endContainer) {
      console.log(
        '選択範囲が複数のノードにまたがっています。処理を中断します。',
      );
      return;
    }

    // 選択されているノードがテキストノードであるかチェック
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) {
      console.log('選択されたノードはテキストノードではありません。');
      return;
    }

    // 選択の開始・終了オフセットを取得
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    // 元のテキスト内容を取得
    const originalText = textNode.textContent || '';
    const selectedText = originalText.substring(startOffset, endOffset);

    // 選択部分のみをラップするための <span> を作成
    const span = document.createElement('span');
    span.style.color = 'red'; // 選択部分の文字色を赤に変更
    span.textContent = selectedText;

    // 選択範囲前後のテキストノードを作成
    const beforeText = document.createTextNode(
      originalText.substring(0, startOffset),
    );
    const afterText = document.createTextNode(
      originalText.substring(endOffset),
    );

    // 元のテキストノードを、前半、ラップした選択部分、後半の順に置き換える
    const parent = textNode.parentNode;
    if (!parent) return;
    parent.insertBefore(beforeText, textNode);
    parent.insertBefore(span, textNode);
    parent.insertBefore(afterText, textNode);
    parent.removeChild(textNode);

    // 選択状態をクリア
    selection.removeAllRanges();
  };

  return <p onMouseUp={handleMouseUp}>{props.children}</p>;
};

export default SelectableParagraph;
