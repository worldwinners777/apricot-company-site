/* 株式会社アプリコット 公式サイト 共通スクリプト
   - ハンバーガーメニュー
   - ヘッダープルダウン（PC: hover / SP: クリック）
   - スムーススクロール (簡易)
*/
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // --- Hamburger ---
    var hamburger = document.querySelector('[data-hamburger]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', function () {
        var isOpen = mobileNav.classList.toggle('is-open');
        hamburger.classList.toggle('is-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      // タブクリックでメニュー閉じる
      mobileNav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mobileNav.classList.remove('is-open');
          hamburger.classList.remove('is-open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    // --- Mobile nav sub-toggle ---
    document.querySelectorAll('[data-mobile-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var li = btn.closest('li');
        if (!li) return;
        var sub = li.querySelector('.mobile-nav__sub');
        if (!sub) return;
        var isOpen = sub.style.display === 'block';
        sub.style.display = isOpen ? 'none' : 'block';
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    // --- PC Dropdown (キーボード対応) ---
    document.querySelectorAll('.site-nav__item').forEach(function (item) {
      var trigger = item.querySelector('.has-dropdown');
      if (!trigger) return;
      trigger.addEventListener('focus', function () { item.classList.add('is-open'); });
      trigger.addEventListener('blur', function () {
        setTimeout(function () {
          if (!item.contains(document.activeElement)) item.classList.remove('is-open');
        }, 100);
      });
    });

    // --- Scroll header shadow ---
    var header = document.querySelector('.site-header');
    if (header) {
      var update = function () {
        if (window.scrollY > 4) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
      };
      window.addEventListener('scroll', update, { passive: true });
      update();
    }
  });
})();
