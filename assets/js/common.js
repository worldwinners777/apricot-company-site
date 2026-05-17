/* 株式会社アプリコット 公式サイト 共通スクリプト
   - ハンバーガーメニュー
   - ヘッダープルダウン（PC: hover / SP: クリック）
   - スムーススクロール (簡易)
   - AI相談チャット（簡易ボット・全ページ共通挿入）
*/
(function () {
  'use strict';

  // 現在のページから assets/js/common.js までの相対 prefix を捕捉
  // （script タグの src を読み、"../../" のような相対プレフィックスを抽出）
  var PATH_PREFIX = '';
  var _cs = document.currentScript;
  if (_cs && _cs.getAttribute('src')) {
    var _m = _cs.getAttribute('src').match(/^((?:\.\.\/)+)/);
    if (_m) PATH_PREFIX = _m[1];
  }

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

    // --- AI相談チャット（簡易ボット） ---
    initAcChat(PATH_PREFIX);
  });

  // =========================================================================
  // AI相談チャット
  // - 実 AI API 接続なし。選択肢式で適切なサービス／お問い合わせへ誘導するだけ。
  // - HTML 改修不要：JS で DOM を生成して全ページに自動挿入する。
  // - 個人情報・フォーム送信なし。
  // =========================================================================
  function initAcChat(prefix) {
    // 多重挿入防止
    if (document.querySelector('[data-ac-chat]')) return;

    var CHOICES = [
      {
        label: '業務システムを作りたい',
        title: 'システム受託開発',
        desc:  '販売管理、在庫管理、顧客管理、社内管理システムなど、業務内容に合わせたシステム開発をご相談いただけます。',
        services: [
          { label: 'システム受託開発を見る', href: 'service/system-development/index.html' }
        ]
      },
      {
        label: 'Webサイトやアプリを作りたい',
        title: 'Web・アプリ制作',
        desc:  '企業サイト、サービスサイト、Webシステム、スマートフォン対応サイトなど、集客や業務効率化につながる制作をご相談いただけます。',
        services: [
          { label: 'Web・アプリ制作を見る', href: 'service/web-app/index.html' }
        ]
      },
      {
        label: 'AIを業務に活用したい',
        title: 'AI導入支援',
        desc:  'ChatGPT・Claude などの生成AIを、営業、事務、問い合わせ対応、資料作成、社内業務効率化などに活用する支援をご相談いただけます。',
        services: [
          { label: 'AI導入支援を見る', href: 'service/ai-support/index.html' }
        ]
      },
      {
        label: '海外人材・海外パートナーを活用したい',
        title: 'グローバル支援 ／ 人材・運用支援',
        desc:  '海外パートナーとの連携、オフショア開発、海外人材を活用した運用体制づくりをご相談いただけます。',
        services: [
          { label: 'グローバル支援を見る', href: 'service/global-support/index.html' },
          { label: '人材・運用支援を見る', href: 'service/hr-operation/index.html' }
        ]
      },
      {
        label: 'パッケージや既存サービスを導入したい',
        title: 'パッケージ・サービス提供',
        desc:  '既存の業務支援サービスやパッケージソフトの選定、導入、設定、運用ルール作成をご相談いただけます。',
        services: [
          { label: 'パッケージ・サービス提供を見る', href: 'service/package/index.html' }
        ]
      },
      {
        label: 'まだ相談内容が決まっていない',
        title: 'まずはお気軽にご相談ください',
        desc:  '内容が決まっていない段階でも問題ありません。現在の業務内容や困っていることを整理しながら、最適な進め方をご提案します。',
        services: []
      }
    ];

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (ch) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
      });
    }

    // --- 起動ボタン
    var launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'ac-launcher';
    launcher.setAttribute('aria-label', 'AI相談チャットを開く');
    launcher.innerHTML =
      '<span class="ac-launcher__icon" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>' +
        '</svg>' +
      '</span>' +
      '<span class="ac-launcher__label">AI相談</span>';

    // --- チャットパネル
    var panel = document.createElement('div');
    panel.className = 'ac-chat';
    panel.setAttribute('data-ac-chat', '');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'AI相談チャット');
    panel.innerHTML =
      '<div class="ac-chat__head">' +
        '<div class="ac-chat__title">' +
          '<span class="ac-chat__avatar" aria-hidden="true">A</span>' +
          '<div class="ac-chat__title-text">' +
            '<strong>アプリコット 相談ナビ</strong>' +
            '<small>サービスについてご案内します</small>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="ac-chat__close" aria-label="閉じる">×</button>' +
      '</div>' +
      '<div class="ac-chat__body" data-ac-body></div>' +
      '<div class="ac-chat__foot">' +
        '<button type="button" class="ac-chat__reset">最初に戻る</button>' +
      '</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    var body = panel.querySelector('[data-ac-body]');

    function openChat()  {
      panel.classList.add('is-open');
      launcher.classList.add('is-hidden');
      showIntro();
    }
    function closeChat() {
      panel.classList.remove('is-open');
      launcher.classList.remove('is-hidden');
    }

    function makeBotMsg(html) {
      var d = document.createElement('div');
      d.className = 'ac-msg ac-msg--bot';
      d.innerHTML =
        '<span class="ac-msg__avatar" aria-hidden="true">A</span>' +
        '<div class="ac-msg__bubble">' + html + '</div>';
      return d;
    }
    function makeUserMsg(text) {
      var d = document.createElement('div');
      d.className = 'ac-msg ac-msg--user';
      d.innerHTML = '<div class="ac-msg__bubble">' + esc(text) + '</div>';
      return d;
    }
    function scrollBottom() { body.scrollTop = body.scrollHeight; }

    function showIntro() {
      body.innerHTML = '';
      var intro = makeBotMsg(
        'こんにちは。<br>' +
        '株式会社アプリコットのサービスについて、簡単にご案内します。<br>' +
        'ご相談内容に近いものを選んでください。' +
        '<div class="ac-choices" role="group" aria-label="相談内容の選択肢"></div>'
      );
      var box = intro.querySelector('.ac-choices');
      CHOICES.forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ac-choice';
        b.textContent = c.label;
        b.addEventListener('click', function () { showAnswer(c); });
        box.appendChild(b);
      });
      body.appendChild(intro);
      scrollBottom();
    }

    function showAnswer(c) {
      // ユーザー発話
      body.appendChild(makeUserMsg(c.label));

      // ボット回答
      var cardHtml = '<div class="ac-card">' +
                       '<p class="ac-card__label">RECOMMEND</p>' +
                       '<p class="ac-card__title">' + esc(c.title) + '</p>' +
                       '<p class="ac-card__desc">' + esc(c.desc) + '</p>' +
                       '<div class="ac-card__links">';
      c.services.forEach(function (s) {
        cardHtml += '<a class="ac-link ac-link--service" href="' + esc(prefix + s.href) + '">' +
                      esc(s.label) + ' <span aria-hidden="true">→</span></a>';
      });
      cardHtml += '<a class="ac-link ac-link--contact" href="' + esc(prefix + 'contact/index.html') + '">' +
                    'お問い合わせする <span aria-hidden="true">→</span></a>';
      cardHtml += '</div></div>';

      var lead = c.services.length
        ? 'ありがとうございます。<br>「' + esc(c.label) + '」については、以下のサービスをご紹介します。'
        : 'ありがとうございます。<br>まずはお気軽にお問い合わせください。';

      body.appendChild(makeBotMsg(lead + cardHtml));
      scrollBottom();
    }

    launcher.addEventListener('click', openChat);
    panel.querySelector('.ac-chat__close').addEventListener('click', closeChat);
    panel.querySelector('.ac-chat__reset').addEventListener('click', showIntro);
  }
})();
