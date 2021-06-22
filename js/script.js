// 定义棋局对象
let chess = {
  // 定义游戏模式，0为玩家对战; 1为人机对战, AI后手; 2为人机对战, AI先手
  aiMode: 0,
  // 走子记录数组
  stepRecord: [],
  // 棋盘上交叉点的棋子类型数组
  chessPiece: [],
  // 赢法数组
  wins: [],
  // 赢法种数
  count: 0,
  // 赢法得分统计数组
  blackScore: [],
  whiteScore: [],
};
// 封装赢法数组构建函数
chess.createWins = function () {
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

// 清理棋盘上指定交叉点的棋子
chess.clearChessPiece = function (i, j) {
  this.chessPiece[i][j] = 0;
  //
  for (let k = 0; k < this.count; k++) {
    if (this.wins[i][j][k]) {
      if (!this.black) {
        this.blackScore[k]--;
      } else {
        this.whiteScore[k]--;
      }
    }
  }
  let x = i * 30 + 15;
  let y = j * 30 + 15;
  this.context.clearRect(x - 15, y - 15, 30, 30);
  this.context.beginPath();
  this.context.closePath();
  // 重置坐标类型
  this.chessPiece[i][j] = 0;
  // 重绘背景
  this.context.fillStyle = "#fafafa";
  this.context.fillRect(x - 15, y - 15, 30, 30);
  // 重绘删除部分的棋盘线
  this.context.strokeStyle = "#4a5a6a";
  this.context.moveTo(x, y - 15);
  this.context.lineTo(x, y + 15);
  this.context.moveTo(x - 15, y);
  this.context.lineTo(x + 15, y);
  this.context.stroke();
};
// 初始化棋盘
chess.start = function () {
  // 绘制棋盘
  if (!chessBoard) {
    window.alert("你的浏览器不支持canvas!");
    return;
  }
  this.context = chessBoard.getContext("2d");
  // 重新开局
  this.over = false;
  // 当前步时黑棋还是白棋
  this.black = true;
  // 清理canvas上所有元素
  this.context.clearRect(0, 0, 450, 450);
  this.context.beginPath();
  // 初始化得分统计数组
  for (let k = 0; k < this.count; k++) {
    this.blackScore[k] = 0;
    this.whiteScore[k] = 0;
  }
  // 初始化棋子类型, 0表示没有棋子, 1表示黑棋, 2表示白棋
  for (let i = 0; i < 15; i++) {
    this.chessPiece[i] = [];
    for (let j = 0; j < 15; j++) {
      this.chessPiece[i][j] = 0;
    }
  }
  // 绘制棋盘背景
  this.context.fillStyle = "#fafafa";
  this.context.fillRect(0, 0, 450, 450);
  // 绘制棋盘线
  this.context.strokeStyle = "#4a5a6a";
  for (let i = 0; i < 15; i++) {
    // 绘制横线
    this.context.moveTo(15 + i * 30, 15);
    this.context.lineTo(15 + i * 30, 435);
    // 绘制竖线
    this.context.moveTo(15, 15 + i * 30);
    this.context.lineTo(435, 15 + i * 30);
  }
  this.context.stroke();
  if (this.aiMode == 2) {
    this.chessPiece[7][7] = 1;
    this.oneStep(7, 7);
    this.black = !this.black;
  }
};
// 获取鼠标坐标开始绘制
chess.getTarget = function (i, j) {
  if (chess.chessPiece[i][j] == 0) {
    if (this.black) {
      this.chessPiece[i][j] = 1;
    } else {
      this.chessPiece[i][j] = 2;
    }
    this.oneStep(i, j);
    this.stepScore(i, j);
    this.black = !this.black;
    // ai模式
    if (this.aiMode) {
      this.aiStep();
    }
  }
};

// 封装指定交叉点绘制棋子函数
chess.oneStep = function (i, j) {
  let gradient = this.context.createRadialGradient(
    15 + i * 30 + 2,
    15 + j * 30 - 2,
    0,
    15 + i * 30 + 2,
    15 + j * 30 - 2,
    15
  );
  if (this.black) {
    gradient.addColorStop(0, "#aaa");
    gradient.addColorStop(1, "#000");
  } else {
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(1, "#aaa");
  }
  this.context.fillStyle = gradient;
  this.context.beginPath();
  this.context.arc(15 + i * 30, 15 + j * 30, 13, 0, Math.PI * 2);
  this.context.closePath();
  this.context.fill();
  this.stepRecord.push([i, j]);
};
// 封装得分统计函数，每下一步棋判断都判断一次
chess.stepScore = function (i, j) {
  for (let k = 0; k < this.count; k++) {
    if (this.wins[i][j][k]) {
      if (this.black) {
        this.blackScore[k]++;
        this.whiteScore[k] += 6;
      } else {
        this.blackScore[k] += 6;
        this.whiteScore[k]++;
      }
      if (this.blackScore[k] == 5) {
        setTimeout(function () {
          window.alert("黑棋胜！");
        }, 0);
        this.over = true;
      } else if (this.whiteScore[k] == 5) {
        setTimeout(function () {
          window.alert("白棋胜！");
        }, 0);
        this.over = true;
      }
    }
  }
};
// 封装计算机下棋功能
chess.aiStep = function () {
  let max = 0,
    u = 0,
    v = 0;

  for (let i = 0; i < 15; i++) {
    this.blackScore[i] = [];
    this.whiteScore[i] = [];
    for (let j = 0; j < 15; j++) {
      this.blackScore[i][j] = 0;
      this.whiteScore[i][j] = 0;
    }
  }
  // 判断计算机落子坐标
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if (this.chessPiece[i][j] == 0) {
        for (let k = 0; k < this.count; k++) {
          if (this.wins[i][j][k]) {
            switch (this.blackScore[k]) {
              case 1:
                this.blackScore[i][j] += 1;
                break;
              case 2:
                this.blackScore[i][j] += 10;
                break;
              case 3:
                this.blackScore[i][j] += 100;
                break;
              case 4:
                this.blackScore[i][j] += 1000;
                break;
              case 5:
                this.blackScore[i][j] += 10000;
            }
            switch (this.whiteScore[k]) {
              case 1:
                this.whiteScore[i][j] += 2;
                break;
              case 2:
                this.whiteScore[i][j] += 20;
                break;
              case 3:
                this.whiteScore[i][j] += 200;
                break;
              case 4:
                this.whiteScore[i][j] += 2000;
                break;
              case 5:
                this.whiteScore[i][j] += 20000;
            }
          }
        }
        if (this.aiMode == 1) {
          if (this.blackScore[i][j] > max) {
            max = this.blackScore[i][j];
            u = i;
            v = j;
          }
          if (this.whiteScore[i][j] > max) {
            max = this.whiteScore[i][j];
            u = i;
            v = j;
          }
        } else if (this.aiMode == 2) {
          if (this.whiteScore[i][j] > max) {
            max = this.whiteScore[i][j];
            u = i;
            v = j;
          }
          if (this.blackScore[i][j] > max) {
            max = this.blackScore[i][j];
            u = i;
            v = j;
          }
        }
      }
    }
  }
  // 判断计算机落子颜色
  if (this.black) {
    this.chessPiece[u][v] = 1;
  } else {
    this.chessPiece[u][v] = 2;
  }
  this.oneStep(u, v);
  this.stepScore(u, v);
  this.black = !this.black;
};

