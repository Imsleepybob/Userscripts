// ==UserScript==
// @name         문서 휴지통 처리 자동화
// @namespace    https://userscripts.imsleepy.xyz
// @version      1.2.0
// @author       sxosxghn
//
// @description  삭제 후 이동하는 방식 / uuid 사용함 | 알파 관리자 전용
// @match        https://www.alphawiki.org/*
//
// @homepageURL  https://userscripts.imsleepy.xyz/
// @supportURL   https://github.com/imsleepybob/Userscripts/issues
// @updateURL    https://userscripts.imsleepy.xyz/wiki/auto-trash.user.js
// @downloadURL  https://userscripts.imsleepy.xyz/wiki/auto-trash.js
//
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  function init() {
    const path = decodeURIComponent(location.pathname);
    const pendingMove = sessionStorage.getItem('pendingMove');
    const pendingDelete = sessionStorage.getItem('pendingDelete');

    if (pendingMove && !path.startsWith('/move/') && !path.startsWith('/delete/')) {
      location.href = '/move/' + encodeURIComponent(pendingMove);
      return;
    }

    if (path.startsWith('/move/')) {
      const observer = new MutationObserver(function () {
        const checkbox = document.querySelector('input[type="checkbox"][name="mode"]');
        if (!checkbox) return;
        if (document.getElementById('trashBtn')) return;

        const currentDoc = path.replace('/move/', '');

        if (pendingMove && pendingMove === currentDoc) {
          const titleInput = document.getElementById('titleInput');
          const logInput = document.getElementById('logInput');
          if (!titleInput || !logInput) return;

          observer.disconnect();
          sessionStorage.removeItem('pendingMove');
          titleInput.value = '휴지통:' + crypto.randomUUID();
          titleInput.dispatchEvent(new Event('input'));
          logInput.value = '     ';
          logInput.dispatchEvent(new Event('input'));
          setTimeout(function () {
            document.querySelector('button.ZoNlGcZS').click();
          }, 300);
          return;
        }

        if (pendingMove) sessionStorage.removeItem('pendingMove');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'trashBtn';
        btn.textContent = '휴지통';
        btn.addEventListener('click', function () {
          sessionStorage.setItem('pendingMove', currentDoc);
          sessionStorage.setItem('pendingDelete', currentDoc);
          location.href = '/delete/' + encodeURIComponent(currentDoc);
        });

        checkbox.closest('label').insertAdjacentElement('afterend', btn);
        observer.disconnect();
      });

      observer.observe(document.body, { childList: true, subtree: true });

    } else if (path.startsWith('/delete/')) {
      const currentDoc = path.replace('/delete/', '');

      if (pendingDelete && pendingDelete === currentDoc) {
        const observer = new MutationObserver(function () {
          const deleteBtn = document.querySelector('button.ZoNlGcZS.jT7ab-BU');
          const logInput = document.getElementById('logInput');
          const agreeCheckbox = document.getElementById('agreeCheckbox');
          if (!deleteBtn || !logInput || !agreeCheckbox) return;

          observer.disconnect();
          sessionStorage.removeItem('pendingDelete');
          logInput.value = '     ';
          logInput.dispatchEvent(new Event('input'));
          agreeCheckbox.click();
          setTimeout(function () {
            deleteBtn.click();
            const deletedPath = location.pathname;
            const interval = setInterval(function () {
              if (decodeURIComponent(location.pathname) === deletedPath) return;
              clearInterval(interval);
              const pending = sessionStorage.getItem('pendingMove');
              if (pending) location.href = '/move/' + encodeURIComponent(pending);
            }, 100);
          }, 300);
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return;
      }

      const observer = new MutationObserver(function () {
        const deleteBtn = document.querySelector('button.ZoNlGcZS.jT7ab-BU');
        if (!deleteBtn) return;
        if (document.getElementById('trashBtn')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'trashBtn';
        btn.textContent = '휴지통';
        btn.addEventListener('click', function () {
          sessionStorage.setItem('pendingMove', currentDoc);

          const logInput = document.getElementById('logInput');
          logInput.value = '     ';
          logInput.dispatchEvent(new Event('input'));

          const agreeCheckbox = document.getElementById('agreeCheckbox');
          agreeCheckbox.click();
          setTimeout(function () {
            deleteBtn.click();
            const deletedPath = location.pathname;
            const interval = setInterval(function () {
              if (decodeURIComponent(location.pathname) === deletedPath) return;
              clearInterval(interval);
              const pending = sessionStorage.getItem('pendingMove');
              if (pending) location.href = '/move/' + encodeURIComponent(pending);
            }, 100);
          }, 300);
        });

        deleteBtn.insertAdjacentElement('beforebegin', btn);
        observer.disconnect();
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  const _pushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    _pushState(...args);
    init();
  };

  window.addEventListener('popstate', init);

  init();
})();
