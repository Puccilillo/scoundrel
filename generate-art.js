const fs = require("fs");
const path = require("path");

function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeText(value) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function parseLoraList(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split(":").map((part) => part.trim()).filter(Boolean);
      if (!parts.length) {
        return null;
      }

      const name = parts[0];
      const weight = parseNumber(parts[1], 0.8);
      if (!name) {
        return null;
      }

      return { name, weight };
    })
    .filter(Boolean);
}

function buildLoraTokens(loras) {
  return loras.map((lora) => `<lora:${lora.name}:${lora.weight}>`);
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

async function getFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }

  const nodeFetch = await import("node-fetch");
  return nodeFetch.default;
}

function loadSuitStyles() {
  return {
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

const SUIT_LORE = {
  hearts: {
    suitName: "Hearts",
    archetype: "Alchemy (Health Potions)",
    identity: "The Alchemist's Order",
    progression: "weak brews to divine elixir",
    colorBias: "ivory, red glass, gold trim",
    lightingRule: "warm soft glow only",
    environmentRule: "subtle alchemy lab aura only",
    designLanguage: "elegant glass containers, clean stopper shapes, restrained ornament",
    recurringIdentity: "same potion family silhouette, red liquid core, gold stopper motif"
  },
  diamonds: {
    suitName: "Diamonds",
    archetype: "Weapons",
    identity: "The Forgemaster's Arsenal",
    progression: "crude weapons to legendary artifacts",
    colorBias: "steel grey, gold, crimson accents",
    lightingRule: "forge lighting only",
    environmentRule: "subtle forge heat aura only",
    designLanguage: "crafted weapon silhouettes with readable edges and balanced proportions",
    recurringIdentity: "shared forged-metal language, gold accent marks, crimson heat highlights"
  },
  spades: {
    suitName: "Spades",
    archetype: "Major Monsters",
    identity: "Ancient Beasts",
    progression: "dark creatures and ancient threats to dragon apex",
    colorBias: "dark blue, violet, bone",
    lightingRule: "cold moonlight only",
    environmentRule: "ruins and moonlight aura only",
    designLanguage: "mythic beast silhouettes, menacing but readable anatomy",
    recurringIdentity: "ancient bestial forms, bone accents, moonlit edge highlights"
  },
  clubs: {
    suitName: "Clubs",
    archetype: "Corrupted / Demonic Beasts",
    identity: "Infernal Brood",
    progression: "savage infernal beasts to cerberus apex",
    colorBias: "black, ember red, smoke",
    lightingRule: "red infernal underlighting only",
    environmentRule: "volcanic hellscape aura only",
    designLanguage: "brutal demonic anatomy with bold aggressive silhouette",
    recurringIdentity: "infernal horns and claws language, ember fissure accents, smoke hints"
  }
};

const SUIT_PROGRESSIONS = {
  hearts: {
    2: "weak herbal vial",
    3: "small healing tincture",
    4: "basic red potion",
    5: "refined potion",
    6: "enhanced vitality flask",
    7: "military-grade tonic",
    8: "greater restoration",
    9: "high alchemy serum",
    10: "grand elixir",
    11: "master field alchemist tonic",
    12: "queen alchemist royal serum",
    13: "king alchemist philosopher panacea",
    14: "divine elixir"
  },
  diamonds: {
    2: "rusted dagger",
    3: "iron sword",
    4: "steel blade",
    5: "enchanted sword",
    6: "warhammer",
    7: "runic spear",
    8: "flame blade",
    9: "storm axe",
    10: "mythic greatsword",
    11: "forge champion halberd",
    12: "blade queen relic rapier",
    13: "war king titanblade",
    14: "legendary artifact"
  },
  spades: {
    2: "cave crawler",
    3: "goblin brute",
    4: "shadow wolf",
    5: "swamp troll",
    6: "wraith",
    7: "ogre",
    8: "lich",
    9: "giant",
    10: "hydra",
    11: "beast tamer",
    12: "necromancer",
    13: "demon lord",
    14: "ancient dragon"
  },
  clubs: {
    2: "imp",
    3: "hellhound",
    4: "war ghoul",
    5: "bone fiend",
    6: "abyss stalker",
    7: "infernal knight",
    8: "blood demon",
    9: "pit tyrant",
    10: "chaos abomination",
    11: "cult champion",
    12: "demon priestess",
    13: "infernal overlord",
    14: "cerberus"
  }
};

function getRankLabel(rank) {
  const rankMap = {
    11: "Jack",
    12: "Queen",
    13: "King",
    14: "Ace"
  };

  return rankMap[rank] || String(rank);
}

function getRankTier(rank) {
  if (rank <= 4) return "initiate tier";
  if (rank <= 7) return "adept tier";
  if (rank <= 10) return "elite tier";
  if (rank <= 13) return "legendary court tier";
  return "apex tier";
}

function getProgressionStep(card) {
  const progression = SUIT_PROGRESSIONS[card.suit];
  if (!progression) {
    return card.subject.trim();
  }

  return progression[card.rank] || card.subject.trim();
}

function buildLoreBlock(card) {
  const lore = SUIT_LORE[card.suit];
  const rankLabel = getRankLabel(card.rank);
  const rankTier = getRankTier(card.rank);
  const progressionStep = getProgressionStep(card);

  if (!lore) {
    return "";
  }

  return [
    `suit: ${lore.suitName}`,
    `archetype: ${lore.archetype}`,
    `identity: ${lore.identity}`,
    `progression path: ${lore.progression}`,
    `progression step for this card: ${progressionStep}`,
    `color bias: ${lore.colorBias}`,
    `lighting rule: ${lore.lightingRule}`,
    `environment rule: ${lore.environmentRule}`,
    `design language: ${lore.designLanguage}`,
    `recurring suit identity markers: ${lore.recurringIdentity}`,
    `card rank: ${rankLabel} (${card.rank})`,
    `power tier: ${rankTier}`,
    `subject focus: ${card.subject.trim()}`
  ].join("\n");
}

function getFigurePowerLook(rank) {
  if (rank <= 4) {
    return "light gear, simple clothing layers, modest weapon or prop";
  }

  if (rank <= 7) {
    return "trained warrior silhouette, clearer armor pieces, stronger posture";
  }

  if (rank <= 10) {
    return "elite silhouette, confident stance, ornate equipment details";
  }

  if (rank <= 13) {
    return "boss-level silhouette, commanding pose, high-status armor or regalia";
  }

  return "apex silhouette, iconic imposing pose, legendary visual presence";
}

function buildFigurePromptBlock(card, figureMaleOnly, promptMode) {
  if (promptMode === "minimal") {
    return figureMaleOnly
      ? "character directive: single male fantasy character, full-body, readable silhouette"
      : "character directive: single fantasy character, full-body, readable silhouette";
  }

  const genderLine = figureMaleOnly
    ? "gender directive: adult male character only, masculine body and facial traits"
    : "gender directive: keep subject gender neutral unless explicitly specified";

  return [
    "figure rendering target: single full-body character figurine",
    genderLine,
    "pose directive: front-facing 3/4 view, clear readable stance",
    "framing directive: centered, occupies most of frame, no cropping",
    "outfit directive: readable layered outfit and equipment matching subject",
    `power look directive: ${getFigurePowerLook(card.rank)}`,
    "detail directive: clean stylized details, avoid visual clutter"
  ].join("\n");
}

function buildPrompt(baseStyle, suitStyle, card, subjectOnlyDirective, useStructuredLore, profile, figureMaleOnly, useStylePrompts, promptMode) {
  const explicitPrompt = typeof card.prompt === "string" ? normalizeText(card.prompt).trim() : "";
  const subjectPrompt = explicitPrompt || normalizeText(card.subject).trim();
  const lorePrompt = useStructuredLore && !explicitPrompt ? buildLoreBlock(card) : "";
  const figurePrompt = profile && profile.name === "figures" ? buildFigurePromptBlock(card, figureMaleOnly, promptMode) : "";
  const outputModePrompt = subjectOnlyDirective
    ? "output target: isolated figure or object only, no card template, no border, no corner symbols, no text"
    : "";
  const simplicityPrompt =
    "simplicity rules: one subject, big simple shapes, minimal fine detail, no texture noise, no realistic materials, no background elements, no cinematic composition";
  const styleBlock = useStylePrompts ? [baseStyle, suitStyle] : [];

  if (promptMode === "minimal") {
    return normalizeText(
      [
        ...styleBlock,
        figurePrompt,
        outputModePrompt,
        "style directive: clean stylized game asset, strong silhouette, transparent background",
        subjectPrompt
      ].filter(Boolean).join("\n\n")
    );
  }

  return normalizeText([...styleBlock, lorePrompt, figurePrompt, outputModePrompt, simplicityPrompt, subjectPrompt].filter(Boolean).join("\n\n"));
}

function getProfileDefaults(env) {
  return {
    icons: {
      name: "icons",
      model: env.SD_ICON_MODEL || "fantassifiedIcons_fantassifiedIconsV20",
      steps: parseNumber(env.SD_ICON_STEPS, parseNumber(env.SD_STEPS, 30)),
      width: parseNumber(env.SD_ICON_WIDTH, parseNumber(env.SD_WIDTH, 512)),
      height: parseNumber(env.SD_ICON_HEIGHT, parseNumber(env.SD_HEIGHT, 768)),
      cfg_scale: parseNumber(env.SD_ICON_CFG_SCALE, parseNumber(env.SD_CFG_SCALE, 6.5)),
      sampler_name: env.SD_ICON_SAMPLER || env.SD_SAMPLER || "DPM++ 2M Karras"
    },
    figures: {
      name: "figures",
      model: env.SD_FIGURE_MODEL || "3D3DCharacterFigurine_v10",
      steps: parseNumber(env.SD_FIGURE_STEPS, parseNumber(env.SD_STEPS, 24)),
      width: parseNumber(env.SD_FIGURE_WIDTH, parseNumber(env.SD_WIDTH, 640)),
      height: parseNumber(env.SD_FIGURE_HEIGHT, parseNumber(env.SD_HEIGHT, 960)),
      cfg_scale: parseNumber(env.SD_FIGURE_CFG_SCALE, parseNumber(env.SD_CFG_SCALE, 6)),
      sampler_name: env.SD_FIGURE_SAMPLER || env.SD_SAMPLER || "DPM++ 2M Karras"
    }
  };
}

function selectProfile(card, profiles) {
  if (card.type === "potion" || card.type === "weapon") {
    return profiles.icons;
  }

  return profiles.figures;
}

async function requestImage(doFetch, apiBase, payload, retries, retryDelayMs) {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await doFetch(`${apiBase}/sdapi/v1/txt2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
    }
  }

  throw lastError;
}

async function main() {
  const doFetch = await getFetch();
  const baseStyle = normalizeText(fs.readFileSync("./style/base.txt", "utf8")).trim();
  const suitStyles = loadSuitStyles();
  const deck = loadDeck();

  const apiBase = process.env.SD_API_BASE || "http://127.0.0.1:7860";
  const outputDir = process.env.ART_OUTPUT_DIR || "./art";
  const logDir = process.env.ART_LOG_DIR || "./output";
  const promptDumpDir = process.env.ART_PROMPT_DIR || path.join(logDir, "prompts");
  const settingsDumpDir = process.env.ART_SETTINGS_DIR || path.join(logDir, "settings");
  const retries = Math.max(1, parseNumber(process.env.SD_RETRIES, 3));
  const retryDelayMs = Math.max(0, parseNumber(process.env.SD_RETRY_DELAY_MS, 1500));
  const overwrite = String(process.env.OVERWRITE_ART || "false").toLowerCase() === "true";
  let startFrom = process.env.START_FROM_CARD_ID || "";
  const limitCards = Math.max(0, parseNumber(process.env.LIMIT_CARDS, 0));
  const suitFilterRaw = String(process.env.SUIT_FILTER || "").trim().toLowerCase();
  const suitFilter = suitFilterRaw
    ? new Set(suitFilterRaw.split(",").map((value) => value.trim()).filter(Boolean))
    : null;
  const subjectOnlyDirective = String(process.env.SUBJECT_ONLY || "true").toLowerCase() !== "false";
  const useStructuredLore = String(process.env.USE_STRUCTURED_LORE || "false").toLowerCase() === "true";
  const figureMaleOnly = String(process.env.FIGURE_MALE_ONLY || "true").toLowerCase() !== "false";
  const useStylePrompts = String(process.env.USE_STYLE_PROMPTS || "false").toLowerCase() === "true";
  const promptMode = String(process.env.PROMPT_MODE || "minimal").toLowerCase();
  const commonLoras = parseLoraList(process.env.SD_COMMON_LORAS || "");
  const iconLoras = parseLoraList(process.env.SD_ICON_LORAS || "");
  const figureLoras = parseLoraList(process.env.SD_FIGURE_LORAS || "");

  const defaults = {
    steps: parseNumber(process.env.SD_STEPS, 26),
    width: parseNumber(process.env.SD_WIDTH, 768),
    height: parseNumber(process.env.SD_HEIGHT, 1152),
    cfg_scale: parseNumber(process.env.SD_CFG_SCALE, 6),
    sampler_name: process.env.SD_SAMPLER || "DPM++ 2M Karras",
    negative_prompt:
      process.env.SD_NEGATIVE_PROMPT ||
      "photorealistic, realistic photo, cinematic scene, complex background, scenery, environment, landscape, intricate details, micro details, texture noise, gritty texture, 3d render, dramatic lighting, depth of field, bloom, glare, text, letters, watermark, logo, border, frame, blurry, low quality",
    batch_size: 1,
    n_iter: 1
  };
  const profiles = getProfileDefaults(process.env);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(promptDumpDir, { recursive: true });
  fs.mkdirSync(settingsDumpDir, { recursive: true });

  const selectedDeck = suitFilter
    ? deck.filter((card) => suitFilter.has(card.suit))
    : deck;

  if (!selectedDeck.length) {
    throw new Error("No cards selected. Check SUIT_FILTER values (hearts, diamonds, spades, clubs).");
  }

  if (startFrom && !selectedDeck.some((card) => card.id === startFrom)) {
    console.warn(`START_FROM_CARD_ID '${startFrom}' was not found in selected cards. Starting from first selected card instead.`);
    startFrom = "";
  }

  const targetTotal = limitCards > 0 ? Math.min(limitCards, selectedDeck.length) : selectedDeck.length;

  const stamp = runId();
  const logFile = path.join(logDir, `generate-art-${stamp}.jsonl`);

  console.log(`Deck size: ${deck.length}`);
  console.log(`Selected cards: ${selectedDeck.length}`);
  console.log(`Target cards this run: ${targetTotal}`);
  console.log(`Output dir: ${outputDir}`);
  console.log(`Log file: ${logFile}`);
  console.log(`Prompt dump dir: ${promptDumpDir}`);
  console.log(`Settings dump dir: ${settingsDumpDir}`);
  console.log(`API base: ${apiBase}`);
  console.log(`Subject-only mode: ${subjectOnlyDirective ? "on" : "off"}`);
  console.log(`Prompt mode: ${promptMode}`);
  console.log(`Style prompts: ${useStylePrompts ? "on" : "off"}`);
  console.log(`Structured lore prompts: ${useStructuredLore ? "on" : "off"}`);
  console.log(`Figure male-only mode: ${figureMaleOnly ? "on" : "off"}`);
  console.log(`Icons model: ${profiles.icons.model}`);
  console.log(`Figures model: ${profiles.figures.model}`);
  console.log(`Common LoRAs: ${commonLoras.length ? buildLoraTokens(commonLoras).join(" ") : "none"}`);
  console.log(`Icon LoRAs: ${iconLoras.length ? buildLoraTokens(iconLoras).join(" ") : "none"}`);
  console.log(`Figure LoRAs: ${figureLoras.length ? buildLoraTokens(figureLoras).join(" ") : "none"}`);

  let started = !startFrom;
  let processed = 0;

  for (let i = 0; i < selectedDeck.length; i += 1) {
    if (limitCards > 0 && processed >= limitCards) {
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

    const outPath = path.join(outputDir, `${card.id}.png`);
    if (!overwrite && fs.existsSync(outPath)) {
      console.log(`Skipped (exists): ${card.id}`);
      fs.appendFileSync(logFile, `${JSON.stringify({ cardId: card.id, status: "skipped_exists", outPath })}\n`, "utf8");
      continue;
    }

    const profile = selectProfile(card, profiles);
    const prompt = buildPrompt(
      baseStyle,
      suitStyles[card.suit],
      card,
      subjectOnlyDirective,
      useStructuredLore,
      profile,
      figureMaleOnly,
      useStylePrompts,
      promptMode
    );
    const perCardLoras = Array.isArray(card.loras)
      ? card.loras.map((entry) => {
        if (!entry || typeof entry !== "object" || !entry.name) {
          return null;
        }

        return {
          name: String(entry.name).trim(),
          weight: parseNumber(entry.weight, 0.8)
        };
      }).filter(Boolean)
      : [];
    const profileLoras = profile.name === "icons" ? iconLoras : figureLoras;
    const allLoraTokens = buildLoraTokens([...commonLoras, ...profileLoras, ...perCardLoras]);
    const promptWithLoras = appendTokensToPrompt(prompt, allLoraTokens);
    const seed = Number.isFinite(Number(card.seed)) ? Number(card.seed) : hashSeed(card.id);
    const profileNegativePrompt = profile.name === "figures"
      ? (process.env.SD_FIGURE_NEGATIVE_PROMPT || `${defaults.negative_prompt}, female, woman, girl, feminine, breasts, cleavage, lipstick, makeup`)
      : defaults.negative_prompt;

    const payload = {
      ...defaults,
      steps: profile.steps,
      width: profile.width,
      height: profile.height,
      cfg_scale: profile.cfg_scale,
      sampler_name: profile.sampler_name,
      prompt: promptWithLoras,
      negative_prompt: typeof card.negative_prompt === "string" ? card.negative_prompt : profileNegativePrompt,
      seed,
      override_settings: {
        sd_model_checkpoint: profile.model
      },
      override_settings_restore_afterwards: true
    };

    const promptFilePath = path.join(promptDumpDir, `${card.id}.prompt.txt`);
    const settingsFilePath = path.join(settingsDumpDir, `${card.id}.settings.json`);

    fs.writeFileSync(promptFilePath, `${promptWithLoras}\n`, "utf8");
    fs.writeFileSync(
      settingsFilePath,
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
    console.log(`Generating ${card.id} (${processed + 1}/${targetTotal}) with seed ${seed} using ${profile.name} model...`);

    try {
      const data = await requestImage(doFetch, apiBase, payload, retries, retryDelayMs);
      fs.writeFileSync(outPath, Buffer.from(data.images[0], "base64"));

      const logRow = {
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
      };

      fs.appendFileSync(logFile, `${JSON.stringify(logRow)}\n`, "utf8");
      console.log(`Generated: ${card.id}`);
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      const logRow = {
        cardId: card.id,
        status: "failed",
        outPath,
        startedAt,
        finishedAt: new Date().toISOString(),
        seed,
        error: message
      };

      fs.appendFileSync(logFile, `${JSON.stringify(logRow)}\n`, "utf8");
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