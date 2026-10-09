// ============================================================
//  All page content lives here. Edit scores / captions / video
//  paths without touching the layout code.
//  Video convention (drop files and they appear automatically):
//    Demo 1: videos/mixture/<bench>/<case>/<size>_<variant>.mp4   e.g. videos/mixture/mcu/mine_birch_log/27b_s1.mp4
//    Demo 2: videos/frontier/<bench>/<case>/<tp|rt>_<model>.mp4   e.g. videos/frontier/mcu/kill_sheep/rt_gemini-3.8-flash.mp4
//  Put the original recordings under videos_raw/ with the same layout and run
//  `python tools/encode_videos.py` to write the compressed mp4 + poster .jpg into videos/.
//  A score of null renders as "TBD".
// ============================================================
window.PAGE_DATA = {
  benchmarks: [
    { id: "mcu",     name: "MCU",           tier: "In-corpus",        desc: "30 Minecraft tasks: embodied, combat and GUI." },
    { id: "vizdoom", name: "ViZDoom",       tier: "In-corpus",        desc: "Single-scenario shooting in DOOM." },
    { id: "oga",     name: "OmniGameArena", tier: "Unseen · related", desc: "Seven unseen 3D worlds with shared action primitives." },
    { id: "gw",      name: "GameWorld",     tier: "Unseen · distant", desc: "Mostly 2D / 2.5D browser games with new physics and controls." }
  ],

  // ---------- Demo 1: base vs S1 (Minecraft-only) vs S3 (balanced) ----------
  mixture: {
    sizes: ["0.8B", "2B", "9B", "27B"],
    defaultSize: "27B",
    variants: [
      { id: "base", label: "Qwen3.5 Base",   sub: "No continued pre-training", color: "var(--c-base)" },
      { id: "s1",   label: "GameScaling-S1", sub: "100% Minecraft gameplay",   color: "var(--c-s1)" },
      { id: "s3",   label: "GameScaling-S3", sub: "27% Minecraft · balanced mix", color: "var(--c-s3)" }
    ],
    // Paper averages: time-paused score (%), 1,600 h checkpoints (table under the videos).
    // Base / S3 from the paper tables; S1 read off the 1,600 h column of Figure 4 (vector coordinates).
    scores: {
      "0.8B": { base: { mcu: 0.0, vizdoom: 0.9, oga: 1.7,  gw: 13.8 }, s1: { mcu: 44.0, vizdoom: 5.4,  oga: 7.1, gw: 14.4 }, s3: { mcu: 36.0, vizdoom: 11.9, oga: 10.2, gw: 20.3 } },
      "2B":   { base: { mcu: 0.0, vizdoom: 0.9, oga: 1.8,  gw: 19.8 }, s1: { mcu: 49.3, vizdoom: 10.7, oga: 5.9, gw: 15.1 }, s3: { mcu: 48.0, vizdoom: 11.2, oga: 13.9, gw: 19.5 } },
      "9B":   { base: { mcu: 3.3, vizdoom: 2.8, oga: 5.2,  gw: 29.2 }, s1: { mcu: 54.7, vizdoom: 8.1,  oga: 6.0, gw: 17.0 }, s3: { mcu: 44.7, vizdoom: 15.9, oga: 27.3, gw: 26.2 } },
      "27B":  { base: { mcu: 9.3, vizdoom: 5.6, oga: 9.7,  gw: 29.3 }, s1: { mcu: 63.3, vizdoom: 5.3,  oga: 7.9, gw: 12.5 }, s3: { mcu: 54.0, vizdoom: 14.7, oga: 25.7, gw: 25.3 } }
    },
    // Showcase rollouts, one video per (case, size, variant). Under each video:
    //   MCU         -> { success: true|false, ticks }   (600 env ticks = 30 s cap)
    //   other bench -> { progress: 0-100, note }        (score of this rollout, %; optional short note)
    // `metric` names the per-rollout number (default "task progress").
    // Sizes missing from `results` are hidden from the size picker for that case.
    cases: {
      mcu: [
        { id: "mine_birch_log", label: "Mine birch log", task: "mine_block: birch_log",
          results: {
            "0.8B": { base: { success: false, ticks: 599 }, s1: { success: true,  ticks: 150 }, s3: { success: false, ticks: 599 } },
            "27B":  { base: { success: false, ticks: 599 }, s1: { success: true,  ticks: 190 }, s3: { success: true,  ticks: 179 } }
          } },
        { id: "craft_enchanting_table", label: "Craft enchanting table", task: "craft_item: enchanting_table",
          results: {
            "0.8B": { base: { success: false, ticks: 599 }, s1: { success: false, ticks: 599 }, s3: { success: false, ticks: 599 } },
            "27B":  { base: { success: false, ticks: 599 }, s1: { success: true,  ticks: 153 }, s3: { success: false, ticks: 599 } }
          } },
        { id: "kill_zombie", label: "Kill zombie", task: "kill_entity: zombie",
          results: {
            "0.8B": { base: { success: false, ticks: 599 }, s1: { success: true,  ticks: 132 }, s3: { success: true,  ticks: 184 } },
            "27B":  { base: { success: false, ticks: 599 }, s1: { success: true,  ticks: 120 }, s3: { success: true,  ticks: 168 } }
          } }
      ],
      // ViZDoom score = episode reward / 100, as in the paper
      vizdoom: [
        { id: "defend_the_line", label: "Defend the line", metric: "score", task: "defend_the_line · reward ÷ 100",
          results: {
            "0.8B": { base: { progress: 4,  note: "died at step 85" },  s1: { progress: 14, note: "died at step 176" }, s3: { progress: 18, note: "died at step 169" } },
            "27B":  { base: { progress: 17, note: "died at step 152" }, s1: { progress: 19, note: "died at step 208" }, s3: { progress: 38, note: "survived to the end" } }
          } },
        { id: "defend_the_center", label: "Defend the center", metric: "score", task: "defend_the_center · reward ÷ 100",
          results: {
            "0.8B": { base: { progress: -1, note: "died at step 52" }, s1: { progress: 0, note: "died at step 96" }, s3: { progress: 19, note: "died at step 287" } },
            "27B":  { base: { progress: 0,  note: "died at step 74" }, s1: { progress: 1, note: "died at step 65" }, s3: { progress: 30, note: "died at step 334" } }
          } }
      ],
      oga: [
        { id: "monster_shoot", label: "Monster shoot", task: "monster_shoot",
          results: {
            "0.8B": { base: { progress: 0 },  s1: { progress: 18 }, s3: { progress: 40 } },
            "27B":  { base: { progress: 10 }, s1: { progress: 26 }, s3: { progress: 100, note: "done at step 249" } }
          } },
        { id: "scene_escape", label: "Scene escape", task: "scene_escape · 10 sub-tasks",
          results: {
            "0.8B": { base: { progress: 0,  note: "0 / 10 sub-tasks" }, s1: { progress: 0, note: "0 / 10 sub-tasks" }, s3: { progress: 10, note: "1 / 10 sub-tasks" } },
            "27B":  { base: { progress: 10, note: "1 / 10 sub-tasks" }, s1: { progress: 0, note: "0 / 10 sub-tasks" }, s3: { progress: 50, note: "5 / 10 sub-tasks" } }
          } }
      ],
      gw: [
        { id: "pacman", label: "Pac-Man", task: "23_pacman · task 23_03",
          results: {
            "0.8B": { base: { progress: 10.67, note: "160 / 1500 pts" },  s1: { progress: 8, note: "120 / 1500 pts" }, s3: { progress: 36, note: "540 / 1500 pts" } },
            "27B":  { base: { progress: 90.67, note: "1360 / 1500 pts" }, s1: { progress: 8, note: "120 / 1500 pts" }, s3: { progress: 38, note: "570 / 1500 pts" } }
          } },
        { id: "gentlemans_adventure", label: "Gentleman's adventure", task: "02_another-gentlemans-adventure · task 02_04",
          results: {
            "0.8B": { base: { progress: 0,  note: "0 / 4 goals" }, s1: { progress: 0, note: "0 / 4 goals" }, s3: { progress: 50, note: "2 / 4 goals" } },
            "27B":  { base: { progress: 75, note: "3 / 4 goals" }, s1: { progress: 0, note: "0 / 4 goals" }, s3: { progress: 50, note: "2 / 4 goals" } }
          } },
        { id: "boxel_rebound", label: "Boxel rebound", task: "04_boxel-rebound · task 04_02",
          results: {
            "0.8B": { base: { progress: 17.69 },  s1: { progress: 17.69 }, s3: { progress: 82.58 } },
            "27B":  { base: { progress: 100, note: "done at step 27" }, s1: { progress: 37.9 }, s3: { progress: 100, note: "done at step 37" } }
          } }
      ]
    }
  },

  // ---------- Demo 2: frontier models vs GameScaling, time-paused / real-time ----------
  frontier: {
    // cards with a video; every model in `models` still appears in the bar chart
    showcase: ["gemini-3.8-flash", "gpt-5.6-sol", "claude-opus-5.0", "gamescaling-9b-s3"],
    // Showcase rollouts, one video per (case, setting, showcase model).
    // MCU: { success, ticks, latency? }. Time-paused caps at 600 ticks (30 s); real-time caps at
    // 3,600 ticks (3 min) and charges model latency to the game clock. latency = median s / step.
    // Other benches: { progress, note?, latency? } as in Demo 1; without latency the model average is shown.
    cases: {
      mcu: [
        { id: "kill_sheep", label: "Kill sheep", task: "kill_entity: sheep",
          results: {
            tp: {
              "gemini-3.8-flash": { success: true, ticks: 59 },
              "gpt-5.6-sol": { success: true, ticks: 71 },
              "claude-opus-5.0": { success: true, ticks: 71 },
              "gamescaling-9b-s3": { success: true, ticks: 51 }
            },
            rt: {
              "gemini-3.8-flash": { success: false, ticks: 3600, latency: 4.21 },
              "gpt-5.6-sol": { success: false, ticks: 3600, latency: 4.62 },
              "claude-opus-5.0": { success: false, ticks: 3600, latency: 5.13 },
              "gamescaling-9b-s3": { success: true, ticks: 1468, latency: 0.33 }
            }
          } },
        { id: "mine_sugar_cane", label: "Mine sugar cane", task: "mine_block: sugar_cane",
          results: {
            tp: {
              "gemini-3.8-flash": { success: true, ticks: 8 },
              "gpt-5.6-sol": { success: true, ticks: 14 },
              "claude-opus-5.0": { success: true, ticks: 6 },
              "gamescaling-9b-s3": { success: true, ticks: 76 }
            },
            rt: {
              "gemini-3.8-flash": { success: true, ticks: 816, latency: 4.18 },
              "gpt-5.6-sol": { success: true, ticks: 411, latency: 5.06 },
              "claude-opus-5.0": { success: true, ticks: 591, latency: 4.63 },
              "gamescaling-9b-s3": { success: true, ticks: 140, latency: 0.29 }
            }
          } },
        { id: "craft_emerald", label: "Craft emerald", task: "craft_item: emerald",
          results: {
            tp: {
              "gemini-3.8-flash": { success: true, ticks: 77 },
              "gpt-5.6-sol": { success: true, ticks: 177 },
              "claude-opus-5.0": { success: true, ticks: 136 },
              "gamescaling-9b-s3": { success: true, ticks: 240 }
            },
            rt: {
              "gemini-3.8-flash": { success: false, ticks: 3600, latency: 3.35 },
              "gpt-5.6-sol": { success: false, ticks: 3600, latency: 7.18 },
              "claude-opus-5.0": { success: false, ticks: 3600, latency: 7.19 },
              "gamescaling-9b-s3": { success: true, ticks: 958, latency: 0.28 }
            }
          } }
      ],
      // ViZDoom: episode reward (= score %); frontier = lowest of 10 episodes, GameScaling = highest
      vizdoom: [
        { id: "defend_the_line", label: "Defend the line", metric: "score", task: "defend_the_line · reward ÷ 100",
          results: {
            tp: {
              "gemini-3.8-flash": { progress: 47, note: "survived to the end", latency: 4.39 },
              "gpt-5.6-sol": { progress: 46, note: "survived to the end", latency: 4.98 },
              "claude-opus-5.0": { progress: 31, note: "died at 38.3 s", latency: 8.9 },
              "gamescaling-9b-s3": { progress: 34, note: "died at 48.7 s", latency: 0.34 }
            },
            rt: {
              "gemini-3.8-flash": { progress: 4, note: "died at 16.3 s", latency: 10.46 },
              "gpt-5.6-sol": { progress: 1, note: "died at 9.0 s", latency: 8.47 },
              "claude-opus-5.0": { progress: 4, note: "died at 10.8 s", latency: 8.63 },
              "gamescaling-9b-s3": { progress: 28, note: "died at 44.0 s", latency: 0.26 }
            }
          } },
        { id: "defend_the_center", label: "Defend the center", metric: "score", task: "defend_the_center · reward ÷ 100",
          results: {
            tp: {
              "gemini-3.8-flash": { progress: 26, note: "died at 34.5 s", latency: 4.43 },
              "gpt-5.6-sol": { progress: 25, note: "died at 33.8 s", latency: 4.25 },
              "claude-opus-5.0": { progress: 7, note: "died at 15.3 s", latency: 7.74 },
              "gamescaling-9b-s3": { progress: 22, note: "survived to the end", latency: 0.34 }
            },
            rt: {
              "gemini-3.8-flash": { progress: -1, note: "died at 10.2 s", latency: 5.0 },
              "gpt-5.6-sol": { progress: 0, note: "died at 10.7 s", latency: 4.99 },
              "claude-opus-5.0": { progress: -1, note: "died at 10.5 s", latency: 12.14 },
              "gamescaling-9b-s3": { progress: 12, note: "died at 44.9 s", latency: 0.27 }
            }
          } }
      ],
      oga: [
        { id: "monster_shoot", label: "Monster shoot", task: "monster_shoot",
          results: {
            tp: {
              "gemini-3.8-flash": { progress: 70 },
              "gpt-5.6-sol": { progress: 49 },
              "claude-opus-5.0": { progress: 67 },
              "gamescaling-9b-s3": { progress: 100 }
            },
            rt: {
              "gemini-3.8-flash": { progress: 14 },
              "gpt-5.6-sol": { progress: 22 },
              "claude-opus-5.0": { progress: 25 },
              "gamescaling-9b-s3": { progress: 52 }
            }
          } },
        { id: "scene_escape", label: "Scene escape", task: "scene_escape · 10 sub-tasks",
          results: {
            tp: {
              "gemini-3.8-flash": { progress: 80, note: "8 / 10 sub-tasks" },
              "gpt-5.6-sol": { progress: 70, note: "7 / 10 sub-tasks" },
              "claude-opus-5.0": { progress: 80, note: "8 / 10 sub-tasks" },
              "gamescaling-9b-s3": { progress: 80, note: "8 / 10 sub-tasks" }
            },
            rt: {
              "gemini-3.8-flash": { progress: 10, note: "1 / 10 sub-tasks" },
              "gpt-5.6-sol": { progress: 10, note: "1 / 10 sub-tasks" },
              "claude-opus-5.0": { progress: 10, note: "1 / 10 sub-tasks" },
              "gamescaling-9b-s3": { progress: 60, note: "6 / 10 sub-tasks" }
            }
          } }
      ],
      gw: [
        { id: "pacman", label: "Pac-Man", task: "23_pacman · task 23_03",
          results: {
            tp: {
              "gemini-3.8-flash": { progress: 58.67, note: "880 / 1500 pts" },
              "gpt-5.6-sol": { progress: 96, note: "1440 / 1500 pts" },
              "claude-opus-5.0": { progress: 51.33, note: "770 / 1500 pts" },
              "gamescaling-9b-s3": { progress: 92.67, note: "1390 / 1500 pts" }
            },
            rt: {
              "gemini-3.8-flash": { progress: 56, note: "840 / 1500 pts" },
              "gpt-5.6-sol": { progress: 39.33, note: "590 / 1500 pts" },
              "claude-opus-5.0": { progress: 54.67, note: "820 / 1500 pts" },
              "gamescaling-9b-s3": { progress: 87.33, note: "1310 / 1500 pts" }
            }
          } },
        { id: "gentlemans_adventure", label: "Gentleman's adventure", task: "02_another-gentlemans-adventure · task 02_04",
          results: {
            tp: {
              "gemini-3.8-flash": { progress: 75, note: "3 / 4 goals" },
              "gpt-5.6-sol": { progress: 75, note: "3 / 4 goals" },
              "claude-opus-5.0": { progress: 100, note: "4 / 4 goals" },
              "gamescaling-9b-s3": { progress: 50, note: "2 / 4 goals" }
            },
            rt: {
              "gemini-3.8-flash": { progress: 25, note: "1 / 4 goals" },
              "gpt-5.6-sol": { progress: 50, note: "2 / 4 goals" },
              "claude-opus-5.0": { progress: 50, note: "2 / 4 goals" },
              "gamescaling-9b-s3": { progress: 50, note: "2 / 4 goals" }
            }
          } },
        { id: "boxel_rebound", label: "Boxel rebound", task: "04_boxel-rebound · task 04_02",
          results: {
            tp: {
              "gemini-3.8-flash": { progress: 88.91 },
              "gpt-5.6-sol": { progress: 89.43 },
              "claude-opus-5.0": { progress: 89.29 },
              "gamescaling-9b-s3": { progress: 100, note: "done at step 44" }
            },
            rt: {
              "gemini-3.8-flash": { progress: 17.84 },
              "gpt-5.6-sol": { progress: 18.43 },
              "claude-opus-5.0": { progress: 18.51 },
              "gamescaling-9b-s3": { progress: 100, note: "done at step 61" }
            }
          } }
      ]
    },
    models: [
      { id: "gemini-3.8-flash",  name: "Gemini-3.8-Flash",  group: "Proprietary", size: "~T",   latency: 7.75, tokens: 444,
        tp: { mcu: 88.7, vizdoom: 27.8, oga: 45.2, gw: 60.7 }, rt: { mcu: 7.3, vizdoom: 2.8, oga: 18.6, gw: 48.2 } },
      { id: "gpt-5.6-sol",       name: "GPT-5.6-Sol",       group: "Proprietary", size: "~T",   latency: 5.57, tokens: 123,
        tp: { mcu: 82.0, vizdoom: 26.7, oga: 45.6, gw: 53.9 }, rt: { mcu: 8.7, vizdoom: 2.7, oga: 14.5, gw: 44.3 } },
      { id: "gpt-5.6-luna",      name: "GPT-5.6-Luna",      group: "Proprietary", size: "~T",   latency: 5.84, tokens: 144,
        tp: { mcu: 54.0, vizdoom: 24.1, oga: 26.7, gw: 44.9 }, rt: { mcu: 5.3, vizdoom: 2.9, oga: 13.2, gw: 41.6 } },
      { id: "claude-opus-5.0",   name: "Claude-Opus-5.0",   group: "Proprietary", size: "~T",   latency: 8.59, tokens: 183,
        tp: { mcu: 56.7, vizdoom: 20.8, oga: 44.4, gw: 52.8 }, rt: { mcu: 8.7, vizdoom: 2.0, oga: 16.4, gw: 42.0 } },
      { id: "glm-5.3-flash",     name: "GLM-5.3-Flash",     group: "Open-source", size: "320B", latency: 23.66, tokens: 1027,
        tp: { mcu: 47.3, vizdoom: 18.9, oga: 23.5, gw: 34.0 }, rt: { mcu: 7.3, vizdoom: 1.9, oga: 12.3, gw: 29.6 } },
      { id: "deepseek-v4-flash-vision", name: "DeepSeek-V4-Flash-Vision", group: "Open-source", size: "305B", latency: 3.97, tokens: 659,
        tp: { mcu: 36.0, vizdoom: 13.0, oga: 27.1, gw: 41.8 }, rt: { mcu: 7.3, vizdoom: 3.3, oga: 11.6, gw: 28.5 } },
      // Qwen3.5 backbones (base models of GameScaling)
      { id: "qwen3.5-0.8b", name: "Qwen3.5-0.8B", group: "Open-source", size: "0.8B", latency: 0.72,
        tp: { mcu: 0.0, vizdoom: 0.9, oga: 1.7, gw: 13.8 }, rt: { mcu: 0.0, vizdoom: 1.0, oga: 1.8, gw: 15.1 } },
      { id: "qwen3.5-2b",   name: "Qwen3.5-2B",   group: "Open-source", size: "2B",   latency: 0.96,
        tp: { mcu: 0.0, vizdoom: 0.9, oga: 1.8, gw: 19.8 }, rt: { mcu: 0.0, vizdoom: 1.5, oga: 1.7, gw: 16.3 } },
      { id: "qwen3.5-9b",   name: "Qwen3.5-9B",   group: "Open-source", size: "9B",   latency: 1.32,
        tp: { mcu: 3.3, vizdoom: 2.8, oga: 5.2, gw: 29.2 }, rt: { mcu: 3.3, vizdoom: 3.2, oga: 4.1, gw: 27.7 } },
      { id: "qwen3.5-27b",  name: "Qwen3.5-27B",  group: "Open-source", size: "27B",  latency: 2.18,
        tp: { mcu: 9.3, vizdoom: 5.6, oga: 9.7, gw: 29.3 }, rt: { mcu: 4.0, vizdoom: 2.9, oga: 7.6, gw: 25.2 } },
      { id: "gamescaling-0.8b-s3", name: "GameScaling-0.8B-S3", group: "GameScaling", size: "0.8B", latency: 0.13, tokens: 35,
        tp: { mcu: 36.0, vizdoom: 11.9, oga: 10.2, gw: 20.3 }, rt: { mcu: 37.3, vizdoom: 11.8, oga: 9.8, gw: 22.5 } },
      { id: "gamescaling-2b-s3",   name: "GameScaling-2B-S3",   group: "GameScaling", size: "2B",   latency: 0.16, tokens: 35,
        tp: { mcu: 48.0, vizdoom: 11.2, oga: 13.9, gw: 19.5 }, rt: { mcu: 44.0, vizdoom: 10.4, oga: 12.2, gw: 20.0 } },
      { id: "gamescaling-9b-s3",   name: "GameScaling-9B-S3",   group: "GameScaling", size: "9B",   latency: 0.31, tokens: 39,
        tp: { mcu: 44.7, vizdoom: 15.9, oga: 27.3, gw: 26.2 }, rt: { mcu: 36.7, vizdoom: 16.4, oga: 20.2, gw: 27.8 } },
      { id: "gamescaling-27b-s3",  name: "GameScaling-27B-S3",  group: "GameScaling", size: "27B",  latency: 0.69, tokens: 36,
        tp: { mcu: 54.0, vizdoom: 14.7, oga: 25.7, gw: 25.3 }, rt: { mcu: 16.7, vizdoom: 13.2, oga: 17.8, gw: 24.8 } }
    ]
  }
};
