
import { Vec2 } from "@repcomm/vec2d";
import { lerp } from "@repcomm/vec2d/lib/vec";
import { arrow } from "./helpers";
import { smoothNoise } from "./math";
import { Player } from "./player";

//r = √(A / π)
const areaToRadius = (area: number): number => {
  return Math.sqrt(area / Math.PI);
}

export class Blob {
  static MIN_SIZE: number;
  static MIN_SPLIT_MULTIPLIER: number
  player: Player;
  
  position: Vec2;

  velocity: Vec2;

  mass: number;
  cachedRadius: number;
  resolution: number;

  jiggle: Array<number>;
  nextJiggle: Array<number>;
  jiggleSeed: number;

  playerMoveVector: Vec2;

  constructor (player: Player) {
    this.player = player;
    
    this.position = new Vec2();
    this.velocity = new Vec2();

    this.mass = 1;
    this.resolution = 64;
    this.jiggle = new Array(this.resolution);
    this.jiggle.fill(0);
    this.nextJiggle = new Array(this.resolution);
    this.nextJiggle.fill(0);

    this.jiggleSeed = Math.random()*20;

    this.cachedRadius = undefined;
    this.refreshJiggle();

    this.playerMoveVector = new Vec2();
  }
  update () {
    let dist = this.position.distance(this.player.focus);

    if (dist < 2) {
      this.playerMoveVector.copy(this.player.focus);
    } else {
      this.playerMoveVector.lerp(
        this.player.focus,
        this.getMaxSpeed() * (1/dist)
      );
    }
    this.position.add(this.velocity);
    this.velocity.divScalar(10);
  }
  getMaxSpeed (): number {
    return (1/this.mass) * 10000;
  }
  moveToward (f: Vec2): this {
    this.playerMoveVector
    .copy(this.position)
    .sub(f)
    .normalize()
    .mulScalar(this.getMaxSpeed());

    this.velocity.sub(this.playerMoveVector);

    return this;
  }
  canEat (other: Blob): boolean {
    return other.mass * 1.05 < this.mass;
  }
  setMass (m: number): this {
    this.mass = m;
    this.cachedRadius = undefined;
    return this;
  }
  addMass (m: number): this {
    this.mass += m;
    this.cachedRadius = undefined;
    return this;
  }
  subMass (m: number): this {
    this.mass -= m;
    this.cachedRadius = undefined;
    return this;
  }
  refreshJiggle () {
    this.jiggleSeed += 32;
    if (this.jiggle.length !== this.resolution) {
      this.jiggle.length = this.resolution+1;
      this.nextJiggle.length = this.resolution+1;
    }
    for (let i=0; i<this.resolution; i++) {
      this.nextJiggle[i] = smoothNoise(
        this.jiggleSeed +
        (
          (i/this.resolution)
          * 20
        )
      ) * 3;
    }
  }
  smoothJiggle () {
    for (let i=0; i<this.resolution; i++) {
      this.jiggle[i] = lerp(this.jiggle[i], this.nextJiggle[i], 0.1);
    }
  }
  render (ctx: CanvasRenderingContext2D) {
    this.smoothJiggle();
    //so we don't have to run Math.sqrt a zillion times per second
    if (this.cachedRadius === undefined) {
      this.cachedRadius = areaToRadius(this.mass);
    }

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    ctx.beginPath();

    let rx = 0;
    let ry = 0;
    let theta = 0;

    let radius = 0;

    for (let i=0; i<this.resolution; i++) {
      radius = this.cachedRadius + this.jiggle[i];

      theta = (i/this.resolution) * Math.PI * 2;

      rx = Math.sin(theta) * radius;
      ry = Math.cos(theta) * radius;

      if (i===0) {
        ctx.moveTo(rx, ry);
      } else {
        ctx.lineTo(rx, ry);
      }
    }

    ctx.closePath();
    
    ctx.fillStyle = this.player.color;

    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "white";

    ctx.stroke();
    
    ctx.restore();

    arrow(ctx, this.position, this.velocity, 100);
  }
}
Blob.MIN_SIZE = 1000;
Blob.MIN_SPLIT_MULTIPLIER = 2.1;

