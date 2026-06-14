// ==UserScript==
// @name         the seed 사용자 팝오버에 UUID 관련 기능 추가
// @namespace    https://userscripts.imsleepy.xyz
// @version      1.0.0
// @description  관리자처럼 사용자 팝오버를 클릭하여 사용자 UUID 복사/차단 내역 조회 가능 | 남간 알파 더시드 호환
// @author       sxosxghn
//
// @match        https://namu.wiki/*
// @match        https://www.alphawiki.org/*
// @match        https://theseed.io/*
//
// @homepageURL  https://userscripts.imsleepy.xyz/
// @supportURL   https://github.com/imsleepybob/Userscripts/issues
// @updateURL    https://userscripts.imsleepy.xyz/wiki/theseed-uuid.user.js
// @downloadURL  https://userscripts.imsleepy.xyz/wiki/theseed-uuid.user.js
//
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const UUID_REGEX = /\/contribution\/([0-9a-f-]{36})\//;
  let toastTimer = null;

  function showToast(msg) {
    const ol = document.querySelector('[data-sonner-toaster]');
    if (!ol) return;

    const existing = ol.querySelector('li[data-uuid-toast]');
    if (existing) existing.remove();

    const li = document.createElement('li');
    li.setAttribute('aria-live', 'polite');
    li.setAttribute('aria-atomic', 'true');
    li.setAttribute('role', 'status');
    li.setAttribute('tabindex', '0');
    li.setAttribute('data-sonner-toast', 'true');
    li.setAttribute('data-rich-colors', 'true');
    li.setAttribute('data-styled', 'true');
    li.setAttribute('data-mounted', 'false');
    li.setAttribute('data-promise', 'false');
    li.setAttribute('data-removed', 'false');
    li.setAttribute('data-visible', 'true');
    li.setAttribute('data-y-position', 'bottom');
    li.setAttribute('data-x-position', 'right');
    li.setAttribute('data-index', '0');
    li.setAttribute('data-front', 'true');
    li.setAttribute('data-swiping', 'false');
    li.setAttribute('data-dismissible', 'true');
    li.setAttribute('data-type', 'default');
    li.setAttribute('data-invert', 'false');
    li.setAttribute('data-swipe-out', 'false');
    li.setAttribute('data-expanded', 'true');
    li.setAttribute('data-uuid-toast', 'true');
    li.style.cssText = '--index:0;--toasts-before:0;--z-index:1;--offset:0px;--initial-height:auto;';
    li.innerHTML = `<div data-content="" class=""><div data-title="" class="">${msg}</div></div>`;

    ol.appendChild(li);

    requestAnimationFrame(() => {
      li.setAttribute('data-mounted', 'true');
    });

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      li.setAttribute('data-removed', 'true');
      setTimeout(() => li.remove(), 400);
    }, 4000);
  }

  function getUUID(popper) {
    for (const a of popper.querySelectorAll('a[href]')) {
      const m = a.getAttribute('href').match(UUID_REGEX);
      if (m) return m[1];
    }
    return null;
  }

  function getLinkClass(popper) {
    for (const a of popper.querySelectorAll('a[href]')) {
      if (UUID_REGEX.test(a.getAttribute('href'))) return a.className;
    }
    return '';
  }

  function getUserName(popper) {
    const el = popper.querySelector('.HShtbh8H, .olY6BF1t');
    return el ? el.textContent.trim() : '';
  }

  function injectTools(popper) {
    if (popper.dataset.uuidInjected) return;

    const uuid = getUUID(popper);
    if (!uuid) return;

    const inner = popper.querySelector('.v-popper__inner > div');
    if (!inner) return;

    popper.dataset.uuidInjected = '1';

    const cls = getLinkClass(popper);

    const hr = document.createElement('hr');

    const copyLink = document.createElement('a');
    copyLink.className = cls;
    copyLink.setAttribute('role', 'button');
    copyLink.href = '#';
    copyLink.textContent = 'UUID 복사';
    copyLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(uuid).then(() => {
        const name = getUserName(popper);
        showToast(`사용자 '${name}'의 UUID가 복사되었습니다.`);
      });
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const blockLink = document.createElement('a');
    blockLink.className = cls;
    blockLink.setAttribute('role', 'button');
    blockLink.href = `/BlockHistory?query=${uuid}&target=text`;
    blockLink.target = '_blank';
    blockLink.rel = 'noopener';
    blockLink.textContent = '차단 내역 조회';

    inner.appendChild(hr);
    inner.appendChild(copyLink);
    inner.appendChild(blockLink);
  }

  function resetPopper(popper) {
    const inner = popper.querySelector('.v-popper__inner > div');
    if (!inner) return;

    const doReset = () => {
      delete popper.dataset.uuidInjected;
      const children = Array.from(inner.children);
      const hrIdx = children.map(c => c.tagName).lastIndexOf('HR');
      if (hrIdx !== -1) {
        children.slice(hrIdx).forEach(el => el.remove());
      }
    };

    if (popper.classList.contains('v-popper__popper--hide-to')) {
      doReset();
      return;
    }

    const resetObserver = new MutationObserver(() => {
      if (popper.classList.contains('v-popper__popper--hide-to')) {
        resetObserver.disconnect();
        doReset();
      }
    });
    resetObserver.observe(popper, { attributes: true, attributeFilter: ['class'] });
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.classList.contains('v-popper__popper')) {
          watchPopper(node);
        }
      }
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const node = m.target;
        if (!(node instanceof HTMLElement)) continue;
        if (node.classList.contains('v-popper__popper--shown')) {
          injectTools(node);
        } else if (node.classList.contains('v-popper__popper--hidden')) {
          resetPopper(node);
        }
      }
    }
  });

  function watchPopper(popper) {
    observer.observe(popper, { attributes: true, attributeFilter: ['class'] });
  }

  document.querySelectorAll('.v-popper__popper').forEach(watchPopper);
  observer.observe(document.body, { childList: true, subtree: true });
})();
