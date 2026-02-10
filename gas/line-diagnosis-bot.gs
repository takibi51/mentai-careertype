/**
 * ============================================
 * Mentai 性格診断 - GAS Backend
 * ============================================
 * 
 * 【機能】
 * 1. 診断データの受信・スプレッドシートへの保存 (doPost)
 * 2. LINE Webhook受信・結果URL自動送信 (doPost - LINE events)
 * 
 * 【セットアップ手順】
 * 1. Google Apps Scriptで新しいプロジェクトを作成
 * 2. このコードを貼り付け
 * 3. 以下の定数を実際の値に置き換え:
 *    - LINE_CHANNEL_ACCESS_TOKEN: LINE Messaging APIのチャネルアクセストークン
 *    - SPREADSHEET_ID: データ保存用スプレッドシートのID
 * 4. ウェブアプリとしてデプロイ（「全員」がアクセス可能に設定）
 * 5. デプロイURLを以下に設定:
 *    - diagnosis.js の GAS_ENDPOINT にデプロイURLを設定
 *    - LINE Developers Console の Webhook URL にデプロイURLを設定
 */

// ===== 設定 =====
const LINE_CHANNEL_ACCESS_TOKEN = 'WEh6lXfK/WNMbBbh6ZJlbwuaecCcOKAAv92kAArlOH+ycaUPIaQZNqFYYx9G/+udqt5rZL8N1VzemWR60L9Ekscc+NNHiXBlpJ5J5Tl88XrR1VoT+8mxyUczKu5J1ZtMLWBVg3KSY+QOPSW6D8afswdB04t89/1O/w1cDnyilFU=';
const SPREADSHEET_ID = '1RKkuzv3Vyhy1M_i3JrSdm5dC7VyquOFGxzT0iwVbn1c';

// ===== タイプ番号→結果URL マッピング =====
const RESULT_URLS = {
  1:  { name: 'アーキメイジ', url: 'https://careerjob.mentailab.com/characters-1' },
  2:  { name: 'シャーマン',   url: 'https://careerjob.mentailab.com/characters-2' },
  3:  { name: 'クラフター',   url: 'https://careerjob.mentailab.com/characters-3' },
  4:  { name: 'パラディン',   url: 'https://careerjob.mentailab.com/characters-4' },
  5:  { name: 'メイジ',       url: 'https://careerjob.mentailab.com/characters-5' },
  6:  { name: 'ストラテジスト', url: 'https://careerjob.mentailab.com/characters-6' },
  7:  { name: 'ウォリアー',   url: 'https://careerjob.mentailab.com/characters-7' },
  8:  { name: 'ガーディアン', url: 'https://careerjob.mentailab.com/characters-8' },
  9:  { name: 'ストーリーテラー', url: 'https://careerjob.mentailab.com/characters-9' },
  10: { name: 'アーティスト', url: 'https://careerjob.mentailab.com/characters-10' },
  11: { name: 'ヒーラー',     url: 'https://careerjob.mentailab.com/characters-11' },
  12: { name: 'モンク',       url: 'https://careerjob.mentailab.com/characters-12' },
  13: { name: 'イノベーター', url: 'https://careerjob.mentailab.com/characters-13' },
  14: { name: 'プランナー',   url: 'https://careerjob.mentailab.com/characters-14' },
  15: { name: 'リフォーマー', url: 'https://careerjob.mentailab.com/characters-15' },
  16: { name: 'セージ',       url: 'https://careerjob.mentailab.com/characters-16' }
};

// ===== タイプ別アイコン =====
const TYPE_ICONS = {
  1: '🧙‍♂️', 2: '🔮', 3: '⚒️', 4: '🏅',
  5: '✨', 6: '🎯', 7: '⚔️', 8: '🛡️',
  9: '📚', 10: '🎨', 11: '💚', 12: '🧘',
  13: '💡', 14: '📋', 15: '🔧', 16: '📖'
};