// 入口函数
window.onload = function () {
  chess.createWins();
  chess.start();
};

// DOM获取canvas元素
chessBoard = document.getElementById("chessBoard");
// 绑定鼠标点击事件到绘制棋子函数
chessBoard.onclick = function (e) {
  if (chess.over) {
    return;
  }
  let x = e.offsetX;
  let y = e.offsetY;
  let i = Math.floor(x / 30);
  let j = Math.floor(y / 30);
  chess.getTarget(i, j);
};

/***********添加按钮功能函数**********/
// 悔棋
chessWithdraw = document.getElementById("withdraw");
chessWithdraw.onclick = function () {
  if (chess.over) {
    window.alert("胜负已分，请重新开局！");
    return;
  }
  let [i, j] = chess.stepRecord.pop();
  chess.clearChessPiece(i, j);
  // 清理棋子
  if (chess.stepRecord.length == 0) {
    chess.start();
    return;
  }
};

// 模式切换
chessChangeMode = document.getElementById("changeMode");
chessChangeMode.onclick = () => {
  chess.aiMode = ++chess.aiMode % 3;
  chess.start();
  chess.changeStatus();
  // console.log("当前模式", chess.aiMode);
};
// 重新开局
chessRestart = document.getElementById("restart");
chessRestart.onclick = () => {
  chess.start();
};

chess.changeStatus = function () {
  let status = document.getElementById("status");
  if (this.aiMode == 0) {
    status.innerText = "玩家对战";
  } else if (this.aiMode == 1) {
    status.innerText = "人机对战(玩家先手)";
  } else if (this.aiMode == 2) {
    status.innerText = "人机对战(电脑先手)";
  }
};
