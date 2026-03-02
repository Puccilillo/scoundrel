const fs = require("fs");
const path = require("path");

const CONFIG = {
  apiBase: "http://127.0.0.1:7860",
  outputDir: "./art",
  logDir: "./output",
  promptDumpDir: "./output/prompts",
  settingsDumpDir: "./output/settings",
  retries: 3,
  retryDelayMs: 1500,
  requestTimeoutMs: 180000,
  overwriteArt: true,
  startFromCardId: "",
  limitCards: 0,
  suitFilter: [],
  commonLoras: [],
  iconLoras: [],
  figureLoras: [],
  sweep: {
    enabled: true,
    randomCard: true,
    cardId: "",
    checkpoints: [
      "3D3DCharacterFigurine_v10",
      "clarity_3",
      "doomerBoomer_v10",
      "fantassifiedIcons_fantassifiedIconsV20",
      "rpg_v5",
      "v1-5-pruned-emaonly"
    ],
    loras: [
      { name: "CreaturesDesignV1", weight: 0.8 },
      { name: "dnd_portrait", weight: 0.8 },
      { name: "fantasy_monsters", weight: 0.8 },
      { name: "OldSchoolDnD-10", weight: 0.8 }
    ],
    outputDir: "./output/sweeps"
  },
  defaults: {
    batchSize: 1,
    nIter: 1,
    negativePrompt:
      "photorealistic, realistic photo, cinematic scene, complex background, scenery, environment, landscape, text, letters, watermark, logo, border, frame, blurry, low quality"
  },
  profiles: {
    icons: {
      model: "fantassifiedIcons_fantassifiedIconsV20",
      steps: 30,
      width: 512,
      height: 768,
      cfgScale: 6.5,
      sampler: "DPM++ 2M Karras"
    },
    figures: {
      model: "3D3DCharacterFigurine_v10",
      steps: 24,
      width: 640,
      height: 960,
      cfgScale: 6,
      sampler: "DPM++ 2M Karras"
    }
  }
};

function normalizeText(value) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function buildLoraTokens(loras) {
  return (Array.isArray(loras) ? loras : [])
    .filter((item) => item && item.name)
    .map((item) => `<lora:${String(item.name).trim()}:${Number.isFinite(Number(item.weight)) ? Number(item.weight) : 0.8}>`);
}

function appendTokensToPrompt(prompt, tokens) {
  if (!tokens.length) {
    return prompt;
  }

  const uniqueTokens = tokens.filter((token, index) => tokens.indexOf(token) === index);
  const missingTokens = uniqueTokens.filter((token) => !prompt.includes(token));
  if (!missingTokens.length) {
    return prompt;
  }

  return `${prompt}\n\n${missingTokens.join(" ")}`;
}

function hashSeed(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }

  const normalized = Math.abs(hash);
  return (normalized % 2147483646) + 1;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runId() {
  return new Date().toISOString().replace(/[.:]/g, "-");
}

function sanitizeFileSegment(value) {
  const cleaned = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleaned || "item";
}

function pickRandomCard(cards) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * cards.length);
  return cards[index] || null;
}

function normalizeLoraEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const name = String(entry.name || "").trim();
  if (!name) {
    return null;
  }

  return {
    name,
    weight: Number.isFinite(Number(entry.weight)) ? Number(entry.weight) : 0.8
  };
}

async function getFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }

  const nodeFetch = await import("node-fetch");
  return nodeFetch.default;
}

function loadSuitStyles() {
  return {
    base: normalizeText(fs.readFileSync("./style/base.txt", "utf8")).trim(),
    hearts: normalizeText(fs.readFileSync("./style/hearts.txt", "utf8")).trim(),
    diamonds: normalizeText(fs.readFileSync("./style/diamonds.txt", "utf8")).trim(),
    spades: normalizeText(fs.readFileSync("./style/spades.txt", "utf8")).trim(),
    clubs: normalizeText(fs.readFileSync("./style/clubs.txt", "utf8")).trim()
  };
}

function loadDeck() {
  const raw = fs.readFileSync("./data/deck.json", "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Deck must be a JSON array in ./data/deck.json");
  }

  return parsed;
}

function validateCard(card, index, suitStyles) {
  if (!card || typeof card !== "object") {
    throw new Error(`Invalid card at index ${index}: expected object.`);
  }

  if (!card.id || typeof card.id !== "string") {
    throw new Error(`Invalid card at index ${index}: missing string id.`);
  }

  if (!card.suit || !suitStyles[card.suit]) {
    throw new Error(`Invalid card ${card.id}: unknown suit '${card.suit}'.`);
  }

  if (!Number.isInteger(card.rank) || card.rank < 2 || card.rank > 14) {
    throw new Error(`Invalid card ${card.id}: rank must be an integer between 2 and 14.`);
  }

  if (!card.subject || typeof card.subject !== "string") {
    throw new Error(`Invalid card ${card.id}: missing subject.`);
  }
}

