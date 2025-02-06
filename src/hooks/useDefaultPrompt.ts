export const useDefaultContent = () => {
  const defaultContent = `# Markdown記法サンプル

    めちゃくちゃ長い文章の表示は、どのようになるのでしょうか？確認したいですよね。今、その長い文章がどのように出力されるかのサンプルとして、この文章が生成されています。
    
    ## テキストスタイル
    **太字テキスト**
    *イタリック*
    ~~打ち消し線~~
    \`インラインコード\`
    
    ## リンク
    [Google](https://www.google.com)
    
    ## リスト
    - 項目1
      - ネスト項目1-1
      - ネスト項目1-2
    
    ## Math
    $\\frac{1}{2}$ + $\\frac{1}{3}$ = $\\frac{5}{6}$ のように、数式を記述できます。
    
    改行するとこのようになります。
    
    $$ E = mc^2 $$
    
    
    ## コードブロック
    \`\`\`python
    def hello():
        print("Hello, World!")
    \`\`\``;

  return defaultContent;
};
