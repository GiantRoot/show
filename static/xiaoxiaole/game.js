(() => {
  "use strict";

  const BOARD_SIZE = 7;
  const ROWS = BOARD_SIZE;
  const COLS = BOARD_SIZE;
  const CENTER = Math.floor(BOARD_SIZE / 2);
  const MAX_LEVEL = 6;
  const REMOVE_MS = 620;
  const DROP_MS = 340;
  const SWAP_MS = 330;

  const LEVELS = [
    { title: "硕士", color: "#00c2a8" },
    { title: "博士", color: "#2f80ed" },
    { title: "博后", color: "#8b5cf6" },
    { title: "副教授", color: "#ff4d8d" },
    { title: "教授", color: "#ff8a00" },
    { title: "杰青", color: "#2dd36f" },
    { title: "院士", color: "#ffd600" }
  ];

  const INITIAL_COUNTS = new Map([
    [4, 2],
    [3, 4],
    [2, 7],
    [1, 14],
    [0, 22]
  ]);

  const surnames = "赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜谢邹喻柏水窦章云苏潘葛范彭郎鲁韦昌马苗凤花方俞任袁柳鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹".split("");
  const givenNames = [
    "明", "华", "强", "敏", "磊", "静", "洋", "艳", "勇", "杰", "芳", "娜", "军", "丽", "涛", "超",
    "鹏", "辉", "梅", "鑫", "晨", "雪", "佳", "宁", "宇", "璐", "睿", "涵", "博", "然", "思", "雅",
    "子墨", "一凡", "若曦", "梓涵", "浩然", "雨桐", "嘉宁", "书瑶", "景行", "知远", "明哲", "安然"
  ];

  const boardEl = document.getElementById("board");
  const cellLayer = document.getElementById("cellLayer");
  const tileLayer = document.getElementById("tileLayer");
  const endEffect = document.getElementById("endEffect");
  const legendEl = document.getElementById("legend");
  const startScreen = document.getElementById("startScreen");
  const startForm = document.getElementById("startForm");
  const playerNameInput = document.getElementById("playerNameInput");
  const restartBtn = document.getElementById("restartBtn");
  const statusText = document.getElementById("statusText");
  const movesValue = document.getElementById("movesValue");
  const scoreValue = document.getElementById("scoreValue");
  const highestValue = document.getElementById("highestValue");

  let board = createEmptyBoard();
  let tileElements = new Map();
  let nextId = 1;
  let selectedId = null;
  let busy = true;
  let gameOver = false;
  let playerEliminated = false;
  let playerName = "玩家";
  let playerRankLevel = 0;
  let moves = 0;
  let score = 0;
  let highestLevel = 0;
  let spawnBag = [];
  let layout = { cell: 64, gap: 6, pad: 6 };

  function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function keyOf(row, col) {
    return `${row},${col}`;
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function makeLevelBag() {
    const bag = [];
    INITIAL_COUNTS.forEach((count, level) => {
      for (let i = 0; i < count; i += 1) {
        bag.push(level);
      }
    });
    return shuffle(bag);
  }

  function drawSpawnLevel() {
    if (spawnBag.length === 0) {
      spawnBag = makeLevelBag();
    }
    return spawnBag.pop();
  }

  function makeName() {
    return randomItem(surnames) + randomItem(givenNames);
  }

  function makePiece(level, row, col, name = makeName()) {
    return {
      id: nextId++,
      level,
      row,
      col,
      name,
      isPlayer: false,
      visualRow: null,
      removing: false,
      upgraded: false
    };
  }

  function buildCells() {
    boardEl.style.setProperty("--board-size", String(BOARD_SIZE));
    cellLayer.innerHTML = "";
    for (let i = 0; i < ROWS * COLS; i += 1) {
      cellLayer.appendChild(document.createElement("span"));
    }
  }

  function buildLegend() {
    legendEl.innerHTML = "";
    LEVELS.forEach((level, index) => {
      const item = document.createElement("div");
      item.className = "legend-item";

      const rank = document.createElement("div");
      rank.className = "legend-rank";

      const swatch = document.createElement("span");
      swatch.className = "legend-swatch";
      swatch.style.background = level.color;

      const label = document.createElement("strong");
      label.textContent = level.title;

      const note = document.createElement("small");
      note.textContent = index === MAX_LEVEL ? "终点" : `三合一`;

      rank.append(swatch, label);
      item.append(rank, note);
      legendEl.appendChild(item);
    });
  }

  function updateLayout() {
    const styles = getComputedStyle(boardEl);
    const gap = parseFloat(styles.getPropertyValue("--board-gap")) || 6;
    const size = boardEl.clientWidth;
    const cell = (size - gap * 2 - gap * (COLS - 1)) / COLS;
    layout = { cell, gap, pad: gap };
    boardEl.style.setProperty("--tile-size", `${cell}px`);
    renderTiles();
  }

  function positionFor(row, col) {
    return {
      x: layout.pad + col * (layout.cell + layout.gap),
      y: layout.pad + row * (layout.cell + layout.gap)
    };
  }

  function createTileElement(piece) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile";
    button.dataset.id = String(piece.id);

    const title = document.createElement("span");
    title.className = "tile-title";
    const name = document.createElement("span");
    name.className = "tile-name";
    button.append(title, name);

    button.addEventListener("click", () => handleTileClick(piece.id));
    tileLayer.appendChild(button);
    tileElements.set(piece.id, button);
    return button;
  }

  function updateTileElement(piece) {
    const element = tileElements.get(piece.id) || createTileElement(piece);
    const { x, y } = positionFor(piece.visualRow ?? piece.row, piece.col);
    element.className = [
      "tile",
      `level-${piece.level}`,
      piece.isPlayer ? "player" : "",
      selectedId === piece.id ? "selected" : "",
      piece.removing ? "removing" : "",
      piece.upgraded ? "upgraded" : ""
    ].filter(Boolean).join(" ");
    element.dataset.titleLength = String(LEVELS[piece.level].title.length);
    element.style.setProperty("--name-font-size", `${getNameFontSize(piece.name)}px`);
    element.style.setProperty("--tile-x", `${x}px`);
    element.style.setProperty("--tile-y", `${y}px`);
    element.style.transform = `translate(${x}px, ${y}px)`;
    element.style.zIndex = piece.upgraded ? "8" : String(2 + piece.row);
    element.setAttribute("aria-label", `${LEVELS[piece.level].title} ${piece.name}`);
    element.querySelector(".tile-title").textContent = LEVELS[piece.level].title;
    element.querySelector(".tile-name").textContent = piece.name;
  }

  function getNameFontSize(name) {
    const length = Math.max(1, Array.from(name).length);
    const preferred = Math.min(11, layout.cell * 0.15);
    const fitted = (layout.cell - 8) / length;
    return Math.max(7, Math.min(preferred, fitted));
  }

  function getPieces() {
    return board.flat().filter(Boolean);
  }

  function renderTiles() {
    const pieces = getPieces();
    const liveIds = new Set(pieces.map((piece) => piece.id));
    tileElements.forEach((element, id) => {
      if (!liveIds.has(id)) {
        element.remove();
        tileElements.delete(id);
      }
    });
    pieces.forEach(updateTileElement);
  }

  function setStatus(text) {
    statusText.textContent = text;
  }

  function updateStats() {
    movesValue.textContent = String(moves);
    scoreValue.textContent = String(score);
    highestValue.textContent = getPlayerRankTitle();
  }

  function getPlayerRankTitle() {
    const playerPiece = getPieces().find((piece) => piece.isPlayer);
    if (playerPiece) {
      playerRankLevel = playerPiece.level;
      return LEVELS[playerPiece.level].title;
    }
    return playerEliminated ? "已出局" : LEVELS[playerRankLevel].title;
  }

  function getPlayerResultTitle() {
    const title = LEVELS[playerRankLevel].title;
    return playerEliminated ? `${title}（已出局）` : title;
  }

  function levelGridHasLargeGroup(grid) {
    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        if (visited[row][col] || grid[row][col] === null) {
          continue;
        }
        const cells = collectLevelGridComponent(grid, row, col, visited);
        if (cells.length >= 3) {
          return true;
        }
      }
    }
    return false;
  }

  function collectLevelGridComponent(grid, row, col, visited) {
    const level = grid[row][col];
    const queue = [{ row, col }];
    const cells = [];
    visited[row][col] = true;
    for (let i = 0; i < queue.length; i += 1) {
      const cell = queue[i];
      cells.push(cell);
      neighbors(cell.row, cell.col).forEach((next) => {
        if (!visited[next.row][next.col] && grid[next.row][next.col] === level) {
          visited[next.row][next.col] = true;
          queue.push(next);
        }
      });
    }
    return cells;
  }

  function canPlaceLevel(grid, row, col, level) {
    grid[row][col] = level;
    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const size = collectLevelGridComponent(grid, row, col, visited).length;
    grid[row][col] = null;
    return size <= 2;
  }

  function placeWithLimit(grid, level, count) {
    for (let placed = 0; placed < count; placed += 1) {
      const candidates = shuffle(allCoords().filter(({ row, col }) => {
        return grid[row][col] === null && canPlaceLevel(grid, row, col, level);
      }));
      if (candidates.length === 0) {
        return false;
      }
      const chosen = candidates[0];
      grid[chosen.row][chosen.col] = level;
    }
    return true;
  }

  function allCoords() {
    const coords = [];
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        coords.push({ row, col });
      }
    }
    return coords;
  }

  function makeInitialLevelGrid() {
    const coords = allCoords();
    const dark = coords.filter(({ row, col }) => (row + col) % 2 === 0);
    const light = coords.filter(({ row, col }) => (row + col) % 2 === 1);

    for (let attempt = 0; attempt < 250; attempt += 1) {
      const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
      shuffle(dark).slice(0, INITIAL_COUNTS.get(0)).forEach(({ row, col }) => {
        grid[row][col] = 0;
      });
      shuffle(light).slice(0, INITIAL_COUNTS.get(1)).forEach(({ row, col }) => {
        grid[row][col] = 1;
      });

      const ok = placeWithLimit(grid, 2, INITIAL_COUNTS.get(2))
        && placeWithLimit(grid, 3, INITIAL_COUNTS.get(3))
        && placeWithLimit(grid, 4, INITIAL_COUNTS.get(4));

      if (ok && !levelGridHasLargeGroup(grid)) {
        return grid;
      }
    }

    return makeFallbackLevelGrid();
  }

  function makeFallbackLevelGrid() {
    const shuffled = makeLevelBag();
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    allCoords().forEach(({ row, col }, index) => {
      grid[row][col] = shuffled[index];
    });
    return grid;
  }

  function materializeBoard(levelGrid) {
    const nextBoard = createEmptyBoard();
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        nextBoard[row][col] = makePiece(levelGrid[row][col], row, col);
      }
    }
    return nextBoard;
  }

  function markPlayerPiece() {
    const masters = getPieces().filter((piece) => piece.level === 0);
    const playerPiece = randomItem(masters.length ? masters : getPieces());
    playerPiece.name = playerName;
    playerPiece.isPlayer = true;
    playerRankLevel = playerPiece.level;
    playerEliminated = false;
  }

  function startNewGame() {
    busy = true;
    gameOver = false;
    playerEliminated = false;
    endEffect.classList.add("hidden");
    endEffect.innerHTML = "";
    boardEl.classList.remove("game-ended");
    selectedId = null;
    moves = 0;
    score = 0;
    highestLevel = 0;
    playerRankLevel = 0;
    spawnBag = makeLevelBag();
    nextId = 1;
    tileElements.forEach((element) => element.remove());
    tileElements = new Map();
    board = materializeBoard(makeInitialLevelGrid());
    markPlayerPiece();
    renderTiles();
    updateStats();
    setStatus(`${playerName} 从硕士开始。`);
    setTimeout(() => {
      busy = false;
    }, 240);
  }

  function findPieceById(id) {
    return getPieces().find((piece) => piece.id === id) || null;
  }

  function areAdjacent(first, second) {
    return Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;
  }

  async function handleTileClick(id) {
    if (busy || gameOver) {
      return;
    }

    const piece = findPieceById(id);
    if (!piece) {
      return;
    }

    if (selectedId === null) {
      selectedId = id;
      renderTiles();
      return;
    }

    if (selectedId === id) {
      selectedId = null;
      renderTiles();
      return;
    }

    const selected = findPieceById(selectedId);
    if (!selected) {
      selectedId = id;
      renderTiles();
      return;
    }

    if (!areAdjacent(selected, piece)) {
      selectedId = id;
      renderTiles();
      return;
    }

    await trySwap(selected, piece);
  }

  function swapPieces(first, second) {
    const firstRow = first.row;
    const firstCol = first.col;
    const secondRow = second.row;
    const secondCol = second.col;

    board[firstRow][firstCol] = second;
    board[secondRow][secondCol] = first;
    first.row = secondRow;
    first.col = secondCol;
    second.row = firstRow;
    second.col = firstCol;
  }

  async function trySwap(first, second) {
    busy = true;
    selectedId = null;
    swapPieces(first, second);
    renderTiles();
    await sleep(SWAP_MS);

    const matches = findMatches();
    if (!hasMatches(matches)) {
      swapPieces(first, second);
      renderTiles();
      setStatus("这一步没有形成合并。");
      await sleep(SWAP_MS);
      busy = false;
      return;
    }

    moves += 1;
    updateStats();
    await processMatches(matches);
    busy = false;
  }

  function neighbors(row, col) {
    return [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 }
    ].filter((cell) => cell.row >= 0 && cell.row < ROWS && cell.col >= 0 && cell.col < COLS);
  }

  function findMatches() {
    const runs = findStraightLineRuns();
    const clears = new Map();
    const endpointCells = new Map();
    const upgradeCandidates = [];

    runs.forEach((run) => {
      if (run.cells.length >= 4) {
        run.cells.forEach((cell) => clears.set(keyOf(cell.row, cell.col), cell));
        return;
      }

      if (run.cells.length === 3 && run.level < MAX_LEVEL) {
        const keep = run.cells[1];
        upgradeCandidates.push({ keep, cells: run.cells, fromLevel: run.level });
        [run.cells[0], run.cells[2]].forEach((cell) => {
          endpointCells.set(keyOf(cell.row, cell.col), cell);
        });
      }
    });

    endpointCells.forEach((cell, key) => clears.set(key, cell));

    const upgradesByKeep = new Map();
    upgradeCandidates.forEach((candidate) => {
      const keepKey = keyOf(candidate.keep.row, candidate.keep.col);
      if (clears.has(keepKey)) {
        return;
      }
      const existing = upgradesByKeep.get(keepKey);
      if (!existing) {
        upgradesByKeep.set(keepKey, {
          keep: candidate.keep,
          cells: [...candidate.cells],
          fromLevel: candidate.fromLevel
        });
        return;
      }
      const known = new Set(existing.cells.map((cell) => keyOf(cell.row, cell.col)));
      candidate.cells.forEach((cell) => {
        if (!known.has(keyOf(cell.row, cell.col))) {
          existing.cells.push(cell);
        }
      });
    });

    return { clears, upgrades: [...upgradesByKeep.values()] };
  }

  function findStraightLineRuns() {
    const runs = [];
    for (let row = 0; row < ROWS; row += 1) {
      runs.push(...collectLineRuns(Array.from({ length: COLS }, (_, col) => ({ row, col }))));
    }

    for (let col = 0; col < COLS; col += 1) {
      runs.push(...collectLineRuns(Array.from({ length: ROWS }, (_, row) => ({ row, col }))));
    }

    return runs;
  }

  function collectLineRuns(cells) {
    const runs = [];
    let start = 0;

    while (start < cells.length) {
      const first = cells[start];
      const firstPiece = board[first.row][first.col];
      if (!firstPiece) {
        start += 1;
        continue;
      }

      let end = start + 1;
      while (end < cells.length) {
        const next = cells[end];
        const nextPiece = board[next.row][next.col];
        if (!nextPiece || nextPiece.level !== firstPiece.level) {
          break;
        }
        end += 1;
      }

      const length = end - start;
      if (length >= 3) {
        runs.push({
          level: firstPiece.level,
          cells: cells.slice(start, end)
        });
      }
      start = end;
    }

    return runs;
  }

  function hasMatches(matches) {
    return matches.clears.size > 0 || matches.upgrades.length > 0;
  }

  async function processMatches(initialMatches) {
    let matches = initialMatches;
    let chain = 1;
    let academyPiece = null;

    for (let guard = 0; guard < 28 && hasMatches(matches); guard += 1) {
      const result = await applyMatches(matches, chain);
      academyPiece = academyPiece || result.academyPiece;

      if (academyPiece) {
        await celebrateAcademician(academyPiece);
        return;
      }

      await collapseAndFill();
      clearUpgradeFlags();
      renderTiles();
      updateStats();

      matches = findMatches();
      chain += 1;
    }
  }

  async function applyMatches(matches, chain) {
    let academyPiece = null;
    let removedCount = matches.clears.size;
    let playerOutThisTurn = false;

    matches.upgrades.forEach((upgrade) => {
      const survivor = board[upgrade.keep.row][upgrade.keep.col];
      if (!survivor || survivor.level >= MAX_LEVEL) {
        return;
      }

      const survivorWasPlayer = survivor.isPlayer;
      survivor.level += 1;
      survivor.upgraded = true;
      survivor.name = survivorWasPlayer ? playerName : survivor.name;
      if (survivorWasPlayer) {
        survivor.isPlayer = true;
        playerRankLevel = survivor.level;
      }
      highestLevel = Math.max(highestLevel, survivor.level);
      score += (survivor.level + 1) * 35 * chain;
      if (survivor.level === MAX_LEVEL) {
        academyPiece = survivor;
      }
    });

    matches.clears.forEach((cell) => {
      const piece = board[cell.row][cell.col];
      if (piece) {
        if (piece.isPlayer) {
          playerOutThisTurn = true;
          playerEliminated = true;
          playerRankLevel = piece.level;
        }
        piece.removing = true;
        score += (piece.level + 1) * 8 * chain;
      }
    });

    let message = "";
    if (matches.upgrades.length > 0 && matches.clears.size > 0) {
      message = `连线晋升 ${matches.upgrades.length} 组，${removedCount} 人出局。`;
    } else if (matches.clears.size > 0) {
      message = `过度竞争，${removedCount} 人同归于尽。`;
    }
    if (playerOutThisTurn) {
      message += `玩家 ${playerName} 出局。`;
    }
    if (message) {
      setStatus(message);
    }

    renderTiles();
    await sleep(REMOVE_MS);

    matches.clears.forEach((cell) => {
      const piece = board[cell.row][cell.col];
      if (!piece) {
        return;
      }
      const element = tileElements.get(piece.id);
      if (element) {
        element.remove();
      }
      tileElements.delete(piece.id);
      board[cell.row][cell.col] = null;
    });

    return { academyPiece };
  }

  async function collapseAndFill() {
    const spawned = [];

    for (let col = 0; col < COLS; col += 1) {
      let writeRow = ROWS - 1;
      for (let row = ROWS - 1; row >= 0; row -= 1) {
        const piece = board[row][col];
        if (!piece) {
          continue;
        }
        if (writeRow !== row) {
          board[writeRow][col] = piece;
          board[row][col] = null;
          piece.row = writeRow;
          piece.col = col;
        }
        writeRow -= 1;
      }

      let spawnOffset = 0;
      for (let row = writeRow; row >= 0; row -= 1) {
        const piece = makePiece(drawSpawnLevel(), row, col);
        piece.visualRow = -1 - spawnOffset;
        board[row][col] = piece;
        spawned.push(piece);
        spawnOffset += 1;
      }
    }

    renderTiles();
    await nextFrame();
    spawned.forEach((piece) => {
      piece.visualRow = null;
    });
    renderTiles();
    await sleep(DROP_MS);
  }

  function clearUpgradeFlags() {
    getPieces().forEach((piece) => {
      piece.upgraded = false;
    });
  }

  async function celebrateAcademician(piece) {
    const livePiece = findPieceById(piece.id);
    if (!livePiece) {
      return;
    }

    gameOver = true;
    selectedId = null;
    clearUpgradeFlags();
    updateStats();
    setStatus(`${livePiece.name} 成为院士，游戏结束。`);
    renderTiles();
    await sleep(140);

    const element = tileElements.get(livePiece.id);
    if (element) {
      const from = positionFor(livePiece.row, livePiece.col);
      const to = positionFor(CENTER, CENTER);
      element.style.zIndex = "60";
      await element.animate([
        { transform: `translate(${from.x}px, ${from.y}px) scale(1)` },
        { transform: `translate(${to.x}px, ${to.y}px) scale(1.13)` }
      ], {
        duration: 680,
        easing: "cubic-bezier(0.2, 0.78, 0.25, 1)",
        fill: "forwards"
      }).finished.catch(() => undefined);
    }

    arrangeAcademicianCourt(livePiece);
    renderTiles();
    updateStats();
    showContributionHalos();
    await sleep(300);
    busy = false;
    setStatus(`游戏结束：步数 ${moves}，积分 ${score}，玩家职称 ${getPlayerResultTitle()}。`);
  }

  function showContributionHalos() {
    endEffect.innerHTML = "";
    for (let i = 0; i < 5; i += 1) {
      const halo = document.createElement("span");
      halo.className = "halo";
      endEffect.appendChild(halo);
    }
    endEffect.classList.remove("hidden");
    boardEl.classList.add("game-ended");
  }

  function arrangeAcademicianCourt(academyPiece) {
    const academyWasPlayer = academyPiece.isPlayer && !playerEliminated;
    const academyName = academyPiece.name;
    tileElements.forEach((element) => element.remove());
    tileElements = new Map();
    board = createEmptyBoard();

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const level = courtLevelFor(row, col);
        const piece = row === CENTER && col === CENTER
          ? makePiece(MAX_LEVEL, row, col, academyName)
          : makePiece(level, row, col);
        piece.isPlayer = row === CENTER && col === CENTER && academyWasPlayer;
        board[row][col] = piece;
      }
    }
  }

  function courtLevelFor(row, col) {
    const ring = Math.max(Math.abs(row - CENTER), Math.abs(col - CENTER));
    if (ring === 0) {
      return 6;
    }
    if (ring === 1) {
      return row === CENTER || col === CENTER ? 5 : 4;
    }
    if (ring === 2) {
      return (row + col) % 2 === 0 ? 4 : 3;
    }
    return [2, 0, 1][(row + col) % 3];
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  restartBtn.addEventListener("click", () => {
    if (busy && !gameOver) {
      return;
    }
    startNewGame();
  });

  startForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = playerNameInput.value.trim();
    playerName = value || "玩家";
    startScreen.classList.add("hidden");
    startNewGame();
  });

  buildCells();
  buildLegend();
  updateLayout();
  updateStats();

  if ("ResizeObserver" in window) {
    new ResizeObserver(updateLayout).observe(boardEl);
  } else {
    window.addEventListener("resize", updateLayout);
  }
})();
