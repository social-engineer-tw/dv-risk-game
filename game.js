const GAME_DURATION = 60;
const RISK_START = 50;
const RISK_MIN = 0;
const RISK_MAX = 100;
const BASE_FALL_SPEED = 96;
const MAX_DELTA = 0.033;
const SPAWN_OFFSET = 56;
const DROP_WIDTH_DESKTOP = 138;
const DROP_WIDTH_MOBILE = 112;
const DROP_HEIGHT_DESKTOP = 58;
const DROP_HEIGHT_MOBILE = 52;
const CATCHER_HEIGHT_DESKTOP = 78;
const CATCHER_HEIGHT_MOBILE = 70;
const CATCHER_BOTTOM_OFFSET = 18;
const EARLY_GAME_SPEED_MULTIPLIER = 0.85;
const NORMAL_SPEED_START = 10;
const LATE_GAME_SPEED_START = 25;
const FINAL_SPEED_START = 45;
const LATE_GAME_PROMPT_TIME_LEFT = 35;
const LATE_GAME_SPEED_MULTIPLIER = 1.25;
const FINAL_SPEED_TIME = 15;
const FINAL_SPEED_MULTIPLIER = 1.5;
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
const BG_MUSIC_PATH = "assets/audio/bg-loop.mp3";
const SFX_PATHS = {
  support: "assets/audio/sfx-support.mp3",
  pressure: "assets/audio/sfx-pressure.mp3",
  danger: "assets/audio/sfx-danger.mp3",
  safe: "assets/audio/sfx-safe.mp3",
  gameover: "assets/audio/sfx-gameover.mp3",
};

const homeScreen = document.querySelector("#home-screen");
const gameScreen = document.querySelector("#game-screen");
const resultScreen = document.querySelector("#result-screen");
const startButton = document.querySelector("#start-button");
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
let animationFrameId = null;
let lastFrameTime = null;
let gameStartTime = null;
let nextSpawnAt = null;
let catchLineY = 0;
let catcherBottomY = 0;
let messageTimerId = null;
let supportSlowTimerId = null;
let effectTimerId = null;
let countdownTimerId = null;
let currentLane = "middle";
let risk = RISK_START;
let highestRisk = RISK_START;
let activeItems = [];
let isPlaying = false;
let supportSpawnedInFirstTen = false;
let earlyDangerStreak = 0;
let lastSpawnLane = null;
let sameLaneStreak = 0;
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
  lateSpeedPromptShown = false;
  finalSpeedPromptShown = false;
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
  if (gameStartTime !== null && isPlaying) {
    return Math.min(GAME_DURATION, (performance.now() - gameStartTime) / 1000);
  }

  return GAME_DURATION - timeLeft;
}

function updateCatchLine() {
  const stageHeight = laneArea.clientHeight || laneArea.offsetHeight || 360;
  const catcherHeight = getCatcherHeight();
  catchLineY = Math.max(140, stageHeight - CATCHER_BOTTOM_OFFSET - catcherHeight);
  catcherBottomY = Math.min(stageHeight, catchLineY + catcherHeight);
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

function getDropWidth() {
  return window.matchMedia("(max-width: 640px)").matches ? DROP_WIDTH_MOBILE : DROP_WIDTH_DESKTOP;
}

function getDropHeight() {
  return window.matchMedia("(max-width: 640px)").matches ? DROP_HEIGHT_MOBILE : DROP_HEIGHT_DESKTOP;
}

function getCatcherHeight() {
  return window.matchMedia("(max-width: 640px)").matches ? CATCHER_HEIGHT_MOBILE : CATCHER_HEIGHT_DESKTOP;
}

function getLaneX(lane) {
  const laneIndex = lanes.indexOf(lane);
  const stageWidth = laneArea.clientWidth || 360;
  const laneWidth = stageWidth / lanes.length;

  return laneWidth * laneIndex + laneWidth / 2 - getDropWidth() / 2;
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
  if (!isPlaying || activeItems.length >= getMaxActiveItems() || !gameScreen.classList.contains("screen-active")) {
    return;
  }

  const item = pickDropItem();
  const lane = pickSpawnLane();
  const x = getLaneX(lane);
  const y = -SPAWN_OFFSET;
  const element = document.createElement("div");

  element.className = `drop-card ${item.type} lane-${lane}`;
  element.innerHTML = `<span class="drop-icon" aria-hidden="true">${item.icon}</span><span>${item.text}</span>`;
  element.setAttribute("aria-label", `${item.text}，${laneNames[lane]}軌`);
  element.style.opacity = "0";
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  laneArea.appendChild(element);
  requestAnimationFrame(() => {
    element.style.opacity = "";
    element.classList.add("is-visible");
  });

  activeItems.push({
    item,
    lane,
    element,
    x,
    y,
  });
}

function maybeCreateDrop(timestamp) {
  if (nextSpawnAt === null) {
    nextSpawnAt = timestamp;
  }

  if (timestamp < nextSpawnAt) {
    return;
  }

  if (activeItems.length < getMaxActiveItems()) {
    createDrop();
  }

  nextSpawnAt = timestamp + SPAWN_INTERVAL;
}

function getCurrentFallSpeed() {
  const elapsedSeconds = getElapsedSeconds();
  let timeMultiplier = 1;

  if (elapsedSeconds < NORMAL_SPEED_START) {
    timeMultiplier = EARLY_GAME_SPEED_MULTIPLIER;
  } else if (elapsedSeconds < LATE_GAME_SPEED_START) {
    timeMultiplier = 1;
  } else if (elapsedSeconds < FINAL_SPEED_START) {
    timeMultiplier = LATE_GAME_SPEED_MULTIPLIER;
  } else {
    timeMultiplier = FINAL_SPEED_MULTIPLIER;
  }

  let riskMultiplier = 1;
  if (risk >= 90) {
    riskMultiplier = CRITICAL_RISK_SPEED_MULTIPLIER;
  } else if (risk >= 70) {
    riskMultiplier = HIGH_RISK_SPEED_MULTIPLIER;
  }

  let supportSlowMultiplier = 1;
  if (supportSlowTimerId !== null) {
    supportSlowMultiplier = SUPPORT_SLOW_MULTIPLIER;
  }

  return BASE_FALL_SPEED * timeMultiplier * riskMultiplier * supportSlowMultiplier;
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
    playSfx("danger");
    showItemMessage("危險選擇，風險快速上升。");
  } else if (item.type === "support") {
    showTemporaryEffect("support-flash");
    startSupportSlowdown();
    playSfx("support");

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
    playSfx("pressure");
    showItemMessage("壓力累積，風險上升。");
  }

  if (risk >= RISK_MAX) {
    playSfx("gameover");
    endGame("crisis");
  } else if (risk <= RISK_MIN) {
    playSfx("safe");
    endGame("safe-zone");
  }
}

