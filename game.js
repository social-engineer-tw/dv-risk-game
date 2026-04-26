const GAME_DURATION = 60;
const RISK_START = 50;
const RISK_MIN = 0;
const RISK_MAX = 100;
const BASE_FALL_SPEED = 96;
const EARLY_GAME_SPEED_DURATION = 5;
const EARLY_GAME_SPEED_MULTIPLIER = 0.85;
const HIGH_RISK_SPEED_MULTIPLIER = 1.15;
const CRITICAL_RISK_SPEED_MULTIPLIER = 1.25;
const SUPPORT_SLOW_MULTIPLIER = 0.78;
const SUPPORT_SLOW_DURATION = 2000;
const SUPPORT_COMBO_BONUS = -3;
const SPAWN_INTERVAL = 1300;
const MAX_ACTIVE_ITEMS = 2;
const EARLY_GAME_MAX_ACTIVE_ITEMS = 1;
const EFFECT_FLASH_DURATION = 700;
const COUNTDOWN_STEP_DURATION = 800;
const FIRST_SUPPORT_DEADLINE = 10;
const FIRST_SUPPORT_FORCE_AFTER = 7;
const EARLY_DANGER_LIMIT_SECONDS = 15;
const EARLY_DANGER_STREAK_LIMIT = 2;
const MAX_SAME_LANE_STREAK = 2;
const HIGH_RISK_SUPPORT_BOOST = 12;

const homeScreen = document.querySelector("#home-screen");
const gameScreen = document.querySelector("#game-screen");
const resultScreen = document.querySelector("#result-screen");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");
const homeButton = document.querySelector("#home-button");
const timeLeftDisplay = document.querySelector("#time-left");
const riskPanel = document.querySelector(".risk-panel");
const riskValue = document.querySelector("#risk-value");
const riskBar = document.querySelector("#risk-bar");
const laneArea = document.querySelector(".lane-area");
const playerBasket = document.querySelector("#player-basket");
const countdownDisplay = document.querySelector("#countdown-display");
const riskMessage = document.querySelector("#risk-message");
const itemMessage = document.querySelector("#item-message");
const resultTitle = document.querySelector("#result-title");
const resultDescription = document.querySelector("#result-description");
const lessonList = document.querySelector("#lesson-list");
const finalRisk = document.querySelector("#final-risk");
const roundSummary = document.querySelector("#round-summary");
const challengeTip = document.querySelector("#challenge-tip");
const closingLine = document.querySelector("#closing-line");
const laneButtons = document.querySelectorAll(".lane-button");
const laneElements = document.querySelectorAll(".lane");

const laneClassNames = ["lane-left", "lane-middle", "lane-right"];
const lanes = ["left", "middle", "right"];
const laneNames = {
  left: "左",
  middle: "中",
  right: "右",
};

const dropItems = [
  {
    icon: "💸",
    text: "錢不夠",
    type: "pressure",
    riskChange: 4,
    message: "壓力正在累積。",
  },
  {
    icon: "💼",
    text: "工作煩",
    type: "pressure",
    riskChange: 4,
    message: "工作壓力讓人更緊繃。",
  },
  {
    icon: "🌙",
    text: "睡不好",
    type: "pressure",
    riskChange: 5,
    message: "睡不好，判斷更容易變差。",
  },
  {
    icon: "😣",
    text: "被罵了",
    type: "pressure",
    riskChange: 5,
    message: "挫折感讓風險慢慢升高。",
  },
  {
    icon: "👶",
    text: "孩子哭",
    type: "pressure",
    riskChange: 4,
    message: "親職壓力正在增加。",
  },
  {
    icon: "🗯️",
    text: "罵回去",
    type: "danger",
    riskChange: 12,
    message: "言語暴力會讓風險升高。",
  },
  {
    icon: "📱",
    text: "查手機",
    type: "danger",
    riskChange: 14,
    message: "控制不是關心，風險上升。",
  },
  {
    icon: "💥",
    text: "砸東西",
    type: "danger",
    riskChange: 18,
    message: "砸東西會讓家人害怕。",
  },
  {
    icon: "⚠️",
    text: "威脅人",
    type: "danger",
    riskChange: 22,
    message: "威脅會讓風險快速升高。",
  },
  {
    icon: "⛔",
    text: "拿刀械",
    type: "danger",
    riskChange: 30,
    message: "武器會讓危險急速升高。",
  },
  {
    icon: "⏸️",
    text: "暫停",
    type: "support",
    riskChange: -12,
    message: "先停下來，風險下降。",
  },
  {
    icon: "☎️",
    text: "求助",
    type: "support",
    riskChange: -14,
    message: "求助可以讓風險下降。",
  },
  {
    icon: "🤝",
    text: "找社工",
    type: "support",
    riskChange: -12,
    message: "有人協助，風險有機會下降。",
  },
  {
    icon: "💬",
    text: "找人談",
    type: "support",
    riskChange: -10,
    message: "說出來，比硬撐安全。",
  },
  {
    icon: "📘",
    text: "學溝通",
    type: "support",
    riskChange: -10,
    message: "學習溝通，可以減少衝突。",
  },
];

