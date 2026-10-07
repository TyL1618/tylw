(() => {
  'use strict';

  const app = document.getElementById('app');
  const LETTERS = ['A', 'B', 'C', 'D'];
  const CATEGORIES = ['單字', '片語', '文法'];
  const BASE_TITLE = '線上考卷';
  let routeToken = 0;

  /* ---------- 小工具 ---------- */

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    return res.json();
  }

  // 考卷檔把 answer / zh / note 收進 base64 的 secret 欄位；載入後在這裡還原
  function unlock(exam) {
    if (typeof exam.secret !== 'string') return exam;
    const bytes = Uint8Array.from(atob(exam.secret), (c) => c.charCodeAt(0));
    const sec = JSON.parse(new TextDecoder('utf-8').decode(bytes));
    if (!Array.isArray(sec) || sec.length !== exam.questions.length) throw new Error('secret 與題數不符');
    exam.questions = exam.questions.map((q, i) => ({ ...q, ...sec[i] }));
    delete exam.secret;
    return exam;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ---------- 基本防複製（純前端，只擋一般操作） ---------- */

  const stop = (e) => e.preventDefault();
  ['contextmenu', 'copy', 'cut', 'dragstart', 'selectstart'].forEach((t) => document.addEventListener(t, stop));
  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    const devtools = e.key === 'F12' || (mod && (e.shiftKey || e.altKey) && ['i', 'j', 'c'].includes(k));
    const copyLike = mod && !e.shiftKey && !e.altKey && ['c', 'x', 'a', 's', 'p', 'u'].includes(k);
    if (devtools || copyLike) e.preventDefault();
  });

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function jumpTo(n) {
    const el = document.getElementById('q-' + n);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  }

  function showMessage(text) {
    app.replaceChildren(
      h('p', { class: 'status', text }),
      h('p', { class: 'status' }, h('a', { href: '#/', text: '回到考卷列表' }))
    );
  }

  /* ---------- 首頁 ---------- */

  async function showHome(token) {
    document.title = BASE_TITLE;
    let data;
    try {
      data = await fetchJSON('exams/index.json');
    } catch (e) {
      if (token !== routeToken) return;
      showMessage('讀不到考卷清單。請透過網址開啟本頁（不能直接雙擊 index.html）。');
      return;
    }
    if (token !== routeToken) return;

    const exams = data.exams || [];
    const list = exams.length
      ? h('ul', { class: 'exam-list' }, exams.map((ex) =>
          h('li', null,
            h('a', { class: 'exam-card', href: '#/exam/' + encodeURIComponent(ex.id) },
              h('span', { class: 'exam-date', text: ex.title }),
              h('span', { class: 'exam-count', text: `${ex.questionCount} 題` }),
              h('span', { class: 'exam-scope', text: ex.scope }),
              h('span', { class: 'exam-go', 'aria-hidden': 'true', text: '開始作答 ›' })
            )
          )))
      : h('p', { class: 'status', text: '目前還沒有考卷。' });

    app.replaceChildren(
      h('header', { class: 'home-head' },
        h('h1', { text: '線上考卷' }),
        h('p', { text: '選一份考卷開始作答。交卷後會馬上看到分數、錯題與每題解析。' })
      ),
      list,
      h('section', { class: 'handout' },
        h('strong', { text: '文法講義' }),
        h('a', { href: 'assets/grammar-summary.pdf', target: '_blank', rel: 'noopener', text: '開啟 PDF' }),
        h('a', { href: 'assets/grammar-summary.pdf', download: '高職英文文法總整理.pdf', text: '下載' })
      )
    );
    window.scrollTo(0, 0);
  }

  /* ---------- 考卷：狀態 ---------- */

  function buildState(exam) {
    const order = exam.questions.map((_, i) => i);
    if (exam.shuffleQuestions) shuffle(order);
    const items = order.map((qi, i) => {
      const q = exam.questions[qi];
      const optOrder = [0, 1, 2, 3];
      if (exam.shuffleOptions) shuffle(optOrder);
      return { n: i + 1, q, optOrder, correct: optOrder.indexOf(q.answer), picked: null };
    });
    return { exam, items, submitted: false };
  }

  const isRight = (it) => it.picked === it.correct;
  const optText = (it, k) => it.q.options[it.optOrder[k]];

  /* ---------- 考卷：畫面 ---------- */

  function blankEl(it, submitted) {
    const el = h('span', { class: 'blank' });
    fillBlank(el, it, submitted);
    return el;
  }

  function fillBlank(el, it, submitted) {
    el.replaceChildren();
    if (submitted) {
      el.classList.add('done');
      el.textContent = optText(it, it.correct);
    } else if (it.picked != null) {
      el.textContent = optText(it, it.picked);
    } else {
      el.append(h('span', { class: 'sr-only', text: '空格' }));
    }
  }

  function questionEl(state, it, hooks) {
    const { q, n } = it;
    const sub = state.submitted;
    const right = sub && isRight(it);
    const [pre, post] = q.sentence.split('___');
    const blank = blankEl(it, sub);

    const head = h('div', { class: 'q-head' },
      h('span', { class: 'qnum', text: `第 ${n} 題` }),
      q.category ? h('span', { class: 'tag', text: q.category }) : null,
      sub ? h('span', { class: right ? 'badge ok' : 'badge bad', text: right ? '✓ 答對' : '✗ 答錯' }) : null
    );

    const opts = h('div', { class: 'opts', role: 'radiogroup', 'aria-labelledby': `qs-${n}` },
      it.optOrder.map((_, k) => {
        const id = `q${n}-o${k}`;
        let cls = 'opt';
        let mark = null;
        if (sub) {
          if (k === it.correct) {
            cls += ' is-answer';
            mark = it.picked === k ? '✓ 你的答案（正確）' : '✓ 正確答案';
          } else if (k === it.picked) {
            cls += ' is-miss';
            mark = '✗ 你的答案';
          }
        }
        const input = h('input', { type: 'radio', name: `q${n}`, id, value: k, disabled: sub });
        input.checked = it.picked === k;
        if (!sub) {
          input.addEventListener('change', () => {
            it.picked = k;
            fillBlank(blank, it, false);
            card.classList.add('answered');
            hooks.onPick();
          });
        }
        return h('div', { class: cls },
          input,
          h('label', { for: id },
            h('span', { class: 'letter', text: LETTERS[k] }),
            h('span', { class: 'opt-body' },
              h('span', { class: 'opt-text', text: optText(it, k) }),
              mark ? h('span', { class: 'mark', text: mark }) : null
            )
          )
        );
      })
    );

    const explain = sub
      ? h('div', { class: 'explain' },
          h('dl', null,
            h('div', null, h('dt', { text: '正確答案' }),
              h('dd', { text: `${LETTERS[it.correct]}. ${optText(it, it.correct)}` })),
            h('div', null, h('dt', { text: '中文翻譯' }), h('dd', { text: q.zh })),
            h('div', null, h('dt', { text: '重點解析' }), h('dd', { text: q.note }))
          ))
      : null;

    const card = h('article', {
      class: 'q' + (sub ? (right ? ' is-right' : ' is-wrong') : ''),
      id: `q-${n}`,
      tabindex: '-1'
    },
      head,
      h('p', { class: 'sentence', id: `qs-${n}` }, pre, blank, post),
      opts,
      explain
    );
    return card;
  }

  function summaryEl(state, actions) {
    const { items } = state;
    const total = items.length;
    const right = items.filter(isRight).length;
    const wrong = items.filter((it) => !isRight(it));
    const pct = Math.round((right / total) * 100);

    const cats = CATEGORIES
      .map((c) => {
        const group = items.filter((it) => it.q.category === c);
        if (!group.length) return null;
        const ok = group.filter(isRight).length;
        return h('li', { text: `${c} ${ok} / ${group.length}（${Math.round((ok / group.length) * 100)}%）` });
      })
      .filter(Boolean);

    const wrongBox = h('div', { class: 'wrong-box' },
      h('h2', { text: wrong.length ? `答錯的題號（共 ${wrong.length} 題）` : '錯誤題號' }),
      wrong.length
        ? h('div', { class: 'chips' }, wrong.map((it) =>
            h('button', {
              type: 'button', class: 'chip', 'aria-label': `跳到第 ${it.n} 題`,
              onclick: () => jumpTo(it.n), text: String(it.n)
            })))
        : h('p', { class: 'all-right', text: '全部答對！' })
    );

    return h('section', { class: 'summary', id: 'summary', tabindex: '-1', 'aria-label': '成績' },
      h('div', { class: 'score' },
        h('span', { class: 'big', text: String(right) }),
        h('span', { class: 'of', text: `/ ${total} 題` }),
        h('span', { class: 'pct', text: `${pct}%` })
      ),
      cats.length ? h('ul', { class: 'cats', 'aria-label': '各題型答對率' }, cats) : null,
      wrongBox,
      h('div', { class: 'summary-actions' },
        wrong.length
          ? h('label', { class: 'switch' },
              h('input', { type: 'checkbox', onchange: (e) => actions.onlyWrong(e.target.checked) }),
              '只看錯題')
          : null,
        h('button', { type: 'button', class: 'btn primary', onclick: actions.redo, text: '重做一次' }),
        h('a', { class: 'btn', href: '#/', text: '考卷列表' })
      )
    );
  }

  function renderExam(state, { focusSummary = false } = {}) {
    const { exam, items } = state;
    document.title = `${exam.title}｜${BASE_TITLE}`;
    const total = items.length;

    const list = h('div', { class: 'questions', id: 'questions' });
    const redo = () => { renderExam(buildState(exam)); window.scrollTo(0, 0); };

    // 作答中：底部進度列與「尚未作答」清單
    let bar = null, todoBox = null, submitBtn = null, progText = null, progSub = null, meter = null;
    const refresh = () => {
      const missing = items.filter((it) => it.picked == null);
      const done = total - missing.length;
      progText.textContent = `已作答 ${done} / ${total}`;
      progSub.textContent = missing.length ? `還有 ${missing.length} 題沒寫` : '全部寫完了，可以交卷';
      meter.firstChild.style.width = `${(done / total) * 100}%`;
      submitBtn.disabled = missing.length > 0;
      todoBox.hidden = missing.length === 0 || done === 0;
      todoBox.querySelector('.chips').replaceChildren(
        ...missing.map((it) => h('button', {
          type: 'button', class: 'chip todo', 'aria-label': `跳到第 ${it.n} 題`,
          onclick: () => jumpTo(it.n), text: String(it.n)
        }))
      );
    };

    for (const it of items) list.append(questionEl(state, it, { onPick: () => refresh() }));

    const head = h('header', { class: 'exam-head' },
      h('h1', { text: exam.title }),
      h('p', { text: `${exam.scope}・共 ${total} 題` })
    );
    const back = h('a', { class: 'back', href: '#/', text: '‹ 考卷列表' });

    if (!state.submitted) {
      progText = h('div', { class: 'bar-text' });
      progSub = h('div', { class: 'bar-sub' });
      meter = h('div', { class: 'meter', 'aria-hidden': 'true' }, h('div'));
      submitBtn = h('button', { type: 'button', class: 'btn primary', disabled: true, text: '交卷' });
      submitBtn.addEventListener('click', () => {
        if (items.some((it) => it.picked == null)) return;
        state.submitted = true;
        renderExam(state, { focusSummary: true });
      });
      todoBox = h('section', { class: 'todo-box', hidden: true },
        h('h2', { text: '還沒寫的題號' }),
        h('div', { class: 'chips' })
      );
      bar = h('div', { class: 'bar' },
        h('div', { class: 'bar-inner' },
          h('div', { class: 'bar-info', 'aria-live': 'polite' }, progText, progSub, meter),
          submitBtn
        )
      );
      app.replaceChildren(back, head, list, todoBox, bar);
      refresh();
    } else {
      const summary = summaryEl(state, {
        redo,
        onlyWrong: (on) => list.classList.toggle('only-wrong', on)
      });
      app.replaceChildren(back, head, summary, list,
        h('div', { class: 'end-actions' },
          h('button', { type: 'button', class: 'btn primary', onclick: redo, text: '重做一次' }),
          h('a', { class: 'btn', href: '#/', text: '考卷列表' })
        ));
      if (focusSummary) {
        window.scrollTo(0, 0);
        summary.focus({ preventScroll: true });
      }
    }
  }

  async function showExam(id, token) {
    if (!/^[\w-]+$/.test(id)) { showMessage('找不到這份考卷。'); return; }
    let exam;
    try {
      exam = unlock(await fetchJSON(`exams/${id}.json`));
    } catch (e) {
      if (token !== routeToken) return;
      showMessage('找不到這份考卷。');
      return;
    }
    if (token !== routeToken) return;
    renderExam(buildState(exam));
    window.scrollTo(0, 0);
  }

  /* ---------- 路由 ---------- */

  function route() {
    const token = ++routeToken;
    const m = location.hash.match(/^#\/exam\/([^/?#]+)/);
    if (m) showExam(decodeURIComponent(m[1]), token);
    else showHome(token);
  }

  window.addEventListener('hashchange', route);
  route();
})();
