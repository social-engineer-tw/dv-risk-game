const GAME_DURATION = 60;
const SAFE_START = 20;
const SAFE_MIN = 0;
const SAFE_MAX = 100;
const BASE_FALL_SPEED = 96;
const GLOBAL_SPEED_MULTIPLIER = 1.3;
const MAX_DELTA = 0.033;
const SPAWN_OFFSET = 56;
const DROP_WIDTH_DESKTOP = 138;
const DROP_WIDTH_MOBILE = 112;
const DROP_HEIGHT_DESKTOP = 58;
const DROP_HEIGHT_MOBILE = 52;
const BASKET_WIDTH_DESKTOP = 116;
const BASKET_WIDTH_MOBILE = 96;
const CATCHER_HEIGHT_DESKTOP = 78;
const CATCHER_HEIGHT_MOBILE = 70;
const CATCHER_BOTTOM_OFFSET = 18;
const BASKET_SPEED = 620;
const MIN_DROP_VERTICAL_GAP = 76;
const MIN_DROP_NEAR_VERTICAL_GAP = 140;
const MIN_DROP_HORIZONTAL_GAP = 118;
const SPAWN_SIDE_PADDING = 12;
const MAX_SPAWN_ATTEMPTS = 6;
const SPAWN_RETRY_DELAY = 150;
const EARLY_GAME_SPEED_MULTIPLIER = 1;
const NORMAL_SPEED_START = 10;
const LATE_GAME_SPEED_START = 25;
const FINAL_SPEED_START = 45;
const LATE_GAME_PROMPT_TIME_LEFT = 35;
const LATE_GAME_SPEED_MULTIPLIER = 1.5;
const FINAL_SPEED_TIME = 15;
const MID_GAME_SPEED_MULTIPLIER = 1.25;
const FINAL_SPEED_MULTIPLIER = 1.8;
const SUPPORT_SLOW_MULTIPLIER = 0.78;
const SUPPORT_SLOW_DURATION = 2000;
const DANGER_BASKET_SLOW_MULTIPLIER = 0.72;
const DANGER_BASKET_SLOW_DURATION = 1400;
const EFFECT_FLASH_DURATION = 700;
const COUNTDOWN_STEP_DURATION = 800;
const FIRST_SUPPORT_DEADLINE = 10;
const FIRST_SUPPORT_FORCE_AFTER = 4;
const EARLY_DANGER_LIMIT_SECONDS = 15;
const EARLY_DANGER_STREAK_LIMIT = 2;
const DROP_PHASES = [
  {
    start: 0,
    maxActive: 2,
    spawnInterval: [900, 1100],
    speedMultiplier: EARLY_GAME_SPEED_MULTIPLIER,
    ratios: { support: 50, pressure: 35, danger: 15 },
  },
  {
    start: NORMAL_SPEED_START,
    maxActive: 3,
    spawnInterval: [650, 850],
    speedMultiplier: MID_GAME_SPEED_MULTIPLIER,
    ratios: { support: 45, pressure: 35, danger: 20 },
  },
  {
    start: LATE_GAME_SPEED_START,
    maxActive: 4,
    spawnInterval: [450, 650],
    speedMultiplier: LATE_GAME_SPEED_MULTIPLIER,
    ratios: { support: 40, pressure: 35, danger: 25 },
  },
  {
    start: FINAL_SPEED_START,
    maxActive: 5,
    spawnInterval: [300, 500],
    speedMultiplier: FINAL_SPEED_MULTIPLIER,
    ratios: { support: 40, pressure: 30, danger: 30 },
  },
];
const BG_MUSIC_PATH = "assets/audio/bg-loop.mp3";
const SFX_PATHS = {
  support: "assets/audio/sfx-support.mp3",
  pressure: "assets/audio/sfx-pressure.mp3",
  danger: "assets/audio/sfx-danger.mp3",
  safe: "assets/audio/sfx-safe.mp3",
  gameover: "assets/audio/sfx-gameover.mp3",
};