let timeLeft = GAME_DURATION;
let timerId = null;
let spawnTimerId = null;
let animationFrameId = null;
let lastFrameTime = null;
let messageTimerId = null;
let supportSlowTimerId = null;
let effectTimerId = null;
let countdownTimerId = null;
let currentLane = "middle";
let risk = RISK_START;
let highestRisk = RISK_START;
let activeDrops = [];
let isPlaying = false;
let supportSpawnedInFirstTen = false;
let earlyDangerStreak = 0;
let lastSpawnLane = null;
let sameLaneStreak = 0;
let avoidedDangerCount = 0;
let supportStreak = 0;
let bestSupportStreak = 0;
let caughtCounts = {
  pressure: 0,
  danger: 0,
  support: 0,
};

function showScreen(screen) {
  [homeScreen, gameScreen, resultScreen].forEach((currentScreen) => {
    const isActive = currentScreen === screen;
    currentScreen.classList.toggle("screen-active", isActive);
    currentScreen.setAttribute("aria-hidden", String(!isActive));
  });
}

function clampRisk(value) {
  return Math.min(RISK_MAX, Math.max(RISK_MIN, value));
}

function updateTimerDisplay() {
  timeLeftDisplay.textContent = String(timeLeft);
}

function updateRiskDisplay() {
  riskValue.textContent = `${risk} / ${RISK_MAX}`;
  riskBar.style.width = `${risk}%`;

  riskPanel.classList.toggle("risk-safe", risk <= 20);
  riskPanel.classList.toggle("risk-medium", risk >= 21 && risk < 80);
  riskPanel.classList.toggle("risk-high", risk >= 80 && risk < RISK_MAX);
  riskPanel.classList.toggle("risk-critical", risk >= RISK_MAX);
  gameScreen.classList.toggle("risk-elevated", risk >= 70 && risk < 90);
  gameScreen.classList.toggle("risk-critical", risk >= 90);

  if (risk >= 80 && risk < RISK_MAX) {
    setRiskMessage("高風險，快接住支持。");
  } else if (risk >= 21) {
    setRiskMessage("警戒中，接住支持。");
  } else if (risk >= 1) {
    setRiskMessage("安全區，繼續穩住。");
  } else {
    setRiskMessage("安全區達成");
  }
}

function resetRoundState() {
  risk = RISK_START;
  highestRisk = RISK_START;
  caughtCounts = {
    pressure: 0,
    danger: 0,
    support: 0,
  };
  avoidedDangerCount = 0;
  supportStreak = 0;
  bestSupportStreak = 0;
  supportSpawnedInFirstTen = false;
  earlyDangerStreak = 0;
  lastSpawnLane = null;
  sameLaneStreak = 0;
  updateRiskDisplay();
}

