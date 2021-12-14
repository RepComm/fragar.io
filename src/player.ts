
import { Vec2 } from "@repcomm/vec2d";
import { Blob } from "./blob";

export interface PlayerCreateOptions {
  color: string;
  name: string;
  isLocal: boolean;
}

export class Player implements PlayerCreateOptions {
  static all: Set<Player>;
  static MAX_BLOBS: number;
  isLocal: boolean;
  name: string;
  color: string;

  blobs: Set<Blob>;

  focus: Vec2;

  constructor(opts: PlayerCreateOptions) {
    this.blobs = new Set();
    this.name = opts.name;
    this.isLocal = opts.isLocal;
    this.color = opts.color;

    this.focus = new Vec2();

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
    for (let b of bs) {
      let hm = b.mass / 2;
      b.subMass(hm);

      let nb = this.spawn();
      nb.setMass(hm);
      nb.position.copy(b.position);
      // nb.position.x += 200;
      // nb.position.y += 200;
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
}

Player.all = new Set();
Player.MAX_BLOBS = 16;
