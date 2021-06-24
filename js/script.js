// 定义棋局对象
const Chess = {
  // 定义游戏模式，0 为玩家对战；1 为人机对战，电脑后手；2 为人机对战，电脑先手
  gameMode: 0,
  // 记录走子坐标，二维数组
  stepRecord: [],
  // 棋盘上交叉点的棋子类型数组
  chessCross: [],
  // 赢法数组，三维数组。i, j, k 对应横坐标，纵坐标和第 k 种赢法
  wins: [],
  // 赢法种数
  count: 0,
  // 得分统计数组，一维数组。索引对应的是第 k 种赢法，得分为 5 时获胜
  blackWin: [],
  whiteWin: [],
  // 判断对局是否结束
  over: false,
  // 当前落下的是否是黑子
  black: true,
  // 人机模式下计算机评估棋盘所有落子点得分数组
  aiBlackScore: [],
  aiWhiteScore: [],
};

// 封装赢法数组构建函数
Chess.createWins = function () {
  for (let i = 0; i < 15; i++) {
    this.wins[i] = [];
    for (let j = 0; j < 15; j++) {
      this.wins[i][j] = [];
    }
  }
  // 竖线赢法
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 11; j++) {
      for (let k = 0; k < 5; k++) {
        this.wins[i][j + k][this.count] = true;
      }
      this.count++;
    }
  }
  // 横线赢法
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 11; j++) {
      for (let k = 0; k < 5; k++) {
        this.wins[j + k][i][this.count] = true;
      }
      this.count++;
    }
  }
  // 对角线赢法
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 11; j++) {
      for (let k = 0; k < 5; k++) {
        this.wins[i + k][j + k][this.count] = true;
      }
      this.count++;
    }
  }
  // 反对角线赢法
  for (let i = 4; i < 15; i++) {
    for (let j = 0; j < 11; j++) {
      for (let k = 0; k < 5; k++) {
        this.wins[i - k][j + k][this.count] = true;
      }
      this.count++;
    }
  }
};

// 初始化棋盘
Chess.initChessBoard = function (elem) {
  // 获取 canvas 上下文
  this.context = elem.getContext('2d');
  // 重新开局
  this.over = false;
  // 初始化第一步为黑棋
  this.black = true;
  // 清理canvas上所有元素
  this.context.clearRect(0, 0, 450, 450);
  // 初始化得分统计数组
  for (let k = 0; k < this.count; k++) {
    this.blackWin[k] = 0;
    this.whiteWin[k] = 0;
  }
  // 初始化棋子类型, 0 表示没有棋子, 1 表示黑棋, 2 表示白棋
  for (let i = 0; i < 15; i++) {
    this.chessCross[i] = [];
    for (let j = 0; j < 15; j++) {
      this.chessCross[i][j] = 0;
    }
  }
  // 绘制棋盘背景
  this.context.fillStyle = '#fafafa';
  this.context.fillRect(0, 0, 450, 450);
  // 绘制棋盘线
  this.context.beginPath();
  for (let i = 0; i < 15; i++) {
    // 绘制横线
    this.context.moveTo(15 + i * 30, 15);
    this.context.lineTo(15 + i * 30, 435);
    // 绘制竖线
    this.context.moveTo(15, 15 + i * 30);
    this.context.lineTo(435, 15 + i * 30);
  }
  this.context.strokeStyle = '#4a5a6a';
  // 先关闭再描线会导致最后一条先被重复绘制，因此这里必须先描线再关闭
  this.context.stroke();
  this.context.closePath();
  // 如果是人机模式且电脑先手，则先在棋盘中央下一步棋
  if (this.gameMode === 2) {
    this.doOneStep(7, 7);
  }
};

// 封装指定交叉点绘制棋子函数
Chess.doOneStep = function (i, j) {
  // 判断当前交叉点有无棋子
  if (this.chessCross[i][j] !== 0) return false;
  let gradient = this.context.createRadialGradient(
    15 + i * 30 + 2,
    15 + j * 30 - 2,
    0,
    15 + i * 30 + 2,
    15 + j * 30 - 2,
    15
  );
  if (this.black) {
    // 棋子类型为黑棋
    this.chessCross[i][j] = 1;
    gradient.addColorStop(0, '#aaa');
    gradient.addColorStop(1, '#000');
  } else {
    // 棋子类型为白棋
    this.chessCross[i][j] = 2;
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#aaa');
  }
  this.context.beginPath();
  this.context.arc(15 + i * 30, 15 + j * 30, 13, 0, Math.PI * 2);
  this.context.closePath();
  this.context.fillStyle = gradient;
  this.context.fill();
  // 当前交叉点添加到落子记录
  this.stepRecord.push([i, j]);
  // 调用得分统计函数
  this.stepScore(i, j);
  // 必须在得分统计函数调用以后再反转当前黑白棋回合
  this.black = !this.black;
};

// 封装得分统计函数，每下一步棋判断都判断一次
Chess.stepScore = function (i, j) {
  for (let k = 0; k < this.count; k++) {
    if (this.wins[i][j][k]) {
      if (this.black) {
        this.blackWin[k]++;
        this.whiteWin[k] += 6;
      } else {
        this.blackWin[k] += 6;
        this.whiteWin[k]++;
      }
      // 得分为 5 即决出胜负
      if (this.blackWin[k] == 5) {
        setTimeout(window.alert('黑棋胜！'), 0);
        this.over = true;
        return false;
      } else if (this.whiteWin[k] == 5) {
        setTimeout(window.alert('白棋胜！'), 0);
        this.over = true;
        return false;
      }
    }
  }
};