function setRiskMessage(message) {
  riskMessage.textContent = message;
  riskMessage.classList.toggle("is-visible", Boolean(message));
}

function showItemMessage(message) {
  if (messageTimerId !== null) {
    clearTimeout(messageTimerId);
  }

  itemMessage.textContent = message;
  itemMessage.classList.add("is-visible");

  messageTimerId = setTimeout(() => {
    itemMessage.classList.remove("is-visible");
    messageTimerId = null;
  }, 2000);
}

function clearItemMessage() {
  if (messageTimerId !== null) {
    clearTimeout(messageTimerId);
    messageTimerId = null;
  }

  itemMessage.textContent = "";
  itemMessage.classList.remove("is-visible");
}

function clearCountdown() {
  if (countdownTimerId !== null) {
    clearTimeout(countdownTimerId);
    countdownTimerId = null;
  }

  countdownDisplay.textContent = "";
  countdownDisplay.classList.remove("is-visible");
}

function clearEffectClasses() {
  if (effectTimerId !== null) {
    clearTimeout(effectTimerId);
    effectTimerId = null;
  }

  gameScreen.classList.remove("danger-flash", "support-flash");
}

function showTemporaryEffect(className) {
  clearEffectClasses();
  gameScreen.classList.add(className);

  effectTimerId = setTimeout(() => {
    gameScreen.classList.remove(className);
    effectTimerId = null;
  }, EFFECT_FLASH_DURATION);
}

function startSupportSlowdown() {
  if (supportSlowTimerId !== null) {
    clearTimeout(supportSlowTimerId);
  }

  supportSlowTimerId = setTimeout(() => {
    supportSlowTimerId = null;
  }, SUPPORT_SLOW_DURATION);
}

