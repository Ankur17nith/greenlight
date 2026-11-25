import { CreateStartUpPageContainer, TextContainerProperty, TextContainerUpgrade, waitForEvenAppBridge, StartUpPageCreateResult } from "@evenrealities/even_hub_sdk";
import { httpApi, exchangeCode } from "./api";
import { API_URL, POLL_MS, TOKEN_KEY } from "./config";
import { Controller } from "./controller";
import { devToken } from "./dev";
import { toGesture } from "./gestures";
import type { Screen } from "./render";

// 576 x 288 display, four fixed text containers, no scrolling.
const W = 576, H = 288;
const ROWS: { name: keyof Screen; y: number; h: number }[] = [
  { name: "c1", y: 0, h: 56 }, { name: "c2", y: 60, h: 80 }, { name: "c3", y: 144, h: 64 }, { name: "c4", y: 216, h: 72 },
];
const id = (n: keyof Screen) => ROWS.findIndex((r) => r.name === n) + 1;

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const status = (t: string) => { $("#status").textContent = t; };

async function main() {
  const bridge = await waitForEvenAppBridge();
  let token = devToken(location.search, import.meta.env.DEV) ?? ((await bridge.getLocalStorage(TOKEN_KEY)) || null);

  const textObject = ROWS.map((r, i) => new TextContainerProperty({
    xPosition: 0, yPosition: r.y, width: W, height: r.h, containerID: i + 1, containerName: r.name,
    content: "", isEventCapture: r.name === "c2" ? 1 : 0,
  }));
  const created = await bridge.createStartUpPageContainer(new CreateStartUpPageContainer({ containerTotalNum: ROWS.length, textObject }));
  if (created !== StartUpPageCreateResult.success) { status(`Glasses page failed (code ${created})`); return; }

  let prev: Screen = { c1: "", c2: "", c3: "", c4: "" };
  const show = (s: Screen) => {
    for (const r of ROWS) {
      if (prev[r.name] === s[r.name]) continue;
      void bridge.textContainerUpgrade(new TextContainerUpgrade({ containerID: id(r.name), containerName: r.name, content: s[r.name] }));
    }
    prev = s;
  };

  const api = httpApi(API_URL, () => token);
  const ctl = new Controller(api, show, undefined, () => !!token);
  bridge.onEvenHubEvent((e) => { const g = toGesture(e); if (g) void ctl.gesture(g); });

  // Phone side: pairing form. Google sign-in never runs in the WebView.
  $("#pair").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const code = $<HTMLInputElement>("#code").value.trim();
    try {
      token = await exchangeCode(API_URL, code);
      await bridge.setLocalStorage(TOKEN_KEY, token);
      status("Paired. Look at your glasses.");
      void ctl.refresh();
    } catch (e) { status((e as Error).message); }
  });
  status(token ? "Paired." : "Enter the 6-digit code from the dashboard.");

  await ctl.refresh();
  setInterval(() => void ctl.refresh(), POLL_MS);
}

main().catch((e) => status(`Could not start: ${(e as Error).message}`));
