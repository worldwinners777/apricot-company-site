/* 株式会社アプリコット 公式サイト 共通スクリプト
   - ハンバーガーメニュー
   - ヘッダープルダウン（PC: hover / SP: クリック）
   - スムーススクロール (簡易)
   - AI相談チャット（2ステップ診断型・簡易ボット）
*/
(function () {
  'use strict';

  // 現在ページから assets/js/common.js までの相対 prefix を捕捉
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

    // --- AI相談チャット ---
    initAcChat(PATH_PREFIX);
  });

  // =========================================================================
  // AI相談チャット（2ステップ診断型・簡易ボット）
  // - 実 AI API 接続なし。選択肢で診断 → 推奨サービスへ誘導。
  // - HTML 編集不要：JS で DOM を生成し全ページに自動挿入。
  // - 個人情報・フォーム送信なし。外部通信なし。
  // =========================================================================
  function initAcChat(prefix) {
    if (document.querySelector('[data-ac-chat]')) return; // 多重挿入防止

    // ----- データ：6カテゴリ × ステップ2の絞り込み質問 × 回答 -----
    var FLOW = [
      {
        label: '業務を効率化したい',
        q2: '現在、特に困っていることはどれに近いですか？',
        sub: [
          'Excelや手作業が多い',
          '販売管理や在庫管理を整理したい',
          '社内の情報共有を改善したい',
          '既存システムを見直したい'
        ],
        answer: '業務システム開発、または IT コンサルティングが合いそうです。現在の業務フローを整理し、必要な機能から段階的にシステム化できます。',
        links: [
          { label: 'システム受託開発を見る',   href: 'service/system-development/index.html', kind: 'service' },
          { label: 'ITコンサルティングを見る', href: 'service/it-consulting/index.html',     kind: 'service' },
          { label: '相談する',                href: 'contact/index.html',                   kind: 'contact' }
        ]
      },
      {
        label: 'Webサイトやアプリを作りたい',
        q2: 'どのような目的の Web 制作に近いですか？',
        sub: [
          '会社サイトを整えたい',
          '問い合わせを増やしたい',
          'サービス紹介ページを作りたい',
          'Webシステムや予約機能も欲しい'
        ],
        answer: 'Web・アプリ制作が合いそうです。企業サイト、サービスサイト、Webシステム、スマートフォン対応サイトなど、目的に合わせて制作できます。',
        links: [
          { label: 'Web・アプリ制作を見る', href: 'service/web-app/index.html', kind: 'service' },
          { label: '相談する',              href: 'contact/index.html',         kind: 'contact' }
        ]
      },
      {
        label: 'AIを仕事に使いたい',
        q2: 'AI をどの業務に使いたいですか？',
        sub: [
          '問い合わせ対応',
          '資料作成',
          '営業支援',
          '社内業務の効率化',
          'まず何ができるか知りたい'
        ],
        answer: 'AI 導入支援が合いそうです。ChatGPT や Claude などの生成AIを、社内業務で安全に使える形に整え、実務に合わせて導入できます。',
        links: [
          { label: 'AI導入支援を見る', href: 'service/ai-support/index.html', kind: 'service' },
          { label: '相談する',         href: 'contact/index.html',            kind: 'contact' }
        ]
      },
      {
        label: '海外人材・海外パートナーを活用したい',
        q2: 'どのような支援に近いですか？',
        sub: [
          'オフショア開発を使いたい',
          '海外人材と業務を進めたい',
          '海外向け Web サイトを作りたい',
          '運用体制を整えたい'
        ],
        answer: 'グローバル支援、または人材・運用支援が合いそうです。海外パートナーや人材との連携、制作・運用体制づくりをサポートできます。',
        links: [
          { label: 'グローバル支援を見る',   href: 'service/global-support/index.html', kind: 'service' },
          { label: '人材・運用支援を見る',   href: 'service/hr-operation/index.html',   kind: 'service' },
          { label: '相談する',               href: 'contact/index.html',                kind: 'contact' }
        ]
      },
      {
        label: '既存サービスやパッケージを導入したい',
        q2: 'どのような導入に近いですか？',
        sub: [
          '業務支援ツールを導入したい',
          '既存ソフトを活用したい',
          '運用ルールも整えたい',
          'まず選定から相談したい'
        ],
        answer: 'パッケージ・サービス提供が合いそうです。既存の業務支援サービスやパッケージを活用し、導入から運用まで整理できます。',
        links: [
          { label: 'パッケージ・サービス提供を見る', href: 'service/package/index.html', kind: 'service' },
          { label: '相談する',                       href: 'contact/index.html',         kind: 'contact' }
        ]
      },
      {
        label: 'まだ相談内容が決まっていない',
        q2: 'まずは、今の状況に近いものを選んでください。',
        sub: [
          '何を改善すべきか分からない',
          '費用感を知りたい',
          'できることを相談したい',
          '会社全体の IT 活用を見直したい'
        ],
        answer: '内容が決まっていない段階でも問題ありません。現在の業務や課題を整理しながら、必要な支援内容をご提案できます。',
        links: [
          { label: '事業内容を見る', href: 'service/index.html',  kind: 'service' },
          { label: '相談する',       href: 'contact/index.html',  kind: 'contact' }
        ]
      }
    ];

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (ch) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
      });
    }

    // ----- 起動ボタン -----
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

    // ----- チャットパネル -----
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
        '<button type="button" class="ac-chat__back"  data-ac-back  hidden>← 1つ前</button>' +
        '<button type="button" class="ac-chat__reset" data-ac-reset>最初に戻る</button>' +
      '</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    var body     = panel.querySelector('[data-ac-body]');
    var backBtn  = panel.querySelector('[data-ac-back]');
    var resetBtn = panel.querySelector('[data-ac-reset]');

    // ----- 履歴スタック（戻る機能用） -----
    // entry: { step: 0|1|2, mainIndex: number|null, subIndex: number|null }
    var history = [];

    function renderState(state) {
      body.innerHTML = '';
      if (state.step >= 1 && state.mainIndex != null) {
        // 既に行ったやり取りを再描画
        var cat = FLOW[state.mainIndex];
        appendBotMsg(introHtml());
        appendUserMsg(cat.label);
        appendBotMsg(stepTwoIntroHtml(cat));
        if (state.step === 2 && state.subIndex != null) {
          appendUserMsg(cat.sub[state.subIndex]);
          appendBotMsg(answerHtml(cat));
        }
      } else {
        appendBotMsg(introHtml());
      }
      attachChoiceHandlers(state);
      updateBackButton();
      scrollBottom();
    }

    function pushAndRender(state) {
      history.push(state);
      renderState(state);
    }

    function updateBackButton() {
      if (history.length > 1) {
        backBtn.removeAttribute('hidden');
      } else {
        backBtn.setAttribute('hidden', '');
      }
    }

    // ----- DOM 生成ヘルパー -----
    function appendBotMsg(html) {
      var d = document.createElement('div');
      d.className = 'ac-msg ac-msg--bot';
      d.innerHTML =
        '<span class="ac-msg__avatar" aria-hidden="true">A</span>' +
        '<div class="ac-msg__bubble">' + html + '</div>';
      body.appendChild(d);
      return d;
    }
    function appendUserMsg(text) {
      var d = document.createElement('div');
      d.className = 'ac-msg ac-msg--user';
      d.innerHTML = '<div class="ac-msg__bubble">' + esc(text) + '</div>';
      body.appendChild(d);
      return d;
    }
    function scrollBottom() { body.scrollTop = body.scrollHeight; }

    // ----- 各ステップのテンプレート -----
    function introHtml() {
      var s = 'こんにちは。<br>' +
              '株式会社アプリコットのサービスについて、簡単にご案内します。<br>' +
              'まず、今いちばん近いご相談内容を選んでください。' +
              '<div class="ac-choices" data-ac-choices role="group" aria-label="相談カテゴリ">';
      FLOW.forEach(function (c, i) {
        s += '<button type="button" class="ac-choice" data-ac-main="' + i + '">' + esc(c.label) + '</button>';
      });
      s += '</div>';
      return s;
    }

    function stepTwoIntroHtml(cat) {
      var s = 'ありがとうございます。<br>' + esc(cat.q2) +
              '<div class="ac-choices" data-ac-choices role="group" aria-label="絞り込み選択肢">';
      cat.sub.forEach(function (label, i) {
        s += '<button type="button" class="ac-choice" data-ac-sub="' + i + '">' + esc(label) + '</button>';
      });
      s += '</div>';
      return s;
    }

    function answerHtml(cat) {
      var s = esc(cat.answer) +
              '<div class="ac-card">' +
                '<p class="ac-card__label">RECOMMEND</p>' +
                '<div class="ac-card__links">';
      cat.links.forEach(function (lk) {
        var cls = lk.kind === 'contact' ? 'ac-link--contact' : 'ac-link--service';
        s += '<a class="ac-link ' + cls + '" href="' + esc(prefix + lk.href) + '">' +
               esc(lk.label) + ' <span aria-hidden="true">→</span></a>';
      });
      s += '</div></div>' +
           '<div class="ac-actions">' +
             '<button type="button" class="ac-action ac-action--ghost" data-ac-restart>さらに相談する</button>' +
             '<button type="button" class="ac-action ac-action--text"  data-ac-restart>最初に戻る</button>' +
           '</div>';
      return s;
    }

    // ----- イベント結線（再描画ごとに付け直し） -----
    function attachChoiceHandlers(state) {
      body.querySelectorAll('[data-ac-main]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(btn.getAttribute('data-ac-main'), 10);
          // 履歴: 現状(step0) のあとに step1 を積む
          pushAndRender({ step: 1, mainIndex: i, subIndex: null });
        });
      });
      body.querySelectorAll('[data-ac-sub]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var j = parseInt(btn.getAttribute('data-ac-sub'), 10);
          var cur = history[history.length - 1];
          pushAndRender({ step: 2, mainIndex: cur.mainIndex, subIndex: j });
        });
      });
      body.querySelectorAll('[data-ac-restart]').forEach(function (btn) {
        btn.addEventListener('click', resetToIntro);
      });
    }

    // ----- 操作: 開閉・リセット・1つ戻る -----
    function openChat() {
      panel.classList.add('is-open');
      launcher.classList.add('is-hidden');
      if (history.length === 0) {
        resetToIntro();
      } else {
        renderState(history[history.length - 1]);
      }
    }
    function closeChat() {
      panel.classList.remove('is-open');
      launcher.classList.remove('is-hidden');
    }
    function resetToIntro() {
      history = [];
      pushAndRender({ step: 0, mainIndex: null, subIndex: null });
    }
    function goBack() {
      if (history.length <= 1) return;
      history.pop();
      renderState(history[history.length - 1]);
    }

    launcher.addEventListener('click', openChat);
    panel.querySelector('.ac-chat__close').addEventListener('click', closeChat);
    backBtn.addEventListener('click', goBack);
    resetBtn.addEventListener('click', resetToIntro);
  }
})();