/**
 * POST リクエストハンドラ
 * - フロントエンドからの診断データ保存
 * - LINE Webhookイベントの処理
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // LINE Webhookイベントの場合
    if (data.events) {
      handleLineWebhook(data);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // app.mentai.me からの結果送信リクエスト
    if (data.action === 'send_result') {
      const result = handleSendResultAction(data);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // フロントエンドからの診断データの場合
    if (data.session_id && data.result_type) {
      saveDiagnosisData(data);
      return ContentService.createTextOutput(JSON.stringify({ status: 'saved', session_id: data.session_id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'unknown_request' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('doPost Error:', error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * 診断データをスプレッドシートに保存
 */
function saveDiagnosisData(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('診断データ');
  
  // シートがなければ作成
  if (!sheet) {
    sheet = ss.insertSheet('診断データ');
    sheet.appendRow([
      'タイムスタンプ', 'Session ID', 'タイプID', 'タイプ名', 
      'タイプ番号', '結果URL', '回答データ'
    ]);
    // ヘッダー行のスタイル
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    data.session_id,
    data.result_type,
    data.result_name || '',
    data.result_number,
    data.result_url || '',
    JSON.stringify(data.answers || [])
  ]);
}


/**
 * LINE Webhookイベント処理
 */
function handleLineWebhook(data) {
  const events = data.events;
  
  events.forEach(event => {
    const userId = event.source.userId;
    
    // 友だち追加イベント
    if (event.type === 'follow') {
      handleFollowEvent(userId, event);
    }
    
    // メッセージイベント（「結果」と送信された場合など）
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.trim();
      if (text === '結果' || text === '診断結果') {
        // 最新の診断結果を検索して送信
        sendLatestResultToUser(userId, event.replyToken);
      }
    }
  });
}


/**
 * 友だち追加時の処理
 * LINE auth URLの result パラメータで結果を特定
 */
function handleFollowEvent(userId, event) {
  // 友だち追加時にウェルカムメッセージと結果を送信
  // ※ LINE auth URL から渡された result パラメータは
  //    app.mentai.me のバックエンドで処理される想定
  //    ここではユーザーのLINE IDに紐づく最新の結果を検索
  
  const replyToken = event.replyToken;
  
  // スプレッドシートから最新の結果を取得（直近5分以内）
  const result = findRecentResult();
  
  if (result) {
    sendResultMessage(replyToken, result.resultNumber, userId);
  } else {
    // 結果が見つからない場合のウェルカムメッセージ
    sendWelcomeMessage(replyToken);
  }
}


/**
 * 直近の診断結果を検索（直近5分以内のもの）
 */
function findRecentResult() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('診断データ');
    if (!sheet) return null;
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return null;
    
    // 最新の行から検索（直近5分以内）
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    for (let i = lastRow; i >= 2; i--) {
      const row = sheet.getRange(i, 1, 1, 6).getValues()[0];
      const timestamp = new Date(row[0]);
      
      if (timestamp < fiveMinAgo) break; // 5分以上前ならストップ
      
      return {
        sessionId: row[1],
        resultType: row[2],
        resultName: row[3],
        resultNumber: parseInt(row[4]),
        resultUrl: row[5]
      };
    }
  } catch (e) {
    console.error('findRecentResult Error:', e);
  }
  return null;
}


/**
 * LINE IDとセッションの紐付けを保存
 */
function saveLineUserMapping(userId, sessionId, resultNumber) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('LINE紐付け');
  
  if (!sheet) {
    sheet = ss.insertSheet('LINE紐付け');
    sheet.appendRow(['タイムスタンプ', 'LINE User ID', 'Session ID', 'タイプ番号', '結果送信済み']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#34a853').setFontColor('white');
    sheet.setFrozenRows(1);
  }
  
  sheet.appendRow([new Date(), userId, sessionId, resultNumber, 'YES']);
}


/**
 * 結果メッセージをLINEで送信（Reply）
 */