const homeScreen = document.querySelector("#home-screen");
const instructionsScreen = document.querySelector("#instructions-screen");
const gameScreen = document.querySelector("#game-screen");
const resultScreen = document.querySelector("#result-screen");
const startButton = document.querySelector("#start-button");
const playButton = document.querySelector("#play-button");
const instructionsHomeButton = document.querySelector("#instructions-home-button");
const restartButton = document.querySelector("#restart-button");
const homeButton = document.querySelector("#home-button");
const musicToggle = document.querySelector("#music-toggle");
const soundToggle = document.querySelector("#sound-toggle");
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
const resultBadge = document.querySelector("#result-badge");
const resultDescription = document.querySelector("#result-description");
const lessonList = document.querySelector("#lesson-list");
const finalRisk = document.querySelector("#final-risk");
const roundSummary = document.querySelector("#round-summary");
const challengeTip = document.querySelector("#challenge-tip");
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
    icon: "💚",
    text: "同理心",
    type: "support",
    safetyChange: 10,
    message: "同理可以增加安全。",
  },
  {
    icon: "📘",
    text: "學溝通",
    type: "support",
    safetyChange: 10,
    message: "學習溝通，安全上升。",
  },
  {
    icon: "🚶",
    text: "先離開",
    type: "support",
    safetyChange: 10,
    message: "先離開現場，安全上升。",
  },
  {
    icon: "💭",
    text: "想後果",
    type: "support",
    safetyChange: 10,
    message: "先想後果，安全上升。",
  },
  {
    icon: "💼",
    text: "工作煩",
    type: "pressure",
    safetyChange: -10,
    message: "壓力會干擾安全。",
  },
  {
    icon: "🌙",
    text: "睡不好",
    type: "pressure",
    safetyChange: -10,
    message: "壓力會干擾安全。",
  },
  {
    icon: "😣",
    text: "被誤會",
    type: "pressure",
    safetyChange: -10,
    message: "壓力會干擾安全。",
  },
  {
    icon: "💸",
    text: "錢不夠",
    type: "pressure",
    safetyChange: -10,
    message: "壓力會干擾安全。",
  },
  {
    icon: "⚠️",
    text: "威脅人",
    type: "danger",
    safetyChange: -25,
    message: "危險會大幅拉低安全。",
  },
  {
    icon: "💥",
    text: "砸東西",
    type: "danger",
    safetyChange: -25,
    message: "危險會大幅拉低安全。",
  },
  {
    icon: "✊",
    text: "用拳頭",
    type: "danger",
    safetyChange: -25,
    message: "危險會大幅拉低安全。",
  },
  {
    icon: "🗯️",
    text: "逼道歉",
    type: "danger",
    safetyChange: -25,
    message: "危險會大幅拉低安全。",
  },
];

let timeLeft = GAME_DURATION;
let animationFrameId = null;
let lastFrameTime = null;
let gameStartTime = null;
let nextSpawnAt = null;
let catchLineY = 0;
let catcherBottomY = 0;
let messageTimerId = null;
let supportSlowTimerId = null;
let dangerBasketSlowTimerId = null;
let effectTimerId = null;
let countdownTimerId = null;
let currentLane = "middle";
let basketX = 0;
let basketVelocity = 0;
let basketInputDirection = 0;
let basketPointerId = null;
let stageRect = null;
let basketY = 0;
let safeScore = SAFE_START;
let highestSafeScore = SAFE_START;
let activeItems = [];
let isPlaying = false;
let supportSpawnedInFirstTen = 0;
let earlyDangerStreak = 0;
let avoidedDangerCount = 0;
let supportStreak = 0;
let bestSupportStreak = 0;
let lateSpeedPromptShown = false;
let finalSpeedPromptShown = false;
let bgMusic = null;
let musicEnabled = true;
let musicUnlocked = false;
let soundEnabled = true;
let caughtCounts = {
  pressure: 0,
  danger: 0,
  support: 0,
};

function showScreen(screen) {
  [homeScreen, instructionsScreen, gameScreen, resultScreen].forEach((currentScreen) => {
    const isActive = currentScreen === screen;
    currentScreen.classList.toggle("screen-active", isActive);
    currentScreen.setAttribute("aria-hidden", String(!isActive));
  });
}

function clampSafeScore(value) {
  return Math.min(SAFE_MAX, Math.max(SAFE_MIN, value));
}

function updateTimerDisplay() {
  timeLeftDisplay.textContent = String(timeLeft);
}

