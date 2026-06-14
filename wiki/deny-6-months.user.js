// ==UserScript==
// @name         알파위키 ACL 소명 거부 기간 자동 설정
// @namespace    https://userscripts.imsleepy.xyz
// @version      1.0.0
// @author       sxosxghn
//
// @description  규정에 따라 - 소명 거부를 선택하면 기간이 자동으로 6개월로 선택됨 | 알파 관리자 전용
// @match        https://www.alphawiki.org/*
//
// @homepageURL  https://userscripts.imsleepy.xyz/
// @supportURL   https://github.com/imsleepybob/Userscripts/issues
// @updateURL    https://userscripts.imsleepy.xyz/wiki/deny-6-months.user.js
// @downloadURL  https://userscripts.imsleepy.xyz/wiki/deny-6-months.js
//
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const nativeSelectSetter = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype, 'value'
  ).set;

  function setVueSelectValue(el, value) {
    nativeSelectSetter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function attachGroupSelectListener(groupSelect) {
    if (groupSelect._aclListenerAttached) return;
    groupSelect._aclListenerAttached = true;

    groupSelect.addEventListener('change', function () {
      if (this.value !== '소명 거부') return;

      const form = this.closest('form');
      if (!form) return;

      const durationSelect = form.querySelector('select[data-v-0243f995]');
      if (!durationSelect) return;

      setVueSelectValue(durationSelect, '14515200');
    });
  }

  function scan() {
    document.querySelectorAll('select[name="group"]').forEach(attachGroupSelectListener);
  }

  scan();

  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true });
})();
