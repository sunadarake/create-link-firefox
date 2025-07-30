/**
 * Create Link拡張機能のバックグラウンドスクリプト
 * ブラウザアクションのクリックを監視し、HTMLリンクを生成する
 */

/**
 * HTMLエンティティをエスケープする関数
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (match) => map[match]);
};

/**
 * HTMLリンクを生成する関数
 * @param {string} url - リンクのURL
 * @param {string} title - リンクのタイトル
 * @returns {string} 生成されたHTMLリンク
 */
const createHtmlLink = (url, title) => {
  // URLとタイトルをHTMLエスケープ
  const escapedUrl = escapeHtml(url);
  const escapedTitle = escapeHtml(title);
  
  // HTMLリンクを生成
  return `<a href="${escapedUrl}" target="_blank">${escapedTitle}</a>`;
};

/**
 * テキストをクリップボードにコピーする関数
 * @param {string} text - コピーするテキスト
 */
const copyToClipboard = (text) => {
  // テキストエリア要素を作成してテキストをコピー
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

/**
 * アクティブなタブの情報を取得してHTMLリンクを作成する関数
 */
const createLinkFromActiveTab = () => {
  // アクティブなタブの情報を取得
  browser.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => {
      if (tabs.length === 0) {
        console.error('アクティブなタブが見つかりません');
        return;
      }

      const activeTab = tabs[0];
      const url = activeTab.url;
      const title = activeTab.title;

      // URLまたはタイトルが取得できない場合はエラー
      if (!url || !title) {
        console.error('URLまたはタイトルが取得できません');
        return;
      }

      // HTMLリンクを生成
      const htmlLink = createHtmlLink(url, title);
      
      // コンテンツスクリプトを実行してクリップボードにコピー
      browser.tabs.executeScript(activeTab.id, {
        code: `
          // テキストをクリップボードにコピーする即座に実行される関数
          (() => {
            const textarea = document.createElement('textarea');
            textarea.value = \`${htmlLink.replace(/`/g, '\\`')}\`;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            // 成功通知（コンソールに出力）
            console.log('HTMLリンクがクリップボードにコピーされました:', textarea.value);
          })();
        `
      }).then(() => {
        console.log('HTMLリンクがクリップボードにコピーされました:', htmlLink);
      }).catch((error) => {
        console.error('クリップボードへのコピーに失敗しました:', error);
      });
    })
    .catch((error) => {
      console.error('タブ情報の取得に失敗しました:', error);
    });
};

// ブラウザアクション（ツールバーボタン）がクリックされた時のイベントリスナー
browser.browserAction.onClicked.addListener((tab) => {
  createLinkFromActiveTab();
});