// 清理棋盘上指定交叉点的棋子
Chess.clearChessCross = function (i, j) {
  // 重置交叉点棋子类型
  this.chessCross[i][j] = 0;
  // 遍历所有赢法，减去得分
  for (let k = 0; k < this.count; k++) {
    if (this.wins[i][j][k]) {
      if (!this.black) {
        this.blackWin[k]--;
        this.whiteWin[k] -= 6;
      } else {
        this.whiteWin[k]--;
        this.blackWin[k] -= 6;
      }
    }
  }
  // 清除交叉点周围小方块
  let x = i * 30 + 15;
  let y = j * 30 + 15;
  this.context.clearRect(x - 15, y - 15, 30, 30);
  // 重绘背景
  this.context.fillStyle = '#fafafa';
  this.context.fillRect(x - 15, y - 15, 30, 30);
  // 重绘删除部分的棋盘线
  this.context.beginPath();
  this.context.strokeStyle = '#4a5a6a';
  this.context.moveTo(x, y - 15);
  this.context.lineTo(x, y + 15);
  this.context.moveTo(x - 15, y);
  this.context.lineTo(x + 15, y);
  this.context.stroke();
  this.context.closePath();
};

// 封装计算机下棋功能
Chess.aiStep = function () {
  let max = 0,
    u = 0,
    v = 0;
  // 电脑下棋得分数组，二维数组
  for (let i = 0; i < 15; i++) {
    this.aiBlackScore[i] = [];
    this.aiWhiteScore[i] = [];
    for (let j = 0; j < 15; j++) {
      this.aiBlackScore[i][j] = 0;
      this.aiWhiteScore[i][j] = 0;
    }
  }
  // 判断计算机落子坐标
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if (this.chessCross[i][j] == 0) {
        for (let k = 0; k < this.count; k++) {
          if (this.wins[i][j][k]) {
            switch (this.blackWin[k]) {
              case 1:
                this.aiBlackScore[i][j] += 1;
                break;
              case 2:
                this.aiBlackScore[i][j] += 10;
                break;
              case 3:
                this.aiBlackScore[i][j] += 100;
                break;
              case 4:
                this.aiBlackScore[i][j] += 1000;
                break;
              case 5:
                this.aiBlackScore[i][j] += 10000;
            }
            switch (this.whiteWin[k]) {
              case 1:
                this.aiWhiteScore[i][j] += 2;
                break;
              case 2:
                this.aiWhiteScore[i][j] += 20;
                break;
              case 3:
                this.aiWhiteScore[i][j] += 200;
                break;
              case 4:
                this.aiWhiteScore[i][j] += 2000;
                break;
              case 5:
                this.aiWhiteScore[i][j] += 20000;
            }
          }
        }
        // 判断得分最高的点
        if (this.black) {
          if (this.aiWhiteScore[i][j] > max) {
            max = this.aiWhiteScore[i][j];
            u = i;
            v = j;
          }
          if (this.aiBlackScore[i][j] > max) {
            max = this.aiBlackScore[i][j];
            u = i;
            v = j;
          }
        } else {
          if (this.aiBlackScore[i][j] > max) {
            max = this.aiBlackScore[i][j];
            u = i;
            v = j;
          }
          if (this.aiWhiteScore[i][j] > max) {
            max = this.aiWhiteScore[i][j];
            u = i;
            v = j;
          }
        }
      }
    }
  }
  // 在最高得分交叉点落子
  this.doOneStep(u, v);
};

// 入口函数
window.onload = function () {
  // 调用创建赢法数组函数
  Chess.createWins();
  // 初始化棋盘
  let chessElem = document.getElementById('chess');
  Chess.initChessBoard(chessElem);
  // 绑定鼠标点击事件到绘制棋子函数
  chessElem.onclick = function (e) {
    if (Chess.over) return false;
    let x = e.offsetX;
    let y = e.offsetY;
    let i = Math.floor(x / 30);
    let j = Math.floor(y / 30);
    Chess.doOneStep(i, j);
    if (Chess.gameMode !== 0) {
      Chess.aiStep();
    }
  };
  /*********** 添加按钮功能函数 **********/
  // 悔棋
  withdrawElem = document.getElementById('withdraw');
  withdrawElem.onclick = function () {
    if (Chess.over) {
      setTimeout(window.alert('胜负已分，请重新开局！'), 0);
      return false;
    }
    // 清理最近一次落子
    if (Chess.stepRecord.length == 0) {
      return false;
    }
    let [i, j] = Chess.stepRecord.pop();
    Chess.clearChessCross(i, j);
    // 在人机模式下，需要回退两步棋
    if (Chess.gameMode !== 0) {
      let [i, j] = Chess.stepRecord.pop();
      Chess.clearChessCross(i, j);
    }
  };

  // 电脑提示
  promptElem = document.getElementById('prompt');
  promptElem.onclick = function () {
    if (Chess.over) {
      setTimeout(window.alert('胜负已分，请重新开局！'), 2000);
      return false;
    }
    Chess.aiStep();
  };

  // 模式切换
  changeModeElem = document.getElementById('changeMode');
  changeModeElem.onclick = function () {
    Chess.gameMode = ++Chess.gameMode % 3;
    Chess.initChessBoard(chessElem);
    // 修改页面中当前模式的显示文本
    let statusElem = document.getElementById('status');
    if (Chess.gameMode == 0) {
      statusElem.innerText = '玩家对战';
    } else if (Chess.gameMode == 1) {
      statusElem.innerText = '人机对战(玩家先手)';
    } else if (Chess.gameMode == 2) {
      statusElem.innerText = '人机对战(电脑先手)';
    }
  };

  // 重新开局
  restartElem = document.getElementById('restart');
  restartElem.onclick = () => {
    Chess.initChessBoard(chessElem);
  };
};
