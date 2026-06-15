// ==UserScript==
// @name         뻘토론 처리 자동화
// @namespace    https://userscripts.imsleepy.xyz
// @version      1.3.0
// @author       sxosxghn
//
// @description  close -> '.' -> 알파위키:뻘토론 보관함 | 알파 관리자 전용, 더시드 호환
// @match        https://www.alphawiki.org/*
// @match        https://theseed.io/*
//
// @homepageURL  https://userscripts.imsleepy.xyz/
// @supportURL   https://github.com/imsleepybob/Userscripts/issues
// @updateURL    https://userscripts.imsleepy.xyz/wiki/auto-close.user.js
// @downloadURL  https://userscripts.imsleepy.xyz/wiki/auto-close.js
//
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    let observer = null;

    function getThreadId() {
        const match = location.pathname.match(/\/thread\/([^/]+)/);
        return match ? match[1] : null;
    }

    async function trashThread() {
        const statusForm = document.querySelector('form[action*="/status"]');
        const statusSelect = statusForm?.querySelector('select[name="status"]');
        if (statusSelect) statusSelect.value = 'close';
        statusForm?.querySelector('button[type="submit"]').click();

        await new Promise(r => setTimeout(r, 300));

        const topicForm = document.querySelector('form[action*="/topic"]');
        const topicInput = topicForm?.querySelector('input[name="topic"]');
        if (topicInput) topicInput.value = ' .';
        topicForm?.querySelector('button[type="submit"]').click();

        await new Promise(r => setTimeout(r, 300));

        const docForm = document.querySelector('form[action*="/document"]');
        const docInput = docForm?.querySelector('input[name="document"]');
        if (docInput) docInput.value = '알파위키:뻘토론 보관함';
        docForm?.querySelector('button[type="submit"]').click();

        await new Promise(r => setTimeout(r, 300));

        location.reload();
    }

    async function handleAction(message) {
        const textarea = document.querySelector('textarea[name="text"]');
        if (textarea) textarea.value = message;

        const sendBtn = document.querySelector('button.ZoNlGcZS[type="submit"]');
        sendBtn?.click();

        await new Promise(r => setTimeout(r, 300));

        const statusForm = document.querySelector('form[action*="/status"]');
        const statusSelect = statusForm?.querySelector('select[name="status"]');
        if (statusSelect) statusSelect.value = 'close';
        statusForm?.querySelector('button[type="submit"]').click();

        await new Promise(r => setTimeout(r, 300));

        location.reload();
    }

    function insertForms() {
        if (document.querySelector('#trash-form')) return;

        const forms = document.querySelectorAll('form[action*="/admin/thread/"]');
        if (!forms.length) return;

        const trashForm = document.createElement('form');
        trashForm.id = 'trash-form';
        trashForm.setAttribute('data-v-662861e0', '');
        trashForm.onsubmit = (e) => {
            e.preventDefault();
            trashThread();
        };
        trashForm.innerHTML = `[ADMIN] 휴지통 처리 <button data-v-d65ef28c="" data-v-662861e0="" type="submit">변경</button>`;
        forms[forms.length - 1].insertAdjacentElement('afterend', trashForm);

        if (document.querySelector('#action-form')) return;

        const actionForm = document.createElement('form');
        actionForm.id = 'action-form';
        actionForm.setAttribute('data-v-662861e0', '');
        actionForm.innerHTML = `[ADMIN] <button data-v-d65ef28c="" data-v-662861e0="" type="button" id="btn-process">처리</button> <button data-v-d65ef28c="" data-v-662861e0="" type="button" id="btn-block">차단</button>`;
        trashForm.insertAdjacentElement('afterend', actionForm);

        actionForm.querySelector('#btn-process').addEventListener('click', () => handleAction('처리되었습니다.'));
        actionForm.querySelector('#btn-block').addEventListener('click', () => handleAction('차단되었습니다.'));

        observer?.disconnect();
        observer = null;
    }

    function setup() {
        if (!getThreadId()) return;

        observer?.disconnect();
        observer = new MutationObserver(insertForms);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    const _pushState = history.pushState.bind(history);
    history.pushState = function (...args) {
        _pushState(...args);
        setup();
    };

    window.addEventListener('popstate', setup);
    setup();
})();