function moveBasket(lane) {
  if (!laneNames[lane]) {
    return;
  }

  currentLane = lane;
  playerBasket.classList.remove(...laneClassNames);
  playerBasket.classList.add(`lane-${lane}`);
  playerBasket.setAttribute("aria-label", `接物籃目前在${laneNames[lane]}軌`);

  laneButtons.forEach((button) => {
    const isActive = button.dataset.lane === lane;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function moveBasketStep(direction) {
  const currentIndex = lanes.indexOf(currentLane);
  const nextIndex = Math.min(lanes.length - 1, Math.max(0, currentIndex + direction));
  moveBasket(lanes[nextIndex]);
}

function getElapsedSeconds() {
  return GAME_DURATION - timeLeft;
}

function getMaxActiveItems() {
  return getElapsedSeconds() < FIRST_SUPPORT_DEADLINE ? EARLY_GAME_MAX_ACTIVE_ITEMS : MAX_ACTIVE_ITEMS;
}

function getDropRatios() {
  const elapsedSeconds = getElapsedSeconds();
  const supportBoost = risk >= 80 ? HIGH_RISK_SUPPORT_BOOST : 0;

  if (elapsedSeconds < 20) {
    return {
      pressure: 45,
      danger: Math.max(10, 25 - supportBoost),
      support: 30 + supportBoost,
    };
  }

  if (elapsedSeconds < 40) {
    return {
      pressure: 40,
      danger: Math.max(15, 35 - supportBoost),
      support: 25 + supportBoost,
    };
  }

  return {
    pressure: 35,
    danger: Math.max(20, 45 - supportBoost),
    support: 20 + supportBoost,
  };
}

function pickWeightedType() {
  const ratios = getDropRatios();
  const roll = Math.random() * 100;

  if (roll < ratios.pressure) {
    return "pressure";
  }

  if (roll < ratios.pressure + ratios.danger) {
    return "danger";
  }

  return "support";
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function pickSpawnLane() {
  let lane = pickRandom(lanes);

  if (lane === lastSpawnLane && sameLaneStreak >= MAX_SAME_LANE_STREAK) {
    const otherLanes = lanes.filter((item) => item !== lastSpawnLane);
    lane = pickRandom(otherLanes);
  }

  if (lane === lastSpawnLane) {
    sameLaneStreak += 1;
  } else {
    lastSpawnLane = lane;
    sameLaneStreak = 1;
  }

  return lane;
}

function pickDropItem() {
  const elapsedSeconds = getElapsedSeconds();
  let type = pickWeightedType();

  if (
    elapsedSeconds >= FIRST_SUPPORT_FORCE_AFTER &&
    elapsedSeconds < FIRST_SUPPORT_DEADLINE &&
    !supportSpawnedInFirstTen
  ) {
    type = "support";
  }

  if (
    elapsedSeconds < EARLY_DANGER_LIMIT_SECONDS &&
    type === "danger" &&
    earlyDangerStreak >= EARLY_DANGER_STREAK_LIMIT
  ) {
    type = Math.random() < 0.6 ? "pressure" : "support";
  }

  if (type === "danger") {
    earlyDangerStreak += 1;
  } else {
    earlyDangerStreak = 0;
  }

  if (type === "support" && elapsedSeconds < FIRST_SUPPORT_DEADLINE) {
    supportSpawnedInFirstTen = true;
  }

  const pool = dropItems.filter((item) => item.type === type);
  return pickRandom(pool);
}

function createDrop() {
  if (!isPlaying || activeDrops.length >= getMaxActiveItems() || !gameScreen.classList.contains("screen-active")) {
    return;
  }

  const item = pickDropItem();
  const lane = pickSpawnLane();
  const element = document.createElement("div");

  element.className = `drop-card ${item.type} lane-${lane}`;
  element.innerHTML = `<span class="drop-icon" aria-hidden="true">${item.icon}</span><span>${item.text}</span>`;
  element.setAttribute("aria-label", `${item.text}，${laneNames[lane]}軌`);
  laneArea.appendChild(element);

  activeDrops.push({
    item,
    lane,
    element,
    y: -64,
  });
}

function getCurrentFallSpeed() {
  let speed = BASE_FALL_SPEED;

  if (getElapsedSeconds() < EARLY_GAME_SPEED_DURATION) {
    speed *= EARLY_GAME_SPEED_MULTIPLIER;
  }

  if (risk >= 90) {
    speed *= CRITICAL_RISK_SPEED_MULTIPLIER;
  } else if (risk >= 70) {
    speed *= HIGH_RISK_SPEED_MULTIPLIER;
  }

  if (supportSlowTimerId !== null) {
    speed *= SUPPORT_SLOW_MULTIPLIER;
  }

  return speed;
}

function avoidDanger() {
  avoidedDangerCount += 1;
  showItemMessage("避開危險，風險沒升高。");
}

function applyItemEffect(item) {
  const riskBeforeCatch = risk;
  caughtCounts[item.type] += 1;
  risk = clampRisk(risk + item.riskChange);

  if (item.type === "support") {
    supportStreak += 1;

    if (supportStreak >= 2) {
      risk = clampRisk(risk + SUPPORT_COMBO_BONUS);
    }

    bestSupportStreak = Math.max(bestSupportStreak, supportStreak);
  } else {
    supportStreak = 0;
  }

  highestRisk = Math.max(highestRisk, risk);
  updateRiskDisplay();

  if (item.type === "danger") {
    showTemporaryEffect("danger-flash");
    showItemMessage("危險選擇，風險快速上升。");
  } else if (item.type === "support") {
    showTemporaryEffect("support-flash");
    startSupportSlowdown();

    if (risk <= 20) {
      showItemMessage("進入安全區！");
    } else if (riskBeforeCatch >= 80) {
      showItemMessage("拉回來了！");
    } else if (supportStreak >= 2) {
      showItemMessage("支持連擊，風險再下降。");
    } else {
      showItemMessage("支持進場，風險下降。");
    }
  } else {
    showItemMessage("壓力累積，風險上升。");
  }

  if (risk >= RISK_MAX) {
    endGame("crisis");
  } else if (risk <= RISK_MIN) {
    endGame("safe-zone");
  }
}

function removeDrop(drop, wasCaught) {
  activeDrops = activeDrops.filter((activeDrop) => activeDrop !== drop);

  if (wasCaught) {
    drop.element.classList.add("is-caught");
    setTimeout(() => {
      drop.element.remove();
    }, 180);
    return;
  }

  drop.element.remove();
}

function updateDrops(timestamp) {
  if (lastFrameTime === null) {
    lastFrameTime = timestamp;
  }

  const secondsPassed = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;
  const catchLine = laneArea.clientHeight - 88;

  [...activeDrops].forEach((drop) => {
    if (!isPlaying) {
      return;
    }

    drop.y += getCurrentFallSpeed() * secondsPassed;
    drop.element.style.transform = `translateY(${drop.y}px)`;

    if (drop.y >= catchLine) {
      if (drop.lane === currentLane) {
        applyItemEffect(drop.item);
        removeDrop(drop, true);
      } else {
        if (drop.item.type === "danger") {
          avoidDanger();
        }

        removeDrop(drop, false);
      }
    }
  });

  if (isPlaying && gameScreen.classList.contains("screen-active")) {
    animationFrameId = requestAnimationFrame(updateDrops);
  }
}

function startTimer() {
  stopTimer();
  isPlaying = true;
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      endGame(getTimedResultType());
    }
  }, 1000);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function beginPlay() {
  if (!gameScreen.classList.contains("screen-active")) {
    clearCountdown();
    return;
  }

  clearCountdown();
  isPlaying = true;
  startDropping();
  startTimer();
}

function startCountdown() {
  clearCountdown();
  const steps = ["3", "2", "1", "開始"];
  let stepIndex = 0;

  countdownDisplay.textContent = steps[stepIndex];
  countdownDisplay.classList.add("is-visible");

  function showNextStep() {
    stepIndex += 1;

    if (stepIndex >= steps.length) {
      beginPlay();
      return;
    }

    countdownDisplay.textContent = steps[stepIndex];
    countdownTimerId = setTimeout(showNextStep, COUNTDOWN_STEP_DURATION);
  }

  countdownTimerId = setTimeout(showNextStep, COUNTDOWN_STEP_DURATION);
}

function startDropping() {
  stopDropping();
  lastFrameTime = null;
  createDrop();
  spawnTimerId = setInterval(createDrop, SPAWN_INTERVAL);
  animationFrameId = requestAnimationFrame(updateDrops);
}

function stopDropping() {
  if (spawnTimerId !== null) {
    clearInterval(spawnTimerId);
    spawnTimerId = null;
  }

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  lastFrameTime = null;
}

function clearDrops() {
  activeDrops.forEach((drop) => {
    drop.element.remove();
  });
  laneArea.querySelectorAll(".drop-card").forEach((element) => {
    element.remove();
  });
  activeDrops = [];
}

function clearSupportSlowdown() {
  if (supportSlowTimerId !== null) {
    clearTimeout(supportSlowTimerId);
    supportSlowTimerId = null;
  }
}

function getRoundSummaryText() {
  return [
    `壓力 ${caughtCounts.pressure} 次`,
    `危險 ${caughtCounts.danger} 次`,
    `支持 ${caughtCounts.support} 次`,
    `避開危險 ${avoidedDangerCount} 次`,
    `最高風險 ${highestRisk}`,
    `最高支持連擊 ${bestSupportStreak}`,
  ];
}

function getTimedResultType() {
  if (risk <= 20) {
    return "success";
  }

  if (risk <= 79) {
    return "steady";
  }

  return "high-risk";
}

function renderResult(resultType) {
  const resultContent = {
    "safe-zone": {
      title: "風險降到安全區",
      description: "你接住了足夠的支持，也避開了多數危險選擇，讓風險成功降到安全區。",
      closing: "支持越早進來，傷害越有機會被停下來。",
      tip: "下一次挑戰更快降到 0。",
      button: "再挑戰一次",
    },
    crisis: {
      title: "安全危機發生",
      description: "風險衝到 100。當壓力持續累積，又碰上威脅、控制、暴力或武器，危機可能快速升高。",
      closing: "壓力不是暴力的理由，危險選擇需要更早被停下來。",
      tip: "下一次先避開紅色危險。",
      button: "再挑戰一次",
    },
    success: {
      title: "成功守住",
      description: "好險有你：你讓風險維持在低風險狀態。壓力仍可能存在，但支持和安全選擇讓危機沒有擴大。",
      closing: "理解原因，不是原諒暴力；看見風險，是為了更早停止傷害。",
      tip: "下一次試著讓風險歸零。",
      button: "再挑戰一次",
    },
    steady: {
      title: "再接再厲",
      description: "還可以更穩：你撐過了 60 秒，但風險還沒有降到安全區。壓力和危險選擇需要更早被看見，也需要更多支持。",
      closing: "理解原因，不是原諒暴力；看見風險，是為了更早停止傷害。",
      tip: "下一次把風險降到 20 以下。",
      button: "再挑戰一次",
    },
    "high-risk": {
      title: "高風險未解除",
      description: "驚險邊緣：雖然撐到時間結束，但風險仍然很高。越接近安全危機，越需要停下危險選擇、接住支持。",
      closing: "理解原因，不是原諒暴力；看見風險，是為了更早停止傷害。",
      tip: "下一次多接綠色、少碰紅色。",
      button: "再挑戰一次",
    },
  };
  const content = resultContent[resultType];

  resultTitle.textContent = content.title;
  resultDescription.textContent = content.description;
  resultDescription.hidden = false;
  lessonList.hidden = false;
  closingLine.textContent = content.closing;
  restartButton.textContent = content.button;
  finalRisk.textContent = `最後風險：${risk} / ${RISK_MAX}`;
  roundSummary.innerHTML = getRoundSummaryText()
    .map((item) => `<span>${item}</span>`)
    .join("");
  challengeTip.textContent = content.tip;
}

function endGame(resultType) {
  isPlaying = false;
  stopTimer();
  stopDropping();
  clearDrops();
  clearCountdown();
  clearItemMessage();
  clearSupportSlowdown();
  clearEffectClasses();
  renderResult(resultType);
  showScreen(resultScreen);
}

function resetGameVisuals() {
  gameScreen.classList.remove("risk-elevated", "risk-critical", "danger-flash", "support-flash");
  riskPanel.classList.remove("risk-safe", "risk-medium", "risk-high", "risk-critical");
  setRiskMessage("");
  clearItemMessage();
  clearEffectClasses();
}

function startGame() {
  isPlaying = false;
  stopTimer();
  stopDropping();
  clearDrops();
  clearCountdown();
  clearSupportSlowdown();
  resetGameVisuals();
  resetRoundState();
  timeLeft = GAME_DURATION;
  updateTimerDisplay();
  moveBasket("middle");
  showScreen(gameScreen);
  startCountdown();
}

function returnHome() {
  isPlaying = false;
  stopTimer();
  stopDropping();
  clearDrops();
  clearCountdown();
  clearSupportSlowdown();
  resetGameVisuals();
  resetRoundState();
  timeLeft = GAME_DURATION;
  updateTimerDisplay();
  moveBasket("middle");
  showScreen(homeScreen);
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
homeButton.addEventListener("click", returnHome);

laneButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!isPlaying) {
      return;
    }

    moveBasket(button.dataset.lane);
  });
});

laneElements.forEach((laneElement, index) => {
  laneElement.addEventListener("click", () => {
    if (!isPlaying) {
      return;
    }

    moveBasket(lanes[index]);
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const directionByKey = {
    arrowleft: -1,
    a: -1,
    arrowright: 1,
    d: 1,
  };

  if (!isPlaying || !gameScreen.classList.contains("screen-active")) {
    return;
  }

  if (directionByKey[key]) {
    event.preventDefault();
    moveBasketStep(directionByKey[key]);
  }
});

updateTimerDisplay();
resetRoundState();
moveBasket(currentLane);
