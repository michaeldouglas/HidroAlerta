const CSV_FILES = {
  agua_limpa: {
    1: "../Dados/agua_limpa/agua_limpa_teste_1.csv",
    2: "../Dados/agua_limpa/agua_limpa_teste_2.csv",
  },
  agua_pouca_terra: {
    1: "../Dados/1_2_colher_de_cha/agua_pouca_terra_teste_1.csv",
    2: "../Dados/1_2_colher_de_cha/agua_pouca_terra_teste_2.csv",
  },
  agua_media_terra: {
    1: "../Dados/1_colher_de_cha/agua_media_terra_teste_1.csv",
    2: "../Dados/1_colher_de_cha/agua_media_terra_teste_2.csv",
  },
  agua_alta_terra: {
    1: "../Dados/2_colheres_de_cha/agua_alta_terra_teste_1.csv",
    2: "../Dados/2_colheres_de_cha/agua_alta_terra_teste_2.csv",
  },
};

const CONDITION_META = {
  agua_limpa: {
    name: "Água limpa",
    label: "Limpa",
    color: "#39d98a",
    water: "linear-gradient(180deg, rgba(85, 215, 238, 0.86), rgba(32, 138, 182, 0.9))",
    particles: 0.1,
    level: 0,
  },
  agua_pouca_terra: {
    name: "Pouca terra",
    label: "Pouca turbidez",
    color: "#f5b84b",
    water: "linear-gradient(180deg, rgba(108, 190, 207, 0.82), rgba(91, 139, 129, 0.92))",
    particles: 0.28,
    level: 1,
  },
  agua_media_terra: {
    name: "Média terra",
    label: "Turbidez média",
    color: "#f07d3f",
    water: "linear-gradient(180deg, rgba(135, 157, 132, 0.82), rgba(112, 96, 65, 0.95))",
    particles: 0.48,
    level: 2,
  },
  agua_alta_terra: {
    name: "Alta terra",
    label: "Alta turbidez / suja",
    color: "#e94f64",
    water: "linear-gradient(180deg, rgba(128, 111, 78, 0.86), rgba(87, 60, 35, 0.98))",
    particles: 0.72,
    level: 3,
  },
};

const state = {
  rows: [],
  index: 0,
  timer: null,
  playing: true,
  faucetOn: true,
  history: [],
  currentCondition: "agua_limpa",
  currentTest: "1",
};

const els = {
  scene: document.querySelector("#scene"),
  water: document.querySelector("#water"),
  particles: document.querySelector("#particles"),
  sensorProbe: document.querySelector("#sensorProbe"),
  sampleSelect: document.querySelector("#sampleSelect"),
  testSelect: document.querySelector("#testSelect"),
  speedRange: document.querySelector("#speedRange"),
  playPause: document.querySelector("#playPause"),
  resetView: document.querySelector("#resetView"),
  focusTank: document.querySelector("#focusTank"),
  enterHouse: document.querySelector("#enterHouse"),
  toggleFaucet: document.querySelector("#toggleFaucet"),
  conditionName: document.querySelector("#conditionName"),
  qualityBadge: document.querySelector("#qualityBadge"),
  readingValue: document.querySelector("#readingValue"),
  timeValue: document.querySelector("#timeValue"),
  adcValue: document.querySelector("#adcValue"),
  voltageValue: document.querySelector("#voltageValue"),
  minMaxValue: document.querySelector("#minMaxValue"),
  amplitudeValue: document.querySelector("#amplitudeValue"),
  fileName: document.querySelector("#fileName"),
  eventLog: document.querySelector("#eventLog"),
  chart: document.querySelector("#signalChart"),
};

const chartContext = els.chart.getContext("2d");
const LOCAL_SERVER_URL = "http://127.0.0.1:8765/Simulador/index.html";

function parseCsvLine(line) {
  const cleaned = line.trim().replace(/^"|"$/g, "");
  return cleaned.split(",");
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(header.map((key, index) => [key, values[index]]));
    return {
      leitura: Number(row.leitura),
      tempo_ms: Number(row.tempo_ms),
      amostra: row.amostra,
      adc_medio: Number(row.adc_medio),
      adc_menor: Number(row.adc_menor),
      adc_maior: Number(row.adc_maior),
      tensao_media_v: Number(row.tensao_media_v),
    };
  });
}

async function loadSelectedCsv() {
  const condition = els.sampleSelect.value;
  const test = els.testSelect.value;
  const path = CSV_FILES[condition][test];

  clearInterval(state.timer);
  state.currentCondition = condition;
  state.currentTest = test;
  state.index = 0;
  state.history = [];
  els.fileName.textContent = path.replace("../", "");

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    state.rows = parseCsv(await response.text());
    applyConditionVisual(condition);
    addLog(`CSV carregado: ${path.replace("../", "")}`);
    tick();
    schedule();
  } catch (error) {
    const hint = window.location.protocol === "file:"
      ? `Você abriu o HTML como arquivo. Use ${LOCAL_SERVER_URL}`
      : `Confira se a página foi aberta pela raiz do servidor local: ${LOCAL_SERVER_URL}`;
    addLog(`Não consegui carregar o CSV. ${hint}. Erro: ${error.message}`);
    state.rows = [];
    drawChart();
  }
}

