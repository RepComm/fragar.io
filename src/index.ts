import { Drawing, EXPONENT_CSS_BODY_STYLES, EXPONENT_CSS_STYLES, Panel } from "@repcomm/exponent-ts";
import { GameInput } from "@repcomm/gameinput-ts";
import { Vec2 } from "@repcomm/vec2d";
import { arrow } from "./helpers";
import { smoothNoise } from "./math";
import { Player } from "./player";
import { Timer } from "./timer";

EXPONENT_CSS_BODY_STYLES.mount(document.head);
EXPONENT_CSS_STYLES.mount(document.head);

async function main() {
  const container = new Panel()
  .setId("container")
  .mount(document.body);

  let bDistOther = 0;
  let overlapAmount = 0;
  let bDirOther = new Vec2();
  let bMove = new Vec2();

  const renderer = new Drawing({desynchronized: true, alpha: false})
  .setId("canvas")
  .setHandlesResize(true)
  .addRenderPass((ctx)=>{
    for (let p of Player.all) {      
      for (let b of p.blobs) {
        b.render(ctx);

        b.moveToward(p.focus);

        for (let other of p.blobs) {
          if (other === b) continue;
          bDistOther = b.position.distance(other.position);
          
          overlapAmount = (b.cachedRadius + other.cachedRadius) - bDistOther;

          if (overlapAmount > 0) {
            
            //fix b position
            bDirOther
            .copy(b.position)
            .sub(other.position)
            .normalize();

            
            bMove
            .copy(bDirOther)
            .mulScalar(overlapAmount / 2);
            
            b.position.add(bMove);

            arrow(ctx, b.position, bDirOther, 50, "yellow");


            //fix other position
            bDirOther
            .copy(other.position)
            .sub(b.position)
            .normalize();

            bMove
            .copy(bDirOther)
            .mulScalar(overlapAmount / 2);

            other.position.add(bMove);
          }
        }

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

  const random = {
    byte: ()=>Math.floor(Math.random() * 255),
    color: ()=>`rgb(${random.byte()},${random.byte()},${random.byte()})`
  };

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

  timer.listen(30, (enlapsed)=>{
    localPlayer.setFocus(
      input.raw.getPointerX(),
      input.raw.getPointerY()
    );

    renderer.setNeedsRedraw(true);
  });

  timer.listen(2, (enlapsed)=>{
    for (let p of Player.all) {
      for (let b of p.blobs) {
        b.refreshJiggle();
      }
    }
    if (input.getButtonValue("split")) {
      localPlayer.trySplit();
    }
  });
}
main();
