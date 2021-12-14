
import { Vec2 } from "@repcomm/vec2d";
import { Blob } from "./blob";

export interface PlayerCreateOptions {
  color: string;
  name: string;
  isLocal: boolean;
}


let bDistOther = 0;
let overlapAmount = 0;
let bDirOther = new Vec2();
let bMove = new Vec2();
let combinedRadiuses: number = 0;

export class Player implements PlayerCreateOptions {
  static all: Set<Player>;
  static MAX_BLOBS: number;
  isLocal: boolean;
  name: string;
  color: string;

  blobs: Set<Blob>;

  focus: Vec2;

  addVelocity: Vec2;
  spawnPosition: Vec2;

  debugDraw: boolean;

  constructor(opts: PlayerCreateOptions) {
    this.blobs = new Set();
    this.name = opts.name;
    this.isLocal = opts.isLocal;
    this.color = opts.color;

    this.focus = new Vec2();
    this.addVelocity = new Vec2();
    this.spawnPosition = new Vec2();

    this.debugDraw = true;

    Player.all.add(this);
  }
  getCenter(out: Vec2) {
    out.set(0, 0);
    let length = 0;
    for (let b of this.blobs) {
      length++;
      out.add(b.position);
    }
    out.divScalar(length);
  }
  spawn(): Blob {
    let blob = new Blob(this);
    // this.getCenter(blob.position);
    this.blobs.add(blob);
    return blob;
  }
  getSplitCandidates(): Blob[] {
    let result: Blob[] = undefined;
    for (let b of this.blobs) {
      if (b.mass > Blob.MIN_SIZE * Blob.MIN_SPLIT_MULTIPLIER) {
        if (result === undefined) result = [];
        result.push(b);
      }
    }
    return result;
  }
  setFocus(x: number, y: number): this {
    this.focus.set(x, y);
    return this;
  }
  split(...bs: Blob[]) {
    if (bs.length === 1) {
      bs[0].timeSpawn = Date.now();
    }
    for (let b of bs) {
      let hm = b.mass / 2;
      b.subMass(hm);
      // b.velocity.mulScalar(2);

      let nb = this.spawn();
      nb.setMass(hm);
      nb.velocity.copy(b.velocity);

      this.addVelocity
      .copy(this.focus)
      .sub(b.position)
      .normalize()
      .mulScalar(40);

      nb.velocity.add(this.addVelocity);
      // b.velocity.copy(nb.velocity);

      nb.calculateCachedRadius();
      b.calculateCachedRadius();

      this.spawnPosition
      .copy(this.focus)
      .sub(b.position)
      .normalize()
      .mulScalar((nb.cachedRadius + b.cachedRadius) * 1.1)
      .add(b.position);


      nb.position.copy(this.spawnPosition);
      
    }
  }
  trySplit() {
    if (this.blobs.size < Player.MAX_BLOBS) {
      let candidate = this.getSplitCandidates();
      if (candidate) {
        this.split(...candidate);
      } else {
        return;
      }
    }
  }
  /**code that provides merging*/
  passMerge (b: Blob) {
    for (let other of this.blobs) {
      //no self merging
      if (other === b) continue;

      bDistOther = b.position.distance(other.position);
      combinedRadiuses = b.cachedRadius + other.cachedRadius;

      if (
        b.isMergable// && other.isMergable
      ) {
        if (bDistOther < combinedRadiuses/2) {
          b.merge(other);
        }
        continue;
      }

      overlapAmount = combinedRadiuses - bDistOther;

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
  }
}

Player.all = new Set();
Player.MAX_BLOBS = 16;
function arrow(ctx: any, position: Vec2, bDirOther: Vec2, arg3: number, arg4: string) {
  throw new Error("Function not implemented.");
}