function removeDrop(drop, wasCaught) {
  activeItems = activeItems.filter((activeItem) => activeItem !== drop);

  if (wasCaught) {
    drop.element.classList.add("is-caught");
    const mouthY = Math.min(catchLineY + getCatcherHeight() * 0.28, catcherBottomY - getDropHeight() * 0.42);
    playerBasket.classList.add("is-catching");
    drop.element.style.transition = "transform 150ms ease-in, opacity 150ms ease-in";
    drop.element.style.transform = `translate3d(${drop.x}px, ${mouthY}px, 0) scale(0.28)`;
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
      showItemMessage("最後 15 秒，守住風險！");
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

    drop.y += getCurrentFallSpeed() * secondsPassed;
    drop.element.style.transform = `translate3d(${drop.x}px, ${drop.y}px, 0)`;

    const dropBottom = drop.y + getDropHeight();
    const overlapsCatcher = dropBottom >= catchLineY && drop.y <= catcherBottomY;
    const hasPassedCatcher = drop.y > catcherBottomY;

    if (drop.lane === currentLane && overlapsCatcher) {
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

function clearSupportSlowdown() {
  if (supportSlowTimerId !== null) {
    clearTimeout(supportSlowTimerId);
    supportSlowTimerId = null;
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
  return [
    { icon: "🟠", label: "壓力", value: `${caughtCounts.pressure} 次` },
    { icon: "🔴", label: "危險", value: `${caughtCounts.danger} 次` },
    { icon: "🟢", label: "支持", value: `${caughtCounts.support} 次` },
    { icon: "🛡️", label: "避開危險", value: `${avoidedDangerCount} 次` },
    { icon: "📈", label: "最高風險", value: highestRisk },
    { icon: "✨", label: "支持連擊", value: `${bestSupportStreak} 次` },
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
  resultScreen.classList.remove(
    "result-safe-zone",
    "result-success",
    "result-steady",
    "result-high-risk",
    "result-crisis"
  );
  resultScreen.classList.add(`result-${resultType}`);

  const resultContent = {
    "safe-zone": {
      badge: "任務完成",
      title: "風險降到安全區",
      description: "你接住了足夠的支持，讓風險降回安全區。",
      tip: "下一次挑戰更快降到 0。",
      button: "再挑戰一次",
    },
    crisis: {
      badge: "安全警示",
      title: "安全危機發生",
      description: "風險超過 100。危險選擇讓危機快速升高，需要更早被停下來。",
      tip: "下一次先避開紅色危險。",
      button: "再挑戰一次",
    },
    success: {
      badge: "任務達成",
      title: "成功守住",
      description: "你把風險維持在安全線附近，讓危機沒有擴大。",
      tip: "下一次試著讓風險歸零。",
      button: "再挑戰一次",
    },
    steady: {
      badge: "任務回顧",
      title: "再接再厲",
      description: "你撐過了 60 秒，但風險還能再往安全區推進。",
      tip: "下一次把風險降到 20 以下。",
      button: "再挑戰一次",
    },
    "high-risk": {
      badge: "高風險",
      title: "高風險未解除",
      description: "你撐到最後，但風險仍然偏高。越接近危機，越需要避開危險、接住支持。",
      tip: "下一次多接綠色、少碰紅色。",
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
  finalRisk.textContent = `最後風險：${risk} / ${RISK_MAX}`;
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
  unlockMusicByUserGesture();
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
musicToggle.addEventListener("click", toggleMusic);
soundToggle.addEventListener("click", toggleSound);

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

window.addEventListener("resize", updateCatchLine);

updateTimerDisplay();
resetRoundState();
moveBasket(currentLane);
updateSoundButtons();
registerMusicUnlockGestures();
tryPlayMusic();
