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
const EpisodeApiBaseUrl = 'https://kakuyomu.herentongkegu087.workers.dev';
const episodeButtons = document.querySelector('#contentMainHeader-right');
function handleEpisodeButtonClick() {
    return __awaiter(this, void 0, void 0, function* () {
        // モーダルダイアログを作成
        yield createEpisodeErrorReportModal();
    });
}
function handleEpisodeResolveError(workId, episodeId, errorId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${EpisodeApiBaseUrl}/works/${workId}/episodes/${episodeId}/errors/${errorId}/edit`, {
                method: 'PATCH'
            });
            if (!response.ok) {
                const errorData = yield response.json();
                console.error('Error resolving error report:', errorData);
                alert(`誤字報告の解決に失敗しました: ${errorData.error || '不明なエラー'}`);
                return;
            }
            alert('誤字報告が解決されました。');
            location.reload(); // ページをリロードして最新の状態を反映
        }
        catch (error) {
            console.error('Network error:', error);
            alert('誤字報告の解決中にネットワークエラーが発生しました。');
        }
    });
}
function createEpisodeErrorReportModal() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('error-report-modal');
        if (existingModal) {
            existingModal.remove();
        }
        // オーバーレイ作成
        const overlay = document.createElement('div');
        overlay.id = 'error-report-modal';
        overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
        // モーダルコンテンツ作成
        const modal = document.createElement('div');
        modal.style.cssText = `
        background: white;
        padding: 0;
        border-radius: 6px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        max-width: 700px;
        width: 90%;
        max-height: 80%;
        overflow: hidden;
        font-family: "Hiragino Sans", "ヒラギノ角ゴ ProN W3", "Hiragino Kaku Gothic ProN", "メイリオ", Meiryo, sans-serif;
        border: 1px solid #ddd;
    `;
        modal.innerHTML = `
        <div style="background: #fff; color: #333; padding: 20px; border-bottom: 1px solid #ddd; position: relative;">
            <button id="close-modal-header" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 20px;
                color: #999;
                cursor: pointer;
                padding: 5px;
                line-height: 1;
                transition: color 0.2s;
            " onmouseover="this.style.color='#666'" onmouseout="this.style.color='#999'">×</button>
            <h3 style="margin: 0; font-size: 18px; font-weight: 500; color: #333; padding-right: 30px;">誤字報告一覧</h3>
            <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">読者から寄せられた修正提案をご確認ください</p>
        </div>
        <div id="error-report-content" style="padding: 20px; max-height: 500px; overflow-y: auto; background: #fafafa;">
            <div style="display: flex; align-items: center; justify-content: center; padding: 40px 0; color: #666;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
                    <p>誤字報告を読み込み中...</p>
                </div>
            </div>
        </div>
        <div style="padding: 15px 20px; background: #fff; border-top: 1px solid #ddd; text-align: right;">
            <button id="close-modal" style="
                padding: 8px 16px; 
                background: #666; 
                color: white;
                border: none; 
                border-radius: 3px; 
                cursor: pointer;
                font-size: 13px;
                font-weight: normal;
                transition: background-color 0.2s;
            " onmouseover="this.style.background='#555'" onmouseout="this.style.background='#666'">
                閉じる
            </button>
        </div>
    `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        // 閉じるボタンのイベント（フッター）
        (_a = document.getElementById('close-modal')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            overlay.remove();
        });
        // 閉じるボタンのイベント（ヘッダー）
        (_b = document.getElementById('close-modal-header')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            overlay.remove();
        });
        // オーバーレイクリックで閉じる
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        // ESCキーで閉じる
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        // 実際の誤字報告データを読み込む（仮実装）
        const workId = (_c = location.href.match(/\/works\/(\d+)/)) === null || _c === void 0 ? void 0 : _c[1];
        const episodeId = (_d = location.href.match(/\/episodes\/(\d+)/)) === null || _d === void 0 ? void 0 : _d[1];
        if (!workId || !episodeId) {
            console.error('Work ID or Episode ID not found in URL.');
            return;
        }
        yield loadEpisodeErrorReports(workId, episodeId);
    });
}
function getEpisodePageTitle() {
    // エピソード編集ページでは、ページタイトルからエピソード名を取得
    const titleElement = document.querySelector('#contentMainHeader-pageTitle-episodeTitle');
    if (titleElement && titleElement.textContent) {
        return titleElement.textContent.trim();
    }
    // フォールバック: input要素からタイトルを取得
    const inputElement = document.querySelector('#episodeTitle-input');
    if (inputElement && inputElement.value) {
        return inputElement.value.trim();
    }
    return 'このエピソード';
}
function createEpisodeErrorReportCard(errorReport, paragraphs) {
    const workId = errorReport.work_id;
    const episodeId = errorReport.episode_id;
    const statusColor = errorReport.edited ? '#0a6a00' : '#d32f2f';
    const statusBg = errorReport.edited ? '#e8f5e8' : '#ffebee';
    const statusText = errorReport.edited ? '対応済み' : '未対応';
    // メインカード
    const card = document.createElement('div');
    card.style.cssText = `
        background: white;
        border: 1px solid #ddd;
        border-radius: 3px;
        padding: 16px;
        margin-bottom: 16px;
        transition: border-color 0.2s;
    `;
    card.addEventListener('mouseenter', () => {
        card.style.borderColor = '#999';
    });
    card.addEventListener('mouseleave', () => {
        card.style.borderColor = '#ddd';
    });
    // ヘッダー部分
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;';
    const headerLeft = document.createElement('div');
    headerLeft.style.cssText = 'flex: 1;';
    const title = document.createElement('h5');
    title.style.cssText = 'margin: 0 0 4px 0; font-size: 16px; color: #333; font-weight: 500;';
    title.textContent = getEpisodePageTitle();
    const paragraphInfo = document.createElement('span');
    paragraphInfo.style.cssText = 'font-size: 12px; color: #999; font-weight: normal;';
    paragraphInfo.textContent = paragraphs.length === 1 ? ` 段落: ${paragraphs[0].id}` : ` 段落: ${paragraphs.length}箇所`;
    title.appendChild(paragraphInfo);
    const statusBadge = document.createElement('span');
    statusBadge.style.cssText = `
        display: inline-block;
        padding: 3px 8px;
        background: ${statusBg};
        color: ${statusColor};
        border-radius: 3px;
        font-size: 11px;
        font-weight: 500;
        margin-right: 8px;
    `;
    statusBadge.textContent = statusText;
    headerLeft.appendChild(title);
    headerLeft.appendChild(statusBadge);
    const idInfo = document.createElement('small');
    idInfo.style.cssText = 'color: #999; font-size: 11px; white-space: nowrap;';
    idInfo.textContent = `ID: ${errorReport.error_id.substring(0, 8)}...`;
    header.appendChild(headerLeft);
    header.appendChild(idInfo);
    // 修正内容部分（複数の段落を表示）
    const modificationSection = document.createElement('div');
    modificationSection.style.cssText = 'background: #f5f5f5; padding: 12px; border: 1px solid #e0e0e0; margin-bottom: 12px;';
    paragraphs.forEach((paragraph, index) => {
        if (index > 0) {
            // 段落間の区切り線
            const separator = document.createElement('hr');
            separator.style.cssText = 'border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;';
            modificationSection.appendChild(separator);
        }
        // 段落IDを表示（複数段落の場合のみ）
        if (paragraphs.length > 1) {
            const paragraphIdLabel = document.createElement('div');
            paragraphIdLabel.style.cssText = 'font-size: 11px; color: #999; margin-bottom: 8px; font-weight: 500;';
            paragraphIdLabel.textContent = `${paragraph.id.replace('p', '')}行目:`;
            modificationSection.appendChild(paragraphIdLabel);
        }
        // 修正前
        const beforeSection = document.createElement('div');
        beforeSection.style.cssText = 'margin-bottom: 8px;';
        const beforeLabel = document.createElement('span');
        beforeLabel.style.cssText = 'font-size: 12px; color: #666; font-weight: 500;';
        beforeLabel.textContent = '修正前:';
        const beforeContent = document.createElement('div');
        beforeContent.style.cssText = 'background: #fff8e1; padding: 8px; border-left: 2px solid #ffa000; margin-top: 4px;';
        beforeContent.textContent = `"${paragraph.original}"`;
        beforeSection.appendChild(beforeLabel);
        beforeSection.appendChild(beforeContent);
        // 修正後
        const afterSection = document.createElement('div');
        const afterLabel = document.createElement('span');
        afterLabel.style.cssText = 'font-size: 12px; color: #666; font-weight: 500;';
        afterLabel.textContent = '修正後:';
        const afterContent = document.createElement('div');
        afterContent.style.cssText = 'background: #e3f2fd; padding: 8px; border-left: 2px solid #1976d2; margin-top: 4px;';
        afterContent.textContent = `"${paragraph.modified}"`;
        afterSection.appendChild(afterLabel);
        afterSection.appendChild(afterContent);
        modificationSection.appendChild(beforeSection);
        modificationSection.appendChild(afterSection);
    });
    // アクション部分
    const actionSection = document.createElement('div');
    actionSection.style.cssText = 'text-align: right;';
    const editLink = document.createElement('a');
    editLink.href = `/my/works/${workId}/episodes/${episodeId}`;
    editLink.style.cssText = `
        display: inline-block;
        padding: 8px 16px;
        background: #1976d2;
        color: white;
        text-decoration: none;
        border-radius: 3px;
        font-size: 13px;
        font-weight: normal;
        transition: background-color 0.2s;
        margin-right: 8px;
    `;
    editLink.textContent = 'エピソードを編集';
    editLink.addEventListener('mouseenter', () => {
        editLink.style.background = '#1565c0';
    });
    editLink.addEventListener('mouseleave', () => {
        editLink.style.background = '#1976d2';
    });
    const markResolvedButton = document.createElement('button');
    markResolvedButton.type = 'button';
    const isResolved = Boolean(errorReport.edited);
    markResolvedButton.style.cssText = `
        padding: 8px 16px;
        background: ${isResolved ? '#666' : '#0a6a00'};
        color: white;
        border: none;
        border-radius: 3px;
        font-size: 13px;
        font-weight: normal;
        cursor: ${isResolved ? 'default' : 'pointer'};
        transition: background-color 0.2s;
    `;
    markResolvedButton.textContent = isResolved ? '対応済み' : '修正済みにする';
    markResolvedButton.disabled = isResolved;
    if (!isResolved) {
        markResolvedButton.addEventListener('mouseenter', () => {
            markResolvedButton.style.background = '#0a5a00';
        });
        markResolvedButton.addEventListener('mouseleave', () => {
            markResolvedButton.style.background = '#0a6a00';
        });
        markResolvedButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            const confirmResolve = confirm('この誤字報告を修正済みにしますか？');
            if (confirmResolve) {
                yield handleEpisodeResolveError(workId, episodeId, errorReport.error_id);
            }
        }));
    }
    actionSection.appendChild(editLink);
    actionSection.appendChild(markResolvedButton);
    // カードの組み立て
    card.appendChild(header);
    card.appendChild(modificationSection);
    // コメントがある場合は追加
    if (errorReport.comment) {
        const commentSection = document.createElement('div');
        commentSection.style.cssText = 'background: #fafafa; padding: 12px; border: 1px solid #e0e0e0; margin-bottom: 12px;';
        const commentLabel = document.createElement('span');
        commentLabel.style.cssText = 'font-size: 12px; color: #666; font-weight: 500;';
        commentLabel.textContent = 'コメント:';
        const commentText = document.createElement('p');
        commentText.style.cssText = 'margin: 4px 0 0 0; font-size: 14px; line-height: 1.4; color: #333;';
        commentText.textContent = errorReport.comment;
        commentSection.appendChild(commentLabel);
        commentSection.appendChild(commentText);
        card.appendChild(commentSection);
    }
    card.appendChild(actionSection);
    return card;
}
function createEpisodeEmptyState() {
    const container = document.createElement('div');
    container.style.cssText = 'text-align: center; padding: 40px 0; color: #666;';
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 36px; margin-bottom: 15px; color: #999;';
    icon.textContent = '�';
    const title = document.createElement('h4');
    title.style.cssText = 'margin: 0 0 10px 0; font-size: 16px; font-weight: 500; color: #666;';
    title.textContent = '誤字報告はありません';
    const description = document.createElement('p');
    description.style.cssText = 'margin: 0; font-size: 14px; color: #999;';
    description.textContent = '現在、読者からの誤字報告はありません。';
    container.appendChild(icon);
    container.appendChild(title);
    container.appendChild(description);
    return container;
}
function createEpisodeErrorState() {
    const container = document.createElement('div');
    container.style.cssText = 'text-align: center; padding: 40px 0; color: #d32f2f;';
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 36px; margin-bottom: 15px; color: #d32f2f;';
    icon.textContent = '⚠';
    const title = document.createElement('h4');
    title.style.cssText = 'margin: 0 0 10px 0; font-size: 16px; font-weight: 500; color: #d32f2f;';
    title.textContent = '読み込みエラー';
    const description = document.createElement('p');
    description.style.cssText = 'margin: 0; font-size: 14px; color: #666;';
    description.innerHTML = '誤字報告の読み込みに失敗しました。<br>しばらく時間をおいて再度お試しください。';
    container.appendChild(icon);
    container.appendChild(title);
    container.appendChild(description);
    return container;
}
function loadEpisodeErrorReports(workId, episodeId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const content = document.getElementById('error-report-content');
        if (!content) {
            console.error('Error report content element not found.');
            return;
        }
        try {
            const response = yield fetch(`${EpisodeApiBaseUrl}/works/${workId}/episodes/${episodeId}/errors`);
            if (!response.ok) {
                console.error('Failed to fetch error reports:', response.statusText);
                content.innerHTML = '';
                content.appendChild(createEpisodeErrorState());
                return;
            }
            const data = ((_a = (yield response.json())) !== null && _a !== void 0 ? _a : []).sort((a, b) => b.id - a.id);
            // コンテンツをクリア
            content.innerHTML = '';
            if (data.length === 0) {
                content.appendChild(createEpisodeEmptyState());
                return;
            }
            // エラー報告を表示
            data.forEach((errorReport) => {
                const changedParagraphs = JSON.parse(errorReport.error);
                // 全ての段落を一つのカードに表示
                const card = createEpisodeErrorReportCard(errorReport, changedParagraphs);
                content.appendChild(card);
            });
        }
        catch (error) {
            console.error('Error loading error reports:', error);
            content.innerHTML = '';
            content.appendChild(createEpisodeErrorState());
        }
    });
}
(() => {
    if (!episodeButtons) {
        console.error('ボタンが見つかりません。');
        return;
    }
    // 保存ボタンを取得して、その前に挿入
    const saveButton = document.getElementById('saveButton');
    if (!saveButton) {
        console.error('保存ボタンが見つかりません。');
        return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ui-button-default-wrapper';
    button.tabIndex = 19; // 保存ボタン(20)の前
    button.style.marginRight = '8px';
    button.innerHTML = '<span class="ui-button-default">誤字報告を表示</span>';
    button.addEventListener('click', handleEpisodeButtonClick);
    // 保存ボタンの前に挿入
    episodeButtons.insertBefore(button, saveButton);
})();
