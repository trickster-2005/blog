const fs = require('fs');
const path = require('path');
const moment = require('moment'); // 用來取得與格式化時間

// 註冊一個自定指令：hexo mood "內容"
hexo.extend.console.register('mood', 'Add a mood entry', (args) => {
  console.log('args:', args); // 印出傳入參數供除錯用

  // 將指令中的文字內容合併成一段（多個字串會組成一段完整內容）
  const content = args._.join(' ');
  const date = moment().format('YYYY-MM-DD HH:mm:ss'); // 取得現在時間，格式化

  // 檢查是否有輸入內容
  if (!content) {
    console.log('無效的參數，請提供心情內容');
    return;
  }

  // 心情紀錄的檔案位置（固定在 source/mood/index.md）
  const filePath = path.join(hexo.base_dir, 'source', 'mood', 'index.md');

  // 新增一筆心情資料，格式為 Markdown 條列
  const entry = `- ${date}\n  ${content}\n`;

  // 若檔案不存在，提醒使用者先手動建立 mood 頁面
  if (!fs.existsSync(filePath)) {
    console.log('找不到 index.md，請先建立 mood 頁面');
    return;
  }

  // 讀取現有 mood/index.md 的內容
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const splitMarker = '{{ mood_entries }}'; // 標記：心情要插在這個區塊後

  // 檢查檔案中是否有指定標記
  if (!fileContent.includes(splitMarker)) {
    console.log(`找不到 ${splitMarker}，請確認 index.md 有這個佔位標籤`);
    return;
  }

  // 將內容切成兩段：前面是 YAML + mood_entries，後面是歷史心情
  const [head, ...rest] = fileContent.split(splitMarker);
  const afterMarkerContent = rest.join(splitMarker).trim(); // 接在 {{ mood_entries }} 後的舊心情（可能為空）

  // 將新的心情加在最上面，再把舊的心情接在下面
  const newContent =
    `${head}${splitMarker}\n\n${entry}${afterMarkerContent ? '\n' + afterMarkerContent : ''}\n`;

  // 寫回檔案
  fs.writeFileSync(filePath, newContent, 'utf8');

  // 提示使用者
  console.log('✅ 心情已新增在 {{ mood_entries }} 之後（最新在最上）');
});