function updateSafetyDisplay() {
  riskValue.textContent = `${safeScore} / ${SAFE_MAX}`;
  riskBar.style.width = `${safeScore}%`;

  riskPanel.classList.toggle("safety-low", safeScore < 40);
  riskPanel.classList.toggle("safety-medium", safeScore >= 40 && safeScore < 80);
  riskPanel.classList.toggle("safety-high", safeScore >= 80 && safeScore < SAFE_MAX);
  riskPanel.classList.toggle("safety-complete", safeScore >= SAFE_MAX);
  gameScreen.classList.toggle("safety-near-complete", safeScore >= 80 && safeScore < SAFE_MAX);

  if (safeScore >= 80 && safeScore < SAFE_MAX) {
    setRiskMessage("快滿了，繼續接住支持！");
  } else if (safeScore >= 40) {
    setRiskMessage("接住綠色，累積安全。");
  } else {
    setRiskMessage("安全值上升才會靠近通關。");
  }
}

function resetRoundState() {
  safeScore = SAFE_START;
  highestSafeScore = SAFE_START;
  caughtCounts = {
    pressure: 0,
    danger: 0,
    support: 0,
  };
  avoidedDangerCount = 0;
  supportStreak = 0;
  bestSupportStreak = 0;
  lateSpeedPromptShown = false;
  finalSpeedPromptShown = false;
  supportSpawnedInFirstTen = 0;
  earlyDangerStreak = 0;
  updateSafetyDisplay();
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

function startDangerBasketSlowdown() {
  if (dangerBasketSlowTimerId !== null) {
    clearTimeout(dangerBasketSlowTimerId);
  }

  dangerBasketSlowTimerId = setTimeout(() => {
    dangerBasketSlowTimerId = null;
  }, DANGER_BASKET_SLOW_DURATION);
}

function moveBasket(lane) {
  if (!laneNames[lane]) {
    return;
  }

  currentLane = lane;
  playerBasket.setAttribute("aria-label", `接物籃目前在${laneNames[lane]}軌`);

  laneButtons.forEach((button) => {
    const isActive = button.dataset.lane === lane;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function getBasketWidth() {
  return window.matchMedia("(max-width: 640px)").matches ? BASKET_WIDTH_MOBILE : BASKET_WIDTH_DESKTOP;
}

function refreshStageMetrics() {
  stageRect = laneArea.getBoundingClientRect();
}

function getStageRect() {
  if (!stageRect) {
    refreshStageMetrics();
  }

  return stageRect;
}

function clampBasketX(value) {
  const stageWidth = laneArea.clientWidth || 360;
  return Math.min(stageWidth - getBasketWidth(), Math.max(0, value));
}

function getLaneFromBasketX() {
  const stageWidth = laneArea.clientWidth || 360;
  const basketCenter = basketX + getBasketWidth() / 2;
  const laneIndex = Math.min(lanes.length - 1, Math.max(0, Math.floor((basketCenter / stageWidth) * lanes.length)));
  return lanes[laneIndex];
}

function setBasketX(value) {
  basketX = clampBasketX(value);
  playerBasket.style.transform = `translate3d(${basketX}px, 0, 0)`;
  moveBasket(getLaneFromBasketX());
}

function centerBasket() {
  const stageWidth = laneArea.clientWidth || 360;
  setBasketX((stageWidth - getBasketWidth()) / 2);
}

function setBasketCenterFromClientX(clientX) {
  const rect = getStageRect();
  setBasketX(clientX - rect.left - getBasketWidth() / 2);
}

function updateBasketPosition(deltaTime) {
  const dangerSlowMultiplier = dangerBasketSlowTimerId !== null ? DANGER_BASKET_SLOW_MULTIPLIER : 1;
  basketVelocity = basketInputDirection * BASKET_SPEED * dangerSlowMultiplier;

  if (basketVelocity !== 0) {
    setBasketX(basketX + basketVelocity * deltaTime);
  }
}

function getElapsedSeconds() {
  if (gameStartTime !== null && isPlaying) {
    return Math.min(GAME_DURATION, (performance.now() - gameStartTime) / 1000);
  }

  return GAME_DURATION - timeLeft;
}

function updateCatchLine() {
  refreshStageMetrics();
  const stageHeight = laneArea.clientHeight || laneArea.offsetHeight || 360;
  const catcherHeight = getCatcherHeight();
  catchLineY = Math.max(140, stageHeight - CATCHER_BOTTOM_OFFSET - catcherHeight);
  catcherBottomY = Math.min(stageHeight, catchLineY + catcherHeight);
  basketY = catchLineY;
  setBasketX(basketX);
}

function getMaxActiveItems() {
  return getCurrentDropPhase().maxActive;
}

function getCurrentDropPhase() {
  const elapsedSeconds = getElapsedSeconds();
  let currentPhase = DROP_PHASES[0];

  DROP_PHASES.forEach((phase) => {
    if (elapsedSeconds >= phase.start) {
      currentPhase = phase;
    }
  });

  return currentPhase;
}

function getSpawnInterval() {
  const [minInterval, maxInterval] = getCurrentDropPhase().spawnInterval;
  return minInterval + Math.random() * (maxInterval - minInterval);
}

function getDropRatios() {
  return getCurrentDropPhase().ratios;
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

function getRandomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getDropWidth() {
  return window.matchMedia("(max-width: 640px)").matches ? DROP_WIDTH_MOBILE : DROP_WIDTH_DESKTOP;
}

function getDropHeight() {
  return window.matchMedia("(max-width: 640px)").matches ? DROP_HEIGHT_MOBILE : DROP_HEIGHT_DESKTOP;
}

function getCatcherHeight() {
  return window.matchMedia("(max-width: 640px)").matches ? CATCHER_HEIGHT_MOBILE : CATCHER_HEIGHT_DESKTOP;
}

function canSpawnAt(x, y) {
  const dropWidth = getDropWidth();

  return activeItems.every((drop) => {
    const verticalDistance = Math.abs(drop.y - y);
    const horizontalDistance = Math.abs(drop.x - x);

    if (verticalDistance < MIN_DROP_VERTICAL_GAP) {
      return false;
    }

    if (horizontalDistance < dropWidth + MIN_DROP_HORIZONTAL_GAP) {
      return verticalDistance >= MIN_DROP_NEAR_VERTICAL_GAP;
    }

    return true;
  });
}

function getRandomDropX() {
  const stageWidth = laneArea.clientWidth || 360;
  const dropWidth = getDropWidth();
  const minX = SPAWN_SIDE_PADDING;
  const maxX = Math.max(minX, stageWidth - dropWidth - SPAWN_SIDE_PADDING);

  return getRandomBetween(minX, maxX);
}

function pickSpawnXWithSpacing() {
  for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt += 1) {
    const x = getRandomDropX();

    if (canSpawnAt(x, -SPAWN_OFFSET)) {
      return x;
    }
  }

  return null;
}

function pickDropItem() {
  const elapsedSeconds = getElapsedSeconds();
  let type = pickWeightedType();

  if (
    elapsedSeconds >= FIRST_SUPPORT_FORCE_AFTER &&
    elapsedSeconds < FIRST_SUPPORT_DEADLINE &&
    supportSpawnedInFirstTen < 2
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
    supportSpawnedInFirstTen += 1;
  }

  const pool = dropItems.filter((item) => item.type === type);
  return pickRandom(pool);
}

function createDrop(forcedType = null, speedMultiplier = 1) {
  if (!isPlaying || activeItems.length >= getMaxActiveItems() || !gameScreen.classList.contains("screen-active")) {
    return false;
  }

  let item = null;

  if (forcedType) {
    const pool = dropItems.filter((dropItem) => dropItem.type === forcedType);
    item = pickRandom(pool);
  } else {
    item = pickDropItem();
  }
  const x = pickSpawnXWithSpacing();

  if (x === null) {
    nextSpawnAt = performance.now() + SPAWN_RETRY_DELAY;
    return false;
  }

  const y = -SPAWN_OFFSET;
  const element = document.createElement("div");

  element.className = `drop-card ${item.type}`;
  element.innerHTML = `<span class="drop-icon" aria-hidden="true">${item.icon}</span><span>${item.text}</span>`;
  element.setAttribute("aria-label", item.text);
  element.style.opacity = "0";
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  laneArea.appendChild(element);
  requestAnimationFrame(() => {
    element.style.opacity = "";
    element.classList.add("is-visible");
  });

  activeItems.push({
    item,
    element,
    x,
    y,
    speedMultiplier,
  });

  return true;
}

function maybeCreateDrop(timestamp) {
  if (nextSpawnAt === null) {
    nextSpawnAt = timestamp;
  }

  if (timestamp < nextSpawnAt) {
    return;
  }

  if (activeItems.length < getMaxActiveItems()) {
    if (!createDrop()) {
      nextSpawnAt = timestamp + SPAWN_RETRY_DELAY;
      return;
    }
  }

  nextSpawnAt = timestamp + getSpawnInterval();
}

function getCurrentFallSpeed() {
  const timeMultiplier = getCurrentDropPhase().speedMultiplier;

  let supportSlowMultiplier = 1;
  if (supportSlowTimerId !== null) {
    supportSlowMultiplier = SUPPORT_SLOW_MULTIPLIER;
  }

  return BASE_FALL_SPEED * timeMultiplier * GLOBAL_SPEED_MULTIPLIER * supportSlowMultiplier;
}

function avoidDanger() {
  avoidedDangerCount += 1;
  showItemMessage("避開危險，守住安全。");
}

function applyItemEffect(item) {
  const safeBeforeCatch = safeScore;
  caughtCounts[item.type] += 1;
  safeScore = clampSafeScore(safeScore + item.safetyChange);

  if (item.type === "support") {
    supportStreak += 1;
    bestSupportStreak = Math.max(bestSupportStreak, supportStreak);
  } else {
    supportStreak = 0;
  }

  highestSafeScore = Math.max(highestSafeScore, safeScore);
  updateSafetyDisplay();

  if (item.type === "danger") {
    showTemporaryEffect("danger-flash");
    startDangerBasketSlowdown();
    playSfx("danger");
    showItemMessage("危險拖慢安全。");
  } else if (item.type === "support") {
    showTemporaryEffect("support-flash");
    startSupportSlowdown();
    playSfx("support");

    if (safeScore >= SAFE_MAX) {
      showItemMessage("安全成功接住！");
    } else if (safeScore >= 80 && safeBeforeCatch < 80) {
      showItemMessage("快滿了，繼續接住支持！");
    } else {
      showItemMessage("安全值上升！");
    }
  } else {
    playSfx("pressure");
    showItemMessage("壓力會干擾安全。");
  }

  if (safeScore >= SAFE_MAX) {
    playSfx("safe");
    endGame("complete");
    return;
  }

  if (safeScore <= SAFE_MIN) {
    playSfx("gameover");
    endGame("zero-safety");
  }
}

function removeDrop(drop, wasCaught) {
  activeItems = activeItems.filter((activeItem) => activeItem !== drop);

  if (wasCaught) {
    drop.element.classList.add("is-caught");
    const mouthX = basketX + getBasketWidth() / 2 - getDropWidth() / 2;
    const mouthY = Math.min(basketY + getCatcherHeight() * 0.28, catcherBottomY - getDropHeight() * 0.42);
    playerBasket.classList.add("is-catching");
    drop.element.style.transition = "transform 150ms ease-in, opacity 150ms ease-in";
    drop.element.style.transform = `translate3d(${mouthX}px, ${mouthY}px, 0) scale(0.28)`;
    setTimeout(() => {
      drop.element.remove();
      playerBasket.classList.remove("is-catching");
    }, 180);
    return;
  }

  drop.element.remove();
}

function updateDrops(timestamp) {
  if (!isPlaying || !gameScreen.classList.contains("screen-active")) {
    return;
  }

  if (gameStartTime === null) {
    gameStartTime = timestamp;
  }

  if (lastFrameTime === null) {
    lastFrameTime = timestamp;
  }

  const secondsPassed = Math.min((timestamp - lastFrameTime) / 1000, MAX_DELTA);
  lastFrameTime = timestamp;
  updateBasketPosition(secondsPassed);
  const elapsedSeconds = Math.min(GAME_DURATION, (timestamp - gameStartTime) / 1000);
  const nextTimeLeft = Math.max(0, Math.ceil(GAME_DURATION - elapsedSeconds));

  if (nextTimeLeft !== timeLeft) {
    timeLeft = nextTimeLeft;
    updateTimerDisplay();

    if (timeLeft <= LATE_GAME_PROMPT_TIME_LEFT && !lateSpeedPromptShown) {
      lateSpeedPromptShown = true;
      showItemMessage("節奏加快，穩住選擇。");
    }

    if (timeLeft <= FINAL_SPEED_TIME && !finalSpeedPromptShown) {
      finalSpeedPromptShown = true;
      showItemMessage("最後 15 秒，接住安全！");
    }

    if (timeLeft <= 0) {
      endGame(getTimedResultType());
      return;
    }
  }

  maybeCreateDrop(timestamp);

  [...activeItems].forEach((drop) => {
    if (!isPlaying) {
      return;
    }

    drop.y += getCurrentFallSpeed() * (drop.speedMultiplier || 1) * secondsPassed;
    drop.element.style.transform = `translate3d(${drop.x}px, ${drop.y}px, 0)`;

    const dropLeft = drop.x;
    const dropRight = drop.x + getDropWidth();
    const dropTop = drop.y;
    const dropBottom = drop.y + getDropHeight();
    const basketLeft = basketX;
    const basketRight = basketX + getBasketWidth();
    const basketTop = basketY;
    const basketBottom = catcherBottomY;
    const horizontalOverlap = dropRight >= basketLeft && dropLeft <= basketRight;
    const verticalOverlap = dropBottom >= basketTop && dropTop <= basketBottom;
    const hasPassedCatcher = dropTop > basketBottom;

    if (horizontalOverlap && verticalOverlap) {
      applyItemEffect(drop.item);
      removeDrop(drop, true);
    } else if (hasPassedCatcher) {
      if (drop.item.type === "danger") {
        avoidDanger();
      }

      removeDrop(drop, false);
    }
  });

  if (isPlaying && gameScreen.classList.contains("screen-active")) {
    animationFrameId = requestAnimationFrame(updateDrops);
  }
}

function startTimer() {
  stopTimer();
  isPlaying = true;
  gameStartTime = performance.now();
  lastFrameTime = gameStartTime;
  nextSpawnAt = gameStartTime;
  animationFrameId = requestAnimationFrame(updateDrops);
}

function stopTimer() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  gameStartTime = null;
  lastFrameTime = null;
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
  updateCatchLine();
  nextSpawnAt = performance.now();
}

function stopDropping() {
  nextSpawnAt = null;
}

function clearDrops() {
  activeItems.forEach((drop) => {
    drop.element.remove();
  });
  laneArea.querySelectorAll(".drop-card").forEach((element) => {
    element.remove();
  });
  activeItems = [];
}

function stopBasketInput() {
  basketInputDirection = 0;
  basketVelocity = 0;
  basketPointerId = null;
}

function clearSupportSlowdown() {
  if (supportSlowTimerId !== null) {
    clearTimeout(supportSlowTimerId);
    supportSlowTimerId = null;
  }
}

function clearDangerBasketSlowdown() {
  if (dangerBasketSlowTimerId !== null) {
    clearTimeout(dangerBasketSlowTimerId);
    dangerBasketSlowTimerId = null;
  }
}

function getBgMusic() {
  if (bgMusic !== null) {
    return bgMusic;
  }

  try {
    bgMusic = new Audio(BG_MUSIC_PATH);
    bgMusic.loop = true;
    bgMusic.volume = 0.15;
    bgMusic.preload = "none";
    bgMusic.addEventListener("error", () => {
      musicUnlocked = false;
      musicEnabled = false;
      updateSoundButtons();
    });
  } catch (error) {
    bgMusic = null;
    musicUnlocked = false;
    musicEnabled = false;
    updateSoundButtons();
  }

  return bgMusic;
}

function updateSoundButtons() {
  if (musicToggle) {
    musicToggle.textContent = musicEnabled ? "音樂：開" : "音樂：關";
    musicToggle.setAttribute("aria-pressed", String(musicEnabled));
  }

  if (soundToggle) {
    soundToggle.textContent = soundEnabled ? "音效：開" : "音效：關";
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  }
}

function tryPlayMusic() {
  if (!musicEnabled) {
    return;
  }

  const music = getBgMusic();

  if (!music) {
    musicEnabled = false;
    musicUnlocked = false;
    updateSoundButtons();
    return;
  }

  music.volume = 0.15;
  const playPromise = music.play();

  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(() => {
        musicUnlocked = true;
        updateSoundButtons();
      })
      .catch(() => {
        musicUnlocked = false;
        updateSoundButtons();
      });
  } else {
    musicUnlocked = !music.paused;
    updateSoundButtons();
  }
}

function unlockMusicByUserGesture() {
  const music = getBgMusic();

  if (musicEnabled && music && music.paused) {
    tryPlayMusic();
  }
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  const music = getBgMusic();

  if (!music) {
    musicEnabled = false;
    musicUnlocked = false;
    updateSoundButtons();
    return;
  }

  if (musicEnabled) {
    updateSoundButtons();
    tryPlayMusic();
  } else {
    music.pause();
    musicUnlocked = false;
    updateSoundButtons();
  }
}

function registerMusicUnlockGestures() {
  const handleFirstPointer = (event) => {
    if (event.target instanceof Element && event.target.closest("#music-toggle")) {
      return;
    }

    unlockMusicByUserGesture();
  };

  const handleFirstKey = () => {
    unlockMusicByUserGesture();
  };

  document.addEventListener("pointerdown", handleFirstPointer, { once: true, capture: true });
  document.addEventListener("keydown", handleFirstKey, { once: true, capture: true });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  updateSoundButtons();
}

function playSfx(type) {
  if (!soundEnabled || !SFX_PATHS[type]) {
    return;
  }

  const sfx = new Audio(SFX_PATHS[type]);
  sfx.volume = 0.48;
  sfx.play().catch(() => {});
}

function getRoundSummaryText() {
  const distanceToGoal = Math.max(0, SAFE_MAX - safeScore);

  return [
    { icon: "🟢", label: "綠色支持", value: `${caughtCounts.support} 次` },
    { icon: "🟠", label: "橘色壓力", value: `${caughtCounts.pressure} 次` },
    { icon: "🔴", label: "紅色危險", value: `${caughtCounts.danger} 次` },
    { icon: "🛡️", label: "避開危險", value: `${avoidedDangerCount} 次` },
    { icon: "📈", label: "最高安全值", value: highestSafeScore },
    { icon: "✨", label: "連續支持", value: `${bestSupportStreak} 次` },
    { icon: "🎯", label: "距離通關", value: `${distanceToGoal} 分` },
  ];
}

function getTimedResultType() {
  if (safeScore >= 80) {
    return "near";
  }

  if (safeScore >= 40) {
    return "more-support";
  }

  return "low-safety";
}

function renderResult(resultType) {
  resultScreen.classList.remove(
    "result-complete",
    "result-near",
    "result-more-support",
    "result-low-safety",
    "result-zero-safety",
    "result-safe-zone",
    "result-success",
    "result-steady",
    "result-high-risk",
    "result-crisis"
  );
  resultScreen.classList.add(`result-${resultType}`);

  const resultContent = {
    complete: {
      badge: "通關成功",
      title: "安全成功接住",
      description: "你接住足夠支持，把安全值累積到 100。",
      tip: "下一次挑戰更快累積到 100。",
      button: "再挑戰一次",
    },
    near: {
      badge: "接近通關",
      title: "差一點就接住安全",
      description: "你已經累積不少支持，再多一點就能達成安全。",
      tip: "下一次多接幾張綠色支持。",
      button: "再挑戰一次",
    },
    "more-support": {
      badge: "繼續累積",
      title: "還需要更多支持",
      description: "壓力與危險仍會干擾安全，需要持續接住支持。",
      tip: "下一次先避開紅色危險。",
      button: "再挑戰一次",
    },
    "low-safety": {
      badge: "需要支持",
      title: "安全還沒接住",
      description: "支持不足時，危險更容易靠近，需要更早接住支持。",
      tip: "下一次先鎖定綠色支持。",
      button: "再挑戰一次",
    },
    "zero-safety": {
      badge: "安全歸零",
      title: "安全值歸零",
      description: "安全值降到 0，代表危險已經超過可承受範圍，需要更早接住支持。",
      tip: "下一次先避開紅色危險，接住綠色支持。",
      button: "再挑戰一次",
    },
  };
  const content = resultContent[resultType];

  resultBadge.textContent = content.badge;
  resultTitle.textContent = content.title;
  resultDescription.textContent = content.description;
  resultDescription.hidden = false;
  lessonList.hidden = false;
  restartButton.textContent = content.button;
  finalRisk.textContent = `最後安全值：${safeScore} / ${SAFE_MAX}`;
  roundSummary.innerHTML = getRoundSummaryText()
    .map((item) => `
      <span class="stat-card">
        <b aria-hidden="true">${item.icon}</b>
        <em>${item.value}</em>
        <small>${item.label}</small>
      </span>
    `)
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
  clearDangerBasketSlowdown();
  clearEffectClasses();
  renderResult(resultType);
  showScreen(resultScreen);
}

function resetGameVisuals() {
  gameScreen.classList.remove("risk-elevated", "risk-critical", "safety-near-complete", "danger-flash", "support-flash");
  riskPanel.classList.remove(
    "risk-safe",
    "risk-medium",
    "risk-high",
    "risk-critical",
    "safety-low",
    "safety-medium",
    "safety-high",
    "safety-complete"
  );
  setRiskMessage("");
  clearItemMessage();
  clearEffectClasses();
}

function startGame() {
  unlockMusicByUserGesture();
  isPlaying = false;
  stopBasketInput();
  stopTimer();
  stopDropping();
  clearDrops();
  clearCountdown();
  clearSupportSlowdown();
  clearDangerBasketSlowdown();
  resetGameVisuals();
  resetRoundState();
  timeLeft = GAME_DURATION;
  updateTimerDisplay();
  showScreen(gameScreen);
  updateCatchLine();
  centerBasket();
  startCountdown();
}

function showInstructions() {
  unlockMusicByUserGesture();
  isPlaying = false;
  stopBasketInput();
  stopTimer();
  stopDropping();
  clearDrops();
  clearCountdown();
  clearSupportSlowdown();
  clearDangerBasketSlowdown();
  resetGameVisuals();
  timeLeft = GAME_DURATION;
  updateTimerDisplay();
  showScreen(instructionsScreen);
}

function returnHome() {
  isPlaying = false;
  stopBasketInput();
  stopTimer();
  stopDropping();
  clearDrops();
  clearCountdown();
  clearSupportSlowdown();
  clearDangerBasketSlowdown();
  resetGameVisuals();
  resetRoundState();
  timeLeft = GAME_DURATION;
  updateTimerDisplay();
  centerBasket();
  showScreen(homeScreen);
}

startButton.addEventListener("click", showInstructions);
playButton.addEventListener("click", startGame);
instructionsHomeButton.addEventListener("click", returnHome);
restartButton.addEventListener("click", startGame);
homeButton.addEventListener("click", returnHome);

laneButtons.forEach((button) => {
  const directionByLane = {
    left: -1,
    middle: 0,
    right: 1,
  };

  button.addEventListener("pointerdown", (event) => {
    if (!isPlaying) {
      return;
    }

    event.preventDefault();
    basketInputDirection = directionByLane[button.dataset.lane] || 0;
  });
});

document.addEventListener("pointerup", stopBasketInput);
document.addEventListener("pointercancel", stopBasketInput);

function startBasketPointerDrag(event) {
  if (!isPlaying) {
    return;
  }

  event.preventDefault();
  basketInputDirection = 0;
  basketPointerId = event.pointerId;
  refreshStageMetrics();
  setBasketCenterFromClientX(event.clientX);

  if (laneArea.setPointerCapture) {
    laneArea.setPointerCapture(event.pointerId);
  }
}

function moveBasketPointerDrag(event) {
  if (!isPlaying || basketPointerId !== event.pointerId) {
    return;
  }

  event.preventDefault();
  setBasketCenterFromClientX(event.clientX);
}

function endBasketPointerDrag(event) {
  if (basketPointerId === event.pointerId) {
    if (laneArea.releasePointerCapture && laneArea.hasPointerCapture && laneArea.hasPointerCapture(event.pointerId)) {
      laneArea.releasePointerCapture(event.pointerId);
    }

    basketPointerId = null;
  }
}

laneArea.addEventListener("pointerdown", startBasketPointerDrag);
laneArea.addEventListener("pointermove", moveBasketPointerDrag);
laneArea.addEventListener("pointerup", endBasketPointerDrag);
laneArea.addEventListener("pointercancel", endBasketPointerDrag);

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
    basketInputDirection = directionByKey[key];
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (["arrowleft", "a", "arrowright", "d"].includes(key)) {
    basketInputDirection = 0;
  }
});

window.addEventListener("resize", () => {
  updateCatchLine();
  setBasketX(basketX);
});

window.addEventListener("orientationchange", () => {
  window.setTimeout(() => {
    updateCatchLine();
    setBasketX(basketX);
  }, 120);
});

updateTimerDisplay();
resetRoundState();
centerBasket();
updateSoundButtons();
registerMusicUnlockGestures();
tryPlayMusic();

