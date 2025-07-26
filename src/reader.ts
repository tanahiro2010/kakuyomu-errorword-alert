const apiBaseUrl = "";

const button = document.createElement('button');
button.className = "border rounded p-2 hover:bg-gray-100 ml-5";
button.textContent = "誤字報告";

const episodeFooterActionCheerButtonContainer = document.getElementById('episodeFooter-action-cheerButtons');
if (episodeFooterActionCheerButtonContainer) {
    episodeFooterActionCheerButtonContainer.appendChild(button);
}

function getMetadata(): Record<string, any> {
    const metaScript = document.querySelectorAll('#page-works-episodes-episode script')[0];
    if (!metaScript) {
        console.error("Metadata script not found.");
        return {};
    }
    const meta = (metaScript.innerHTML ?? "\n").split('\n')[1].trim();
    if (!meta.startsWith('dataLayer = ')) {
        console.error("Metadata format is incorrect.");
        return {};
    }
    const json = meta.replace(';', '').replace('dataLayer = ', '');
    return JSON.parse(json)[0];
}

function displayForm() {
    const meta = getMetadata();
    const { workId, episodeId } = meta;

    // 既存のフォームがあれば削除
    const existingForm = document.getElementById('gozishusei-form');
    if (existingForm) {
        existingForm.remove();
    }

    // フォームコンテナを作成
    const formContainer = document.createElement('section');
    formContainer.id = 'gozishusei-form';
    formContainer.className = 'widget-cheerCommentsForm js-episode-comment-creation-panel js-onetime-focus-reaction-container isShown isFocused';
    formContainer.style.cssText = 'margin-top: 20px; border: 2px solid #ff6b6b; border-radius: 8px; padding: 20px; background-color: #fff5f5;';

    // フォーム作成
    const form = document.createElement('form');
    form.method = 'post';
    form.action = `${apiBaseUrl}/works/${workId}/episodes/${episodeId}/new`;
    form.className = 'js-episode-error-report-form';

    // エラーメッセージボックス
    const errorMessage = document.createElement('p');
    errorMessage.className = 'ui-message-attention js-episode-error-message-box isHidden';

    // フォームタイトル
    const title = document.createElement('h3');
    title.textContent = '誤字・脱字報告';
    title.style.cssText = 'color: #ff6b6b; margin-bottom: 15px; font-size: 18px; font-weight: bold;';

    // テキストエリア部分
    const bodySection = document.createElement('p');
    bodySection.className = 'widget-cheerCommentsForm-body';
    
    const textarea = document.createElement('textarea');
    textarea.id = 'error-report-body';
    textarea.name = 'body';
    textarea.placeholder = '誤字・脱字の詳細を入力してください（該当箇所、正しい表記など）';
    textarea.style.cssText = 'width: 100%; height: 120px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;';
    textarea.required = true;

    bodySection.appendChild(textarea);

    // フッター部分
    const footer = document.createElement('footer');
    footer.className = 'widget-cheerCommentsForm-footer';

    // 情報表示部分
    const infoDiv = document.createElement('div');
    infoDiv.className = 'widget-cheerCommentsForm-footer-info';

    const infoList = document.createElement('dl');
    infoList.innerHTML = `
        <dt><span>報告タイプ</span></dt>
        <dd>誤字・脱字報告</dd>
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
    submitButton.textContent = '報告する';

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
    form.appendChild(bodySection);
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
        formContainer.remove();
    };

    // formContainerを表示
    episodeFooterActionCheerButtonContainer?.appendChild(formContainer);

    // テキストエリアにフォーカス
    textarea.focus();

    return [formContainer, form] as [ HTMLElement, HTMLFormElement ];
}

button.onclick = (async () => {
    const meta = getMetadata();
    const { visitorType, workId, episodeId } = meta;

    if (visitorType === 'guest' || visitorType !== 'user') {
        alert("誤字報告はログインユーザーのみ利用できます。");
        return;
    }

    const [formContainer, form] = displayForm();
    if (!form) {
        console.error("Form could not be displayed.");
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const response = await fetch(`${apiBaseUrl}/works/${workId}/episodes/${episodeId}/new`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('誤字報告を送信しました。ご協力ありがとうございます。');
            form.reset();
            formContainer.remove();
        } else {
            alert('誤字報告の送信に失敗しました。もう一度お試しください。');
        }
    });
});