function selectProfile(card) {
  if (card.type === "potion" || card.type === "weapon") {
    return { ...CONFIG.profiles.icons, name: "icons" };
  }

  return { ...CONFIG.profiles.figures, name: "figures" };
}

function buildPrompt(card, suitStyles) {
  const subjectText =
    typeof card.prompt === "string" && card.prompt.trim()
      ? normalizeText(card.prompt).trim()
      : normalizeText(card.subject).trim();

  const outputDirective =
    "output target: isolated game asset only, single centered subject, transparent background, no card template, no border, no text";

  return normalizeText([
    suitStyles.base,
    suitStyles[card.suit],
    outputDirective,
    subjectText
  ].filter(Boolean).join("\n\n"));
}

async function requestImage(doFetch, apiBase, payload, retries, retryDelayMs, requestTimeoutMs) {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    let timeoutId = null;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

      const response = await doFetch(`${apiBase}/sdapi/v1/txt2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorBody}`);
      }

      const data = await response.json();
      if (!data.images || !data.images.length) {
        throw new Error("No images returned by txt2img response.");
      }

      return data;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        console.warn(`Attempt ${attempt}/${retries} failed. Retrying in ${retryDelayMs}ms...`);
        await sleep(retryDelayMs);
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  throw lastError;
}

async function runSingleCardSweep(doFetch, card, suitStyles) {
  const profile = selectProfile(card);
  const basePrompt = buildPrompt(card, suitStyles);
  const seed = Number.isFinite(Number(card.seed)) ? Number(card.seed) : hashSeed(card.id);
  const negativePrompt =
    typeof card.negative_prompt === "string" && card.negative_prompt.trim()
      ? card.negative_prompt
      : CONFIG.defaults.negativePrompt;

  const checkpoints = (Array.isArray(CONFIG.sweep && CONFIG.sweep.checkpoints) ? CONFIG.sweep.checkpoints : [])
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  if (!checkpoints.length) {
    throw new Error("Sweep requires at least one checkpoint in CONFIG.sweep.checkpoints.");
  }

  const loras = (Array.isArray(CONFIG.sweep && CONFIG.sweep.loras) ? CONFIG.sweep.loras : [])
    .map(normalizeLoraEntry)
    .filter(Boolean);

  const sweepOutputDir = String((CONFIG.sweep && CONFIG.sweep.outputDir) || "./output/sweeps").trim() || "./output/sweeps";
  const sweepPromptDir = path.join(sweepOutputDir, "prompts");
  const sweepSettingsDir = path.join(sweepOutputDir, "settings");
  fs.mkdirSync(sweepOutputDir, { recursive: true });
  fs.mkdirSync(sweepPromptDir, { recursive: true });
  fs.mkdirSync(sweepSettingsDir, { recursive: true });

  const jobs = [];
  for (const checkpoint of checkpoints) {
    jobs.push({ checkpoint, lora: null });
    for (const lora of loras) {
      jobs.push({ checkpoint, lora });
    }
  }

  const logFile = path.join(sweepOutputDir, `sweep-${card.id}-${runId()}.jsonl`);
  console.log(`Sweep card: ${card.id}`);
  console.log(`Sweep combinations: ${jobs.length} (${checkpoints.length} checkpoints x (1 + ${loras.length} loras))`);

  for (let index = 0; index < jobs.length; index += 1) {
    const job = jobs[index];
    const loraTokens = job.lora ? buildLoraTokens([job.lora]) : [];
    const promptWithLora = appendTokensToPrompt(basePrompt, loraTokens);

    const checkpointTag = sanitizeFileSegment(job.checkpoint);
    const loraTag = job.lora ? sanitizeFileSegment(job.lora.name) : "no_lora";
    const fileStem = `${card.id}__${checkpointTag}__${loraTag}`;
    const outPath = path.join(sweepOutputDir, `${fileStem}.png`);

    const payload = {
      steps: profile.steps,
      width: profile.width,
      height: profile.height,
      cfg_scale: profile.cfgScale,
      sampler_name: profile.sampler,
      prompt: promptWithLora,
      negative_prompt: negativePrompt,
      seed,
      batch_size: CONFIG.defaults.batchSize,
      n_iter: CONFIG.defaults.nIter,
      override_settings: {
        sd_model_checkpoint: job.checkpoint
      },
      override_settings_restore_afterwards: true
    };

    fs.writeFileSync(path.join(sweepPromptDir, `${fileStem}.prompt.txt`), `${promptWithLora}\n`, "utf8");
    fs.writeFileSync(
      path.join(sweepSettingsDir, `${fileStem}.settings.json`),
      JSON.stringify(
        {
          cardId: card.id,
          suit: card.suit,
          rank: card.rank,
          type: card.type || null,
          baseProfile: profile.name,
          sweepCheckpoint: job.checkpoint,
          sweepLora: job.lora,
          payload,
          generatedAt: new Date().toISOString()
        },
        null,
        2
      ),
      "utf8"
    );

    const startedAt = new Date().toISOString();
    console.log(`Sweep ${index + 1}/${jobs.length}: checkpoint='${job.checkpoint}' lora='${job.lora ? job.lora.name : "none"}'`);

    try {
      const data = await requestImage(
        doFetch,
        CONFIG.apiBase,
        payload,
        CONFIG.retries,
        CONFIG.retryDelayMs,
        CONFIG.requestTimeoutMs
      );
      fs.writeFileSync(outPath, Buffer.from(data.images[0], "base64"));

      fs.appendFileSync(
        logFile,
        `${JSON.stringify({
          cardId: card.id,
          status: "generated",
          outPath,
          startedAt,
          finishedAt: new Date().toISOString(),
          seed,
          checkpoint: job.checkpoint,
          lora: job.lora,
          parameters: data.parameters || payload,
          info: data.info || null
        })}\n`,
        "utf8"
      );
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      fs.appendFileSync(
        logFile,
        `${JSON.stringify({
          cardId: card.id,
          status: "failed",
          outPath,
          startedAt,
          finishedAt: new Date().toISOString(),
          seed,
          checkpoint: job.checkpoint,
          lora: job.lora,
          error: message
        })}\n`,
        "utf8"
      );
      console.error(`Sweep failed for ${fileStem}: ${message}`);
    }
  }

  console.log("Sweep generation completed.");
}

