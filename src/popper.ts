
import { Vec2 } from "@repcomm/vec2d";
import { areaToRadius, lerp, random } from "./math";
import { Blob } from "./blob";

export class Popper {
  static all: Set<Popper>;
  static unused: Array<Popper>;
  static currentSelection: Set<Popper>;
  static MIN_MASS: number;
  static RESOLUTION: number;
  static FILLSTYLE: string;
  static STROKESTYLE: string;

  static spawnPosition: Vec2;

  position: Vec2;
  mass: number;
  radius: number;

  constructor() {
    this.position = new Vec2();
    this.mass = Math.floor(Popper.MIN_MASS);
    this.radius = areaToRadius(this.mass);
  }
  static getUnused(): Popper {
    if (Popper.unused.length < 1) {
      return new Popper();
    } else {
      return Popper.unused.pop();
    }
  }
  static spawn(pos?: Vec2): Popper {
    let f = Popper.getUnused();

    if (pos) f.position.copy(pos);

    Popper.all.add(f);

    return f;
  }
  static despawn(f: Popper) {
    this.unused.push(f);
    Popper.all.delete(f);
  }
  static render(ctx: CanvasRenderingContext2D) {
    for (let f of Popper.all) {
      ctx.save();

      ctx.beginPath();
      ctx.translate(f.position.x, f.position.y);

      let radius = 0;
      let spikeRadius = 5;
      let theta = 0;
      let rx = 0;
      let ry = 0;
      for (let i = 0; i < Popper.RESOLUTION; i++) {
        // radius = this.cachedRadius + this.jiggle[i];
        radius = f.radius + (i % 2 === 0 ? -spikeRadius : spikeRadius);

        theta = (i / Popper.RESOLUTION) * Math.PI * 2;

        rx = Math.sin(theta) * radius;
        ry = Math.cos(theta) * radius;

        if (i === 0) {
          ctx.moveTo(rx, ry);
        } else {
          ctx.lineTo(rx, ry);
        }
      }
      ctx.closePath();
      ctx.fillStyle = Popper.FILLSTYLE;
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = Popper.STROKESTYLE;
      ctx.stroke();

      ctx.restore();
    }
  }
  static selectPoppersInCircle(point: Vec2, radius: number) {
    Popper.currentSelection.clear();
    for (let f of Popper.all) {
      if (f.position.distance(point) < radius) {
        Popper.currentSelection.add(f);
      }
    }
  }
  static pop(blob: Blob) {
    Popper.selectPoppersInCircle(blob.position, blob.cachedRadius);
    for (let f of Popper.currentSelection) {
      if (blob.canSplit) {
        Popper.despawn(f);
        blob.addMass(f.mass/2);

        if (blob.player.canSplit) {
          blob.player.split(blob);
        }
      }
      
    }
  }
  static spawnRect(min: Vec2, max: Vec2, count: number = 1) {
    for (let i = 0; i < count; i++) {
      Popper.spawnPosition.set(
        lerp(min.x, max.x, Math.random()),
        lerp(min.y, max.y, Math.random())
      );
      Popper.spawn(Popper.spawnPosition);
    }
  }
}

Popper.all = new Set();
Popper.unused = new Array();
Popper.currentSelection = new Set();
Popper.MIN_MASS = 4000;
Popper.spawnPosition = new Vec2();
Popper.RESOLUTION = 32;
Popper.FILLSTYLE = "#38ce00";
Popper.STROKESTYLE = "#1f7300";

