import html2canvas from "html2canvas";
import { getGuessStatuses, CharStatus } from "./statuses";
import { MAX_GUESSES } from "./words";

// 颜色映射，与CSS类对应
const getColorForStatus = (status?: CharStatus) => {
  switch (status) {
    case 'correct':
      return '#d92d2d'; // bg-primary-green (Sutom red)
    case 'present':
      return '#f4c542'; // bg-primary-yellow (Sutom yellow)
    case 'absent':
      return '#2c4a8a'; // bg-primary-gray (Sutom blue)
    default:
      return '#ffffff'; // bg-white
  }
};

const getBorderColorForStatus = (status?: CharStatus) => {
  switch (status) {
    case 'correct':
      return '#d92d2d'; // border-primary-green
    case 'present':
      return '#f4c542'; // border-primary-yellow
    case 'absent':
      return '#2c4a8a'; // border-primary-gray
    default:
      return '#e2e8f0'; // border-slate-200
  }
};

const getTextColorForStatus = (status?: CharStatus) => {
  return status ? '#ffffff' : '#000000';
};

// 创建单个格子元素
const createCellElement = (letter: string, status?: CharStatus): HTMLDivElement => {
  const cell = document.createElement('div');
  cell.style.width = '56px';
  cell.style.height = '56px';
  cell.style.border = '2px solid';
  cell.style.borderColor = getBorderColorForStatus(status);
  cell.style.backgroundColor = getColorForStatus(status);
  cell.style.color = getTextColorForStatus(status);
  cell.style.display = 'inline-block';
  cell.style.margin = '0 2px';
  cell.style.fontSize = '24px';
  cell.style.fontWeight = 'bold';
  cell.style.borderRadius = '4px';
  cell.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  cell.style.textAlign = 'center';
  cell.textContent = letter;
  return cell;
};

// 创建一行元素
const createRowElement = (guess: string, solution: string): HTMLDivElement => {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.justifyContent = 'center';
  row.style.marginBottom = '4px';

  const statuses = getGuessStatuses(guess, solution);
  guess.split('').forEach((letter, i) => {
    const cell = createCellElement(letter, statuses[i]);
    row.appendChild(cell);
  });

  return row;
};

// 创建空行元素
const createEmptyRowElement = (wordLength: number): HTMLDivElement => {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.justifyContent = 'center';
  row.style.marginBottom = '4px';

  for (let i = 0; i < wordLength; i++) {
    const cell = createCellElement('');
    row.appendChild(cell);
  }

  return row;
};

// 生成游戏网格图片
export const generateGameImage = async (
  guesses: string[],
  solution: string,
  wordLength: number,
  maxGuesses: number = MAX_GUESSES
): Promise<void> => {
  // 创建临时容器
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '20px';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';

  // 创建标题
  const title = document.createElement('div');
  title.style.textAlign = 'center';
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '20px';
  title.style.color = '#1f2937';
  title.textContent = 'SUTOM 🎉';
  container.appendChild(title);

  // 创建游戏网格
  const grid = document.createElement('div');
  grid.style.paddingBottom = '10px';

  // 添加已完成的行
  guesses.forEach(guess => {
    const row = createRowElement(guess, solution);
    grid.appendChild(row);
  });

  // 添加空行（最多6行）
  const emptyRowsCount = Math.max(maxGuesses - guesses.length, 0);
  for (let i = 0; i < emptyRowsCount; i++) {
    const emptyRow = createEmptyRowElement(wordLength);
    grid.appendChild(emptyRow);
  }

  container.appendChild(grid);

  // 添加成就文字
  const achievementText = document.createElement('div');
  achievementText.style.textAlign = 'center';
  achievementText.style.fontSize = '16px';
  achievementText.style.color = '#374151';
  achievementText.style.marginTop = '16px';
  achievementText.style.fontWeight = '500';

  const attempts = guesses.length;
  const attemptText = attempts === 1 ? 'essai' : 'essais';
  achievementText.textContent = `🎯 Terminé en ${attempts} ${attemptText} ! Et toi ? 🚀`;
  container.appendChild(achievementText);

  // 添加网站链接
  const link = document.createElement('div');
  link.style.textAlign = 'center';
  link.style.fontSize = '14px';
  link.style.color = '#6b7280';
  link.style.marginTop = '10px';
  link.style.paddingTop = '10px';
  link.style.borderTop = '1px solid #e5e7eb';
  link.textContent = 'https://jeuxdelettes.com';
  container.appendChild(link);

  // 添加到DOM
  document.body.appendChild(container);

  try {
    // 生成图片
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高图片质量
      useCORS: true,
      allowTaint: true,
    });

    // 创建下载链接
    const link = document.createElement('a');
    link.download = `sutom-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {

    // console.error('生成图片失败:', error);
    // alert('生成图片失败，请重试');
  } finally {
    // 清理临时元素
    document.body.removeChild(container);
  }
};
