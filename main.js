/*
 * 页面渲染：读取 projects.js 里的 PROFILE 和 PROJECTS 生成页面。
 * 平时修改内容不需要动这个文件。
 */
(() => {
  "use strict";

  // 类别 → 无封面占位图的色相（0–360）。这里的顺序也是筛选按钮的顺序。
  const CATEGORY_HUE = new Map([
    ["机器人", 212],
    ["计算机视觉", 262],
    ["AI", 172],
    ["Web 应用", 24],
    ["游戏", 330],
    ["竞赛", 42],
    ["小工具", 145],
  ]);
  const DEFAULT_HUE = 220;
  const SAFE_PROTOCOLS = ["http:", "https:", "mailto:"];

  const $ = (id) => document.getElementById(id);
  const text = (value) => (value == null ? "" : String(value).trim());
  const list = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
  const strings = (value) => list(value).map(text).filter(Boolean);
  // "2021–2026" 这样的区间按最近的年份排序
  const latestYear = (year) => Math.max(0, ...(year.match(/\d{4}/g) || []).map(Number));

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  }

  function append(parent, ...children) {
    parent.append(...children.filter(Boolean));
  }

  // 只允许 http(s)、mailto 和相对路径；javascript: 等其他协议返回空字符串
  function safeUrl(value) {
    const url = text(value);
    if (!url) return "";
    try {
      return SAFE_PROTOCOLS.includes(new URL(url).protocol) ? url : "";
    } catch {
      return url; // 不带协议、无法单独解析 => 相对路径
    }
  }

  function isExternal(href) {
    try {
      const url = new URL(href, location.href);
      return /^https?:$/.test(url.protocol) && url.origin !== location.origin;
    } catch {
      return false;
    }
  }

  function makeLink(label, url, className) {
    const name = text(label);
    const href = safeUrl(url);
    if (!name || !href) return null;
    const a = el("a", className, name);
    a.href = href;
    if (isExternal(href)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }

  function normalize(project, index) {
    return {
      id: text(project.id) || `project-${index + 1}`,
      title: text(project.title) || "未命名项目",
      summary: text(project.summary),
      description: text(project.description),
      year: text(project.year),
      categories: strings(project.categories),
      tech: strings(project.tech),
      highlights: strings(project.highlights),
      awards: strings(project.awards),
      cover: safeUrl(project.cover),
      video: safeUrl(project.video),
      demo: project.demo,
      links: list(project.links),
      featured: project.featured === true,
    };
  }

  /* ---------- 个人信息 ---------- */

  function renderProfile() {
    const name = text(PROFILE.name);
    $("name").textContent = name;
    $("footer-name").textContent = name;
    if (name) document.title = `${name} · 作品集`;

    for (const key of ["tagline", "bio"]) {
      const node = $(key);
      node.textContent = text(PROFILE[key]);
      node.hidden = !node.textContent;
    }

    const avatar = safeUrl(PROFILE.avatar);
    if (avatar) {
      const img = el("img", "avatar");
      img.alt = name ? `${name}的头像` : "头像";
      img.width = img.height = 88;
      img.addEventListener("error", () => img.remove(), { once: true });
      img.src = avatar;
      $("name").before(img);
    }

    const links = $("links");
    for (const item of list(PROFILE.links)) {
      const a = makeLink(item.label, item.url);
      if (!a) continue;
      const li = el("li");
      li.append(a);
      links.append(li);
    }
    links.hidden = !links.children.length;
  }

  /* ---------- 卡片 ---------- */

  function makeCover(project) {
    const box = el("div", "cover");
    if (!project.cover) return showFallback(box, project);
    const img = el("img");
    img.alt = `${project.title} 封面`;
    img.loading = "lazy";
    img.decoding = "async";
    // 图片路径写错时退回占位图
    img.addEventListener("error", () => { img.remove(); showFallback(box, project); }, { once: true });
    img.src = project.cover;
    box.append(img);
    return box;
  }

  function showFallback(box, project) {
    box.classList.add("cover--fallback");
    box.style.setProperty("--hue", CATEGORY_HUE.get(project.categories[0]) ?? DEFAULT_HUE);
    const letter = el("span", null, Array.from(project.title)[0]);
    letter.setAttribute("aria-hidden", "true");
    box.append(letter);
    return box;
  }

  function makeMeta(project) {
    const items = [project.year, ...project.categories].filter(Boolean);
    if (!items.length) return null;
    const meta = el("p", "meta");
    for (const item of items) meta.append(el("span", null, item));
    return meta;
  }

  function makeTags(items, className) {
    const ul = el("ul", className);
    ul.setAttribute("role", "list"); // list-style: none 时 Safari 会去掉列表语义
    for (const item of items) ul.append(el("li", null, item));
    return ul;
  }

  function makeCard(project) {
    const button = el("button", "card-btn", project.title);
    button.type = "button";
    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", () => openProject(project));
    cardButtons.set(project.id, button);

    const title = el("h3", "card-title");
    title.append(button);

    const awards = project.awards.length && makeTags(project.awards, "awards");
    if (awards) awards.setAttribute("aria-label", "获奖");

    const body = el("div", "card-body");
    append(
      body,
      makeMeta(project),
      title,
      project.summary && el("p", "card-summary", project.summary),
      awards,
      project.tech.length && makeTags(project.tech, "tags"),
    );

    const card = el("li", "card");
    card.append(makeCover(project), body);
    return card;
  }

  /* ---------- 筛选 ---------- */

  function renderFilters() {
    const present = new Set(projects.flatMap((p) => p.categories));
    const categories = [
      ...[...CATEGORY_HUE.keys()].filter((c) => present.has(c)),
      ...[...present].filter((c) => !CATEGORY_HUE.has(c)),
    ];
    if (!categories.length) return;

    const bar = $("filters");
    for (const category of [null, ...categories]) {
      const chip = el("button", "chip", category ?? "全部");
      chip.type = "button";
      chip.addEventListener("click", () => applyFilter(category));
      chips.push([chip, category]);
      bar.append(chip);
    }
    bar.hidden = false;
  }

  // category 为 null 表示「全部」
  function applyFilter(category) {
    let shown = 0;
    for (const [card, project] of cards) {
      const match = !category || project.categories.includes(category);
      card.hidden = !match;
      if (match) shown++;
    }
    for (const [chip, value] of chips) chip.setAttribute("aria-pressed", String(value === category));
    $("count").textContent = category
      ? `${shown} / ${projects.length} 个项目`
      : `共 ${projects.length} 个项目`;
  }

  /* ---------- 详情弹窗 ---------- */

  const dialog = $("detail");
  const detailMedia = $("detail-media");
  const detailBody = $("detail-body");
  let current = null;

  function makeMedia(project) {
    if (!project.video) return makeCover(project);
    const video = el("video");
    video.controls = true;
    video.preload = "metadata";
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", `${project.title} 演示视频`);
    if (project.cover) video.poster = project.cover;
    video.src = project.video;
    return video;
  }

  function makeSection(heading, content) {
    const section = el("section", "detail-section");
    section.append(el("h3", null, heading), content);
    return section;
  }

  function openProject(project) {
    current = project;

    const title = el("h2", "detail-title", project.title);
    title.id = "detail-title";

    const actions = el("div", "actions");
    append(
      actions,
      makeLink("在线体验", project.demo, "btn btn-primary"),
      ...project.links.map((link) => makeLink(link.label, link.url, "btn")),
    );

    detailMedia.replaceChildren(makeMedia(project));
    detailBody.replaceChildren();
    append(
      detailBody,
      makeMeta(project),
      title,
      (project.description || project.summary) &&
        el("p", "detail-desc", project.description || project.summary),
      project.awards.length && makeSection("获奖", makeTags(project.awards, "awards")),
      project.highlights.length && makeSection("项目亮点", makeTags(project.highlights, "highlights")),
      project.tech.length && makeSection("技术栈", makeTags(project.tech, "tags")),
      actions.children.length && actions,
    );
    $("detail-scroll").scrollTop = 0;

    history.replaceState(null, "", `#${encodeURIComponent(project.id)}`);
    document.documentElement.classList.add("is-locked");
    if (!dialog.open) dialog.showModal();
  }

  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("is-locked");
    detailMedia.replaceChildren(); // 移除视频，停止播放
    history.replaceState(null, "", location.pathname + location.search);
    if (current) cardButtons.get(current.id)?.focus();
  });

  $("detail-close").addEventListener("click", () => dialog.close());

  // 点击弹窗外的遮罩关闭（按下和松开都在遮罩上才算，避免拖选文字时误关）
  let pressedBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    pressedBackdrop = event.target === dialog;
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && pressedBackdrop) dialog.close();
  });

  function openFromHash() {
    let id = "";
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return; // 链接里的编码不合法，忽略
    }
    const project = projects.find((p) => p.id === id);
    if (project) openProject(project);
    else if (dialog.open) dialog.close();
  }

  /* ---------- 启动 ---------- */

  function dataLoaded() {
    try {
      return typeof PROFILE === "object" && PROFILE !== null && Array.isArray(PROJECTS);
    } catch {
      return false; // projects.js 运行到一半出错时，连访问 PROFILE / PROJECTS 都会抛错
    }
  }

  $("year").textContent = String(new Date().getFullYear());

  if (!dataLoaded()) {
    const notice = $("notice");
    notice.textContent = "内容加载失败：请检查 projects.js 是否有语法错误（按 F12 打开控制台可以看到出错位置）。";
    notice.hidden = false;
    return;
  }

  const projects = list(PROJECTS)
    .map(normalize)
    .sort((a, b) => b.featured - a.featured || latestYear(b.year) - latestYear(a.year));
  const cards = new Map(); // 卡片元素 → 项目
  const cardButtons = new Map(); // 项目 id → 卡片按钮（关闭弹窗后把焦点还给它）
  const chips = []; // [按钮, 类别]

  renderProfile();

  if (!projects.length) {
    const notice = $("notice");
    notice.textContent = "还没有添加项目。在 projects.js 的 PROJECTS 里加上第一个吧！";
    notice.hidden = false;
    return;
  }

  const grid = $("grid");
  for (const project of projects) {
    const card = makeCard(project);
    cards.set(card, project);
    grid.append(card);
  }
  renderFilters();
  applyFilter(null);

  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
