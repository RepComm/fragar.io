import { Drawing, EXPONENT_CSS_BODY_STYLES, EXPONENT_CSS_STYLES, Panel } from "@repcomm/exponent-ts";
import { GameInput } from "@repcomm/gameinput-ts";
import { Vec2 } from "@repcomm/vec2d";
import { Food } from "./food";
import { random, smoothNoise } from "./math";
import { Player } from "./player";
import { Timer } from "./timer";
import { arrow } from "./helpers";

EXPONENT_CSS_BODY_STYLES.mount(document.head);
EXPONENT_CSS_STYLES.mount(document.head);

async function main() {
  const container = new Panel()
  .setId("container")
  .mount(document.body);

  const renderer = new Drawing({desynchronized: true, alpha: false})
  .setId("canvas")
  .setHandlesResize(true)
  .addRenderPass((ctx)=>{
    Food.render(ctx);
    for (let p of Player.all) {      
      for (let b of p.blobs) {
        //run merging code
        p.passMerge(b);

        //eat food
        Food.consume(b);

        //draw blob
        b.render(ctx);

        if (p.debugDraw) arrow(ctx, b.position, b.velocity, 50, "yellow");

        //run movement code
        b.passMove(p.focus);

        b.update();
      }
    }
  })
  .mount(container);

  setTimeout(()=>{
    renderer.onResize(null);
  }, 200);

  let input = GameInput.get();

  input.getOrCreateAxis("go")
  .addInfluence({
    value: 1,
    mouseButtons: [0]
  });

  input.getOrCreateButton("split")
  .addInfluence({
    keys: [" "]
  });

  input.getOrCreateButton("split-alt")
  .addInfluence({
    mouseButtons:[0]
  });

  let localPlayer = new Player({
    color: random.color(),
    isLocal: true,
    name: prompt("Enter player name", "Player 1")
  });

  localPlayer
  .spawn()
  .setMass(32000)
  .position.set(100, 100);

  window["smoothNoise"] = smoothNoise;

  const timer = new Timer();
  timer.start(120);

  let timeLastSplit = 0;
  let timeEnlapsedSplit = 0;
  let timeMinSplit = 1000;
  let tapCount = 0;
  let tapDown = false;
  let timeTapCountReset = 500;

  timer.listen(30, (enlapsed)=>{
    localPlayer.setFocus(
      input.raw.getPointerX(),
      input.raw.getPointerY()
    );

    timeEnlapsedSplit = Date.now() - timeLastSplit;
    if (timeEnlapsedSplit > timeMinSplit) {
      if (input.getButtonValue("split")) {
        localPlayer.trySplit();
        timeLastSplit = Date.now();
      } else if (input.getButtonValue("split-alt")) {
        if (!tapDown) tapCount ++;
        tapDown = true;
        setTimeout(()=>{
          tapCount = 0;
        }, timeTapCountReset);
      } else {
        tapDown = false;
      }
      if (tapCount > 1) {
        localPlayer.trySplit();
        tapCount = 0;
        timeLastSplit = Date.now();
      }
    }


    renderer.setNeedsRedraw(true);
  });

  timer.listen(2, (enlapsed)=>{
    for (let p of Player.all) {
      for (let b of p.blobs) {
        b.refreshJiggle();
      }
    }
  });

  let min = new Vec2();
  let max = new Vec2();

  timer.listen(1/4, ()=>{
    max.set(renderer.width, renderer.height);
    Food.spawnRect(min, max, 10);
  });
}
main();

