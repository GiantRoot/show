import React, {useState} from 'react';
import styles from './styles.module.css';

const SIZE = 8;
const TILE_TYPES = ['🍎', '🍋', '🍇', '💎', '⭐', '🍬'];

function randomTile() {
  return TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
}

function createsLine(board, index, tile) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;

  if (col >= 2 && board[index - 1] === tile && board[index - 2] === tile) {
    return true;
  }

  if (
    row >= 2 &&
    board[index - SIZE] === tile &&
    board[index - 2 * SIZE] === tile
  ) {
    return true;
  }

  return false;
}

function createBoard() {
  const board = [];

  for (let i = 0; i < SIZE * SIZE; i += 1) {
    let tile = randomTile();
    let tries = 0;

    while (createsLine(board, i, tile) && tries < 20) {
      tile = randomTile();
      tries += 1;
    }

    board.push(tile);
  }

  return board;
}

function findMatches(board) {
  const matched = new Set();

  for (let row = 0; row < SIZE; row += 1) {
    let start = 0;

    for (let col = 1; col <= SIZE; col += 1) {
      const current = col < SIZE ? board[row * SIZE + col] : null;
      const previous = board[row * SIZE + start];

      if (current !== previous) {
        const length = col - start;

        if (length >= 3) {
          for (let c = start; c < col; c += 1) {
            matched.add(row * SIZE + c);
          }
        }

        start = col;
      }
    }
  }

  for (let col = 0; col < SIZE; col += 1) {
    let start = 0;

    for (let row = 1; row <= SIZE; row += 1) {
      const current = row < SIZE ? board[row * SIZE + col] : null;
      const previous = board[start * SIZE + col];

      if (current !== previous) {
        const length = row - start;

        if (length >= 3) {
          for (let r = start; r < row; r += 1) {
            matched.add(r * SIZE + col);
          }
        }

        start = row;
      }
    }
  }

  return matched;
}

function collapseBoard(board, matched) {
  const next = [...board];

  for (let col = 0; col < SIZE; col += 1) {
    const remaining = [];

    for (let row = SIZE - 1; row >= 0; row -= 1) {
      const index = row * SIZE + col;

      if (!matched.has(index)) {
        remaining.push(next[index]);
      }
    }

    while (remaining.length < SIZE) {
      remaining.push(randomTile());
    }

    let pointer = 0;

    for (let row = SIZE - 1; row >= 0; row -= 1) {
      next[row * SIZE + col] = remaining[pointer];
      pointer += 1;
    }
  }

  return next;
}

function swapTiles(board, a, b) {
  const next = [...board];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

function isAdjacent(a, b) {
  const sameRow = Math.floor(a / SIZE) === Math.floor(b / SIZE);
  const horizontal = sameRow && Math.abs(a - b) === 1;
  const vertical = Math.abs(a - b) === SIZE;

  return horizontal || vertical;
}

function resolveCascades(board) {
  let workingBoard = [...board];
  let totalPoints = 0;
  let chains = 0;

  while (true) {
    const matched = findMatches(workingBoard);

    if (matched.size === 0) {
      break;
    }

    chains += 1;
    totalPoints += matched.size * 10 * chains;
    workingBoard = collapseBoard(workingBoard, matched);

    if (chains > 20) {
      break;
    }
  }

  return {
    board: workingBoard,
    points: totalPoints,
    chains,
  };
}

export default function Match3Game() {
  const [board, setBoard] = useState(() => createBoard());
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('选择两个相邻方块开始游戏');

  function handleTileClick(index) {
    if (selected === null) {
      setSelected(index);
      setMessage('请选择一个相邻方块');
      return;
    }

    if (selected === index) {
      setSelected(null);
      setMessage('已取消选择');
      return;
    }

    if (!isAdjacent(selected, index)) {
      setSelected(index);
      setMessage('只能交换相邻方块');
      return;
    }

    const swapped = swapTiles(board, selected, index);
    const matched = findMatches(swapped);

    if (matched.size === 0) {
      setSelected(null);
      setMoves((value) => value + 1);
      setMessage('没有形成 3 连，交换无效');
      return;
    }

    const result = resolveCascades(swapped);

    setBoard(result.board);
    setScore((value) => value + result.points);
    setMoves((value) => value + 1);
    setSelected(null);
    setMessage(`消除了 ${matched.size} 个方块，获得 ${result.points} 分`);
  }

  function restartGame() {
    setBoard(createBoard());
    setSelected(null);
    setScore(0);
    setMoves(0);
    setMessage('新游戏已开始');
  }

  return (
    <div className={styles.game}>
      <div className={styles.header}>
        <div>
          <strong>分数：</strong>
          {score}
        </div>
        <div>
          <strong>步数：</strong>
          {moves}
        </div>
        <button type="button" className={styles.restart} onClick={restartGame}>
          重新开始
        </button>
      </div>

      <p className={styles.message}>{message}</p>

      <div className={styles.board}>
        {board.map((tile, index) => (
          <button
            key={`${index}-${tile}`}
            type="button"
            className={`${styles.tile} ${
              selected === index ? styles.selected : ''
            }`}
            onClick={() => handleTileClick(index)}
            aria-label={`第 ${index + 1} 个方块`}
          >
            {tile}
          </button>
        ))}
      </div>
    </div>
  );
}