function schedule() {
  clearInterval(state.timer);
  if (!state.playing) return;
  const delay = Number(els.speedRange.value);
  state.timer = setInterval(tick, delay);
}

function tick() {
  if (!state.rows.length) return;
  const row = state.rows[state.index];
  state.index = (state.index + 1) % state.rows.length;
  state.history.push(row.adc_medio);
  if (state.history.length > 64) state.history.shift();
  updateTelemetry(row);
  drawChart();
}

function updateTelemetry(row) {
  const amplitude = row.adc_maior - row.adc_menor;
  els.readingValue.textContent = row.leitura;
  els.timeValue.textContent = `${(row.tempo_ms / 1000).toFixed(1)} s`;
  els.adcValue.textContent = row.adc_medio.toLocaleString("pt-BR");
  els.voltageValue.textContent = `${row.tensao_media_v.toFixed(3)} V`;
  els.minMaxValue.textContent = `${row.adc_menor} / ${row.adc_maior}`;
  els.amplitudeValue.textContent = amplitude.toLocaleString("pt-BR");

  const blink = 0.85 + Math.min(amplitude / 2600, 1) * 0.55;
  els.sensorProbe.style.transform = `scale(${blink})`;
}

function applyConditionVisual(condition) {
  const meta = CONDITION_META[condition];
  els.conditionName.textContent = meta.name;
  els.qualityBadge.textContent = meta.label;
  els.qualityBadge.style.background = meta.color;
  els.water.style.background = meta.water;
  els.particles.style.opacity = meta.particles;
  els.scene.style.setProperty("--condition-color", meta.color);
  document.documentElement.style.setProperty("--condition-color", meta.color);

  const waterHeight = 72 - meta.level * 2;
  els.water.style.height = `${waterHeight}%`;
}

function drawChart() {
  const { width, height } = els.chart;
  chartContext.clearRect(0, 0, width, height);

  chartContext.fillStyle = "#081019";
  chartContext.fillRect(0, 0, width, height);

  chartContext.strokeStyle = "rgba(255,255,255,0.08)";
  chartContext.lineWidth = 1;
  for (let y = 28; y < height; y += 32) {
    chartContext.beginPath();
    chartContext.moveTo(0, y);
    chartContext.lineTo(width, y);
    chartContext.stroke();
  }

  if (state.history.length < 2) return;

  const min = Math.min(...state.history, 520);
  const max = Math.max(...state.history, 760);
  const range = Math.max(max - min, 1);
  const color = CONDITION_META[state.currentCondition].color;

  chartContext.strokeStyle = color;
  chartContext.lineWidth = 3;
  chartContext.beginPath();
  state.history.forEach((value, index) => {
    const x = (index / (state.history.length - 1)) * (width - 24) + 12;
    const y = height - 18 - ((value - min) / range) * (height - 38);
    if (index === 0) chartContext.moveTo(x, y);
    else chartContext.lineTo(x, y);
  });
  chartContext.stroke();

  chartContext.fillStyle = "rgba(255,255,255,0.72)";
  chartContext.font = "12px Segoe UI, Arial";
  chartContext.fillText(`ADC ${state.history[state.history.length - 1] ?? "-"}`, 14, 20);
}

function addLog(message) {
  const item = document.createElement("p");
  item.textContent = `${new Date().toLocaleTimeString("pt-BR")} · ${message}`;
  els.eventLog.prepend(item);
  while (els.eventLog.children.length > 6) {
    els.eventLog.lastElementChild.remove();
  }
}

function setFocus(focus) {
  els.scene.dataset.focus = "overview";
  addLog("Visão geral da simulação.");
}

function toggleFaucet() {
  state.faucetOn = true;
  els.scene.classList.add("faucet-on");
  els.toggleFaucet.textContent = "Água corrente";
  addLog("Fluxo contínuo da caixa d'água ativo.");
}

els.sampleSelect.addEventListener("change", loadSelectedCsv);
els.testSelect.addEventListener("change", loadSelectedCsv);
els.speedRange.addEventListener("input", schedule);
els.playPause.addEventListener("click", () => {
  state.playing = !state.playing;
  els.playPause.textContent = state.playing ? "Pausar dados" : "Retomar dados";
  addLog(state.playing ? "Telemetria retomada." : "Telemetria pausada.");
  schedule();
});
els.scene.classList.add("faucet-on");
els.toggleFaucet.textContent = "Água corrente";
els.resetView.addEventListener("click", () => setFocus("overview"));

loadSelectedCsv();