function sendResultMessage(replyToken, resultNumber, userId) {
  const result = RESULT_URLS[resultNumber];
  if (!result) {
    sendWelcomeMessage(replyToken);
    return;
  }
  
  const icon = TYPE_ICONS[resultNumber] || '⭐';
  const typeLetter = String.fromCharCode(64 + resultNumber); // 1→A, 2→B...
  
  const messages = [
    {
      type: 'text',
      text: `🎉 診断結果が届きました！\n\n${icon} あなたのジョブタイプは...\n\n【TYPE ${typeLetter}】${result.name}\n\n▼ 詳しい結果はこちら ▼`
    },
    {
      type: 'text',
      text: `${result.url}\n\nあなたの性格・強みの詳細と、\n適性のある職種がわかります！\n\n━━━━━━━━━━━━━\n📌 Mentai ジョブタイプ診断\n━━━━━━━━━━━━━`
    }
  ];
  
  replyMessage(replyToken, messages);
  
  // 紐付け保存
  if (userId) {
    saveLineUserMapping(userId, '', resultNumber);
  }
}


/**
 * ウェルカムメッセージ送信
 */
function sendWelcomeMessage(replyToken) {
  const messages = [
    {
      type: 'text',
      text: '🎮 Mentaiジョブタイプ診断へようこそ！\n\nまだ診断を受けていない場合は、\n以下のリンクから診断できます：\n\nhttps://dr.mentai.me/diagnosis.html\n\n12の質問であなたのジョブタイプがわかります！'
    }
  ];
  
  replyMessage(replyToken, messages);
}


/**
 * ユーザーの最新結果を送信
 */
function sendLatestResultToUser(userId, replyToken) {
  // LINE紐付けシートからユーザーの結果を検索
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('LINE紐付け');
    
    if (sheet) {
      const lastRow = sheet.getLastRow();
      for (let i = lastRow; i >= 2; i--) {
        const row = sheet.getRange(i, 1, 1, 4).getValues()[0];
        if (row[1] === userId) {
          const resultNumber = parseInt(row[3]);
          sendResultMessage(replyToken, resultNumber, userId);
          return;
        }
      }
    }
  } catch (e) {
    console.error('sendLatestResultToUser Error:', e);
  }
  
  // 結果が見つからない場合
  replyMessage(replyToken, [{
    type: 'text',
    text: '❓ 診断結果が見つかりませんでした。\n\n以下のリンクから診断を受けてみてください：\nhttps://dr.mentai.me/diagnosis.html'
  }]);
}


/**
 * LINE Push Message（プッシュ通知）
 * ※ 友だち追加後に result パラメータで結果を送信する場合に使用
 */
function pushResultMessage(userId, resultNumber) {
  const result = RESULT_URLS[resultNumber];
  if (!result) return;
  
  const icon = TYPE_ICONS[resultNumber] || '⭐';
  const typeLetter = String.fromCharCode(64 + resultNumber);
  
  const messages = [
    {
      type: 'text',
      text: `🎉 診断結果が届きました！\n\n${icon} あなたのジョブタイプは...\n\n【TYPE ${typeLetter}】${result.name}\n\n▼ 詳しい結果はこちら ▼`
    },
    {
      type: 'text',
      text: `${result.url}\n\nあなたの性格・強みの詳細と、\n適性のある職種がわかります！\n\n━━━━━━━━━━━━━\n📌 Mentai ジョブタイプ診断\n━━━━━━━━━━━━━`
    }
  ];
  
  pushMessage(userId, messages);
  saveLineUserMapping(userId, '', resultNumber);
}


/**
 * LINE Reply Message API
 */
function replyMessage(replyToken, messages) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify({
      replyToken: replyToken,
      messages: messages
    })
  });
}


/**
 * LINE Push Message API
 */
function pushMessage(userId, messages) {
  const url = 'https://api.line.me/v2/bot/message/push';
  
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify({
      to: userId,
      messages: messages
    })
  });
}


/**
 * app.mentai.me から呼び出す用のAPI
 * LINE認証完了後に、ユーザーIDと結果番号を受け取って結果を送信
 * 
 * 呼び出し例:
 * POST {GAS_URL}
 * Body: { "action": "send_result", "line_user_id": "U...", "result": 8 }
 */
function handleSendResultAction(data) {
  const userId = data.line_user_id;
  const resultNumber = parseInt(data.result);
  
  if (userId && resultNumber) {
    pushResultMessage(userId, resultNumber);
    return { status: 'sent', result: resultNumber };
  }
  
  return { status: 'error', message: 'Missing line_user_id or result' };
}
