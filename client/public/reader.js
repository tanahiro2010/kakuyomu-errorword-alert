"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const apiBaseUrl = "https://kakuyomu.herentongkegu087.workers.dev";
const button = document.createElement('button');
button.className = "border rounded p-2 hover:bg-gray-100 ml-5";
button.textContent = "誤字報告";
const episodeFooterActionCheerButtonContainer = document.getElementById('episodeFooter-action-cheerButtons');
if (episodeFooterActionCheerButtonContainer) {
    episodeFooterActionCheerButtonContainer.appendChild(button);
}
function getMetadata() {
    var _a;
    const metaScript = document.querySelectorAll('#page-works-episodes-episode script')[0];
    if (!metaScript) {
        console.error("Metadata script not found.");
        return {};
    }
    const meta = ((_a = metaScript.innerHTML) !== null && _a !== void 0 ? _a : "\n").split('\n')[1].trim();
    if (!meta.startsWith('dataLayer = ')) {
        console.error("Metadata format is incorrect.");
        return {};
    }
    const json = meta.replace(';', '').replace('dataLayer = ', '');
    return JSON.parse(json)[0];
}
function displayForm(contentElement) {
    // 既存のフォームがあれば削除
    const existingForm = document.getElementById('gozishusei-form');
    if (existingForm) {
        existingForm.remove();
    }
    // 元のコンテンツを段落ごとに保存
    const originalParagraphs = Array.from(contentElement.querySelectorAll('p')).map(p => ({
        id: p.id,
        text: p.textContent || '',
        html: p.innerHTML
    }));
    // フォームコンテナを作成
    const formContainer = document.createElement('section');
    formContainer.id = 'gozishusei-form';
    formContainer.className = 'widget-cheerCommentsForm js-episode-comment-creation-panel js-onetime-focus-reaction-container isShown isFocused';
    formContainer.style.cssText = 'margin-top: 20px; border: 2px solid #ff6b6b; border-radius: 8px; padding: 20px; background-color: #fff5f5;';
    // フォーム作成
    const form = document.createElement('form');
    form.method = 'post';
    form.className = 'js-episode-error-report-form';
    // エラーメッセージボックス
    const errorMessage = document.createElement('p');
    errorMessage.className = 'ui-message-attention js-episode-error-message-box isHidden';
    // フォームタイトル
    const title = document.createElement('h3');
    title.textContent = '誤字・脱字報告';
    title.style.cssText = 'color: #ff6b6b; margin-bottom: 15px; font-size: 18px; font-weight: bold;';
    // 説明文
    const instruction = document.createElement('p');
    instruction.textContent = '本文を直接編集してください。変更された段落のみが修正提案として送信されます。';
    instruction.style.cssText = 'margin-bottom: 15px; padding: 10px; background-color: #f0f8ff; border-left: 4px solid #007acc; font-size: 14px;';
    // 隠しフィールドで変更された段落のみを送信
    const changedParagraphsInput = document.createElement('input');
    changedParagraphsInput.type = 'hidden';
    changedParagraphsInput.name = 'changed_paragraphs';
    changedParagraphsInput.id = 'changed-paragraphs-input';
    // 追加コメント用のテキストエリア
    const commentSection = document.createElement('div');
    commentSection.style.cssText = 'margin-bottom: 15px;';
    const commentLabel = document.createElement('label');
    commentLabel.textContent = '追加コメント（任意）:';
    commentLabel.style.cssText = 'display: block; margin-bottom: 5px; font-weight: bold;';
    const commentTextarea = document.createElement('textarea');
    commentTextarea.id = 'error-report-comment';
    commentTextarea.name = 'comment';
    commentTextarea.placeholder = '修正理由や補足説明があれば入力してください';
    commentTextarea.style.cssText = 'width: 100%; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;';
    commentSection.appendChild(commentLabel);
    commentSection.appendChild(commentTextarea);
    // フッター部分
    const footer = document.createElement('footer');
    footer.className = 'widget-cheerCommentsForm-footer';
    // 情報表示部分
    const infoDiv = document.createElement('div');
    infoDiv.className = 'widget-cheerCommentsForm-footer-info';
    const infoList = document.createElement('dl');
    infoList.innerHTML = `
        <dt><span>報告タイプ</span></dt>
        <dd>誤字・脱字修正提案</dd>
        <dt><span>エピソード</span></dt>
        <dd>${document.title}</dd>
    `;
    infoDiv.appendChild(infoList);
    // ボタン部分
    const buttonSection = document.createElement('p');
    buttonSection.className = 'widget-cheerCommentsForm-submitButton';
    buttonSection.style.cssText = 'display: flex; gap: 10px;';
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'ui-button-blue ui-button-big';
    submitButton.textContent = '修正提案を送信';
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'ui-button ui-button-big';
    cancelButton.textContent = 'キャンセル';
    cancelButton.style.cssText = 'background-color: #gray;';
    buttonSection.appendChild(submitButton);
    buttonSection.appendChild(cancelButton);
    footer.appendChild(infoDiv);
    footer.appendChild(buttonSection);
    // フォーム組み立て
    form.appendChild(errorMessage);
    form.appendChild(title);
    form.appendChild(instruction);
    form.appendChild(changedParagraphsInput);
    form.appendChild(commentSection);
    form.appendChild(footer);
    formContainer.appendChild(form);
    // フォームをページに挿入
    const targetContainer = document.querySelector('.widget-episode-readingList')
        || document.querySelector('.widget-episode-tableOfContents')
        || document.querySelector('main');
    if (targetContainer) {
        targetContainer.appendChild(formContainer);
    }
    // イベントリスナー設定
    cancelButton.onclick = () => {
        // 編集を無効化して元のコンテンツに戻す
        contentElement.contentEditable = 'false';
        originalParagraphs.forEach(({ id, html }) => {
            const paragraph = document.getElementById(id);
            if (paragraph) {
                paragraph.innerHTML = html;
            }
        });
        formContainer.remove();
    };
    // フォーム送信前に変更された段落のみを検出して隠しフィールドに設定
    form.addEventListener('submit', () => {
        const currentParagraphs = Array.from(contentElement.querySelectorAll('p'));
        const changedParagraphs = [];
        currentParagraphs.forEach(p => {
            const currentText = p.textContent || '';
            const currentId = p.id;
            const originalParagraph = originalParagraphs.find(orig => orig.id === currentId);
            if (originalParagraph && originalParagraph.text !== currentText) {
                if (currentText.length > 0) {
                    changedParagraphs.push({
                        id: currentId,
                        original: originalParagraph.text,
                        modified: currentText,
                        edited: 0
                    });
                }
            }
        });
        changedParagraphsInput.value = JSON.stringify(changedParagraphs);
        if (changedParagraphs.length === 0) {
            alert('変更が検出されませんでした。本文を編集してから送信してください。');
            return false;
        }
    });
    // formContainerを表示
    episodeFooterActionCheerButtonContainer === null || episodeFooterActionCheerButtonContainer === void 0 ? void 0 : episodeFooterActionCheerButtonContainer.appendChild(formContainer);
    return [formContainer, form];
}
button.onclick = (() => __awaiter(void 0, void 0, void 0, function* () {
    const meta = getMetadata();
    const { visitorType, workId, episodeId } = meta;
    if (visitorType === 'guest' || visitorType !== 'user') {
        alert("誤字報告はログインユーザーのみ利用できます。");
        return;
    }
    const contentElement = document.querySelector('.widget-episodeBody.js-episode-body');
    if (!contentElement) {
        console.error("Content element not found.");
        return;
    }
    contentElement.setAttribute('contenteditable', 'true');
    console.log("Content element is now editable.");
    const [formContainer, form] = displayForm(contentElement);
    if (!form) {
        console.error("Form could not be displayed.");
        return;
    }
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const formData = new FormData(form);
        const response = yield fetch(`${apiBaseUrl}/works/${workId}/episodes/${episodeId}/errors/new`, {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            alert('誤字報告を送信しました。ご協力ありがとうございます。');
            form.reset();
            formContainer.remove();
        }
        else {
            alert('誤字報告の送信に失敗しました。もう一度お試しください。');
        }
    }));
}));