async function main() {
  const doFetch = await getFetch();
  const suitStyles = loadSuitStyles();
  const deck = loadDeck();

  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  fs.mkdirSync(CONFIG.logDir, { recursive: true });
  fs.mkdirSync(CONFIG.promptDumpDir, { recursive: true });
  fs.mkdirSync(CONFIG.settingsDumpDir, { recursive: true });

  const suitFilter = Array.isArray(CONFIG.suitFilter) && CONFIG.suitFilter.length
    ? new Set(CONFIG.suitFilter.map((value) => String(value).trim().toLowerCase()).filter(Boolean))
    : null;

  const selectedDeck = suitFilter
    ? deck.filter((card) => suitFilter.has(card.suit))
    : deck;

  if (!selectedDeck.length) {
    throw new Error("No cards selected. Check CONFIG.suitFilter values (hearts, diamonds, spades, clubs).\n");
  }

  if (CONFIG.sweep && CONFIG.sweep.enabled) {
    const useRandomCard = Boolean(CONFIG.sweep.randomCard);
    const sweepCardId = String(CONFIG.sweep.cardId || "").trim();

    let sweepCard = null;
    if (useRandomCard) {
      sweepCard = pickRandomCard(deck);
      if (!sweepCard) {
        throw new Error("Sweep mode randomCard failed: deck is empty.");
      }
      console.log(`Sweep random card selected: ${sweepCard.id}`);
    } else {
      if (!sweepCardId) {
        throw new Error("Sweep mode is enabled but CONFIG.sweep.cardId is empty.");
      }

      sweepCard = selectedDeck.find((card) => card.id === sweepCardId);
      if (!sweepCard) {
        throw new Error(`Sweep card '${sweepCardId}' not found in selected cards.`);
      }
    }

    validateCard(sweepCard, 0, suitStyles);
    await runSingleCardSweep(doFetch, sweepCard, suitStyles);
    return;
  }

  let startFrom = CONFIG.startFromCardId || "";
  if (startFrom && !selectedDeck.some((card) => card.id === startFrom)) {
    console.warn(`startFromCardId '${startFrom}' not found in selected cards. Starting from first selected card.`);
    startFrom = "";
  }

  const targetTotal = CONFIG.limitCards > 0 ? Math.min(CONFIG.limitCards, selectedDeck.length) : selectedDeck.length;
  const logFile = path.join(CONFIG.logDir, `generate-art-${runId()}.jsonl`);

  console.log(`Deck size: ${deck.length}`);
  console.log(`Selected cards: ${selectedDeck.length}`);
  console.log(`Target cards this run: ${targetTotal}`);
  console.log(`API base: ${CONFIG.apiBase}`);

  let started = !startFrom;
  let processed = 0;

  for (let i = 0; i < selectedDeck.length; i += 1) {
    if (CONFIG.limitCards > 0 && processed >= CONFIG.limitCards) {
      break;
    }

    const card = selectedDeck[i];
    validateCard(card, i, suitStyles);

    if (!started) {
      if (card.id === startFrom) {
        started = true;
      } else {
        continue;
      }
    }

    const outPath = path.join(CONFIG.outputDir, `${card.id}.png`);
    if (!CONFIG.overwriteArt && fs.existsSync(outPath)) {
      console.log(`Skipped (exists): ${card.id}`);
      fs.appendFileSync(logFile, `${JSON.stringify({ cardId: card.id, status: "skipped_exists", outPath })}\n`, "utf8");
      continue;
    }

    const profile = selectProfile(card);
    const basePrompt = buildPrompt(card, suitStyles);

    const perCardLoras = Array.isArray(card.loras)
      ? card.loras
          .map((entry) => ({
            name: String(entry && entry.name ? entry.name : "").trim(),
            weight: Number.isFinite(Number(entry && entry.weight)) ? Number(entry.weight) : 0.8
          }))
          .filter((entry) => entry.name)
      : [];

    const profileLoras = profile.name === "icons" ? CONFIG.iconLoras : CONFIG.figureLoras;
    const promptWithLoras = appendTokensToPrompt(
      basePrompt,
      buildLoraTokens([...CONFIG.commonLoras, ...profileLoras, ...perCardLoras])
    );

    const seed = Number.isFinite(Number(card.seed)) ? Number(card.seed) : hashSeed(card.id);
    const negativePrompt =
      typeof card.negative_prompt === "string" && card.negative_prompt.trim()
        ? card.negative_prompt
        : CONFIG.defaults.negativePrompt;

    const payload = {
      steps: profile.steps,
      width: profile.width,
      height: profile.height,
      cfg_scale: profile.cfgScale,
      sampler_name: profile.sampler,
      prompt: promptWithLoras,
      negative_prompt: negativePrompt,
      seed,
      batch_size: CONFIG.defaults.batchSize,
      n_iter: CONFIG.defaults.nIter,
      override_settings: {
        sd_model_checkpoint: profile.model
      },
      override_settings_restore_afterwards: true
    };

    fs.writeFileSync(path.join(CONFIG.promptDumpDir, `${card.id}.prompt.txt`), `${promptWithLoras}\n`, "utf8");
    fs.writeFileSync(
      path.join(CONFIG.settingsDumpDir, `${card.id}.settings.json`),
      JSON.stringify(
        {
          cardId: card.id,
          suit: card.suit,
          rank: card.rank,
          type: card.type || null,
          profile: profile.name,
          model: profile.model,
          payload,
          generatedAt: new Date().toISOString()
        },
        null,
        2
      ),
      "utf8"
    );

    const startedAt = new Date().toISOString();
    console.log(`Generating ${card.id} (${processed + 1}/${targetTotal}) with seed ${seed}...`);

    try {
      const data = await requestImage(
        doFetch,
        CONFIG.apiBase,
        payload,
        CONFIG.retries,
        CONFIG.retryDelayMs,
        CONFIG.requestTimeoutMs
      );
      fs.writeFileSync(outPath, Buffer.from(data.images[0], "base64"));

      fs.appendFileSync(
        logFile,
        `${JSON.stringify({
          cardId: card.id,
          status: "generated",
          outPath,
          startedAt,
          finishedAt: new Date().toISOString(),
          seed,
          suit: card.suit,
          rank: card.rank,
          type: card.type || null,
          profile: profile.name,
          model: profile.model,
          parameters: data.parameters || payload,
          info: data.info || null
        })}\n`,
        "utf8"
      );
      console.log(`Generated: ${card.id}`);
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      fs.appendFileSync(
        logFile,
        `${JSON.stringify({
          cardId: card.id,
          status: "failed",
          outPath,
          startedAt,
          finishedAt: new Date().toISOString(),
          seed,
          error: message
        })}\n`,
        "utf8"
      );
      console.error(`Failed: ${card.id}`);
      console.error(message);
    }

    processed += 1;
  }

  console.log("Generation run completed.");
}

main().catch((error) => {
  console.error("generate-art failed:");
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
