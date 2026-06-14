// ==UserScript==
// @name         숨겨진 댓글 보이기
// @namespace    https://userscripts.imsleepy.xyz
// @version      1.0.0
// @author       Imsleepy
//
// @description  숨겨진 댓글 보이지 않기 체크박스를 자동으로 해제함 | 남간 알파 더시드 호환
// @match        https://namu.wiki/thread/*
// @match        https://www.alphawiki.org/thread/*
// @match        https://theseed.io/thread/*
//
// @homepageURL  https://userscripts.imsleepy.xyz/
// @supportURL   https://github.com/imsleepybob/Userscripts/issues
// @updateURL    https://userscripts.imsleepy.xyz/wiki/show-hidden-thread.user.js
// @downloadURL  https://userscripts.imsleepy.xyz/wiki/show-hidden-thread.js
//
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const SITE_CONFIG = {
        'namu.wiki': {
            btnSelector: 'span.TCKBmPPm._8QYoN7GA',
            checkboxSelector: 'input[type="checkbox"].e57vXpAk',
        },
        'www.alphawiki.org': {
            btnSelector: 'span.OQ06GZJZ.Dt7-kpVS',
            checkboxSelector: 'input[type="checkbox"].cArz5I2V',
        },
        'theseed.io': {
            btnSelector: 'span.OQ06GZJZ.Dt7-kpVS',
            checkboxSelector: 'input[type="checkbox"].cArz5I2V',
        },
    };

    const config = SITE_CONFIG[location.hostname];
    if (!config) return;

    let done = false;

    function clickBtn(btn) {
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }

    function tryAutoUncheck(btn, attempt = 0) {
        if (done || attempt > 20) return;

        const popperObserver = new MutationObserver(() => {
            if (!document.body.classList.contains('v-popper--some-open')) return;
            const checkbox = document.querySelector(config.checkboxSelector);
            if (!checkbox) return;
            popperObserver.disconnect();
            done = true;
            if (checkbox.checked) {
                checkbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
            setTimeout(() => clickBtn(btn), 100);
        });

        popperObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });

        clickBtn(btn);

        setTimeout(() => {
            if (done) return;
            if (!document.body.classList.contains('v-popper--some-open')) {
                popperObserver.disconnect();
                tryAutoUncheck(btn, attempt + 1);
            }
        }, 300);
    }

    function waitForBtn() {
        const btn = document.querySelector(config.btnSelector);
        if (btn) {
            tryAutoUncheck(btn);
        } else {
            setTimeout(waitForBtn, 300);
        }
    }

    window.addEventListener('load', waitForBtn);
})();
