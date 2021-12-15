
import { Vec2 } from "@repcomm/vec2d";
import { areaToRadius, lerp, random } from "./math";
import { Blob } from "./blob";
import { Body } from "./body";

export class Food extends Body {
  static all: Set<Food>;
  static unused: Array<Food>;
  static currentSelection: Set<Food>;
  static MAX_MASS: number;

  static spawnPosition: Vec2;

  color: string;
  radius: number;

  constructor () {
    super();

    this.init();
  }
  init () {
    this.color = random.color();
    this.mass = Math.floor(Math.random() * Food.MAX_MASS);
    this.radius = areaToRadius(this.mass);
    this.velocity.set(0,0);
  }
  static getUnused (): Food {
    let result: Food;

    if (Food.unused.length < 1) {
      result = new Food();
    } else {
      result = Food.unused.pop();
      result.init(); //reinitialize to remove previous values
    }
    return result;
  }
  static spawn (pos?: Vec2): Food {
    let f = Food.getUnused();

    if (pos) f.position.copy(pos);

    Food.all.add(f);

    return f;
  }
  static despawn (f: Food) {
    this.unused.push(f);
    Food.all.delete(f);
  }
  static render (ctx: CanvasRenderingContext2D) {
    for (let f of Food.all) {
      f.update();
      ctx.save();

      ctx.beginPath();
      ctx.ellipse(f.position.x, f.position.y, f.radius, f.radius, 0, 0, Math.PI*2);
      ctx.closePath();
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.restore();
    }
  }
  static selectFoodInCircle (point: Vec2, radius: number) {
    Food.currentSelection.clear();
    for (let f of Food.all) {
      if (f.position.distance(point) < radius) {
        Food.currentSelection.add(f);
      }
    }
  }
  static consume (blob: Blob) {
    Food.selectFoodInCircle(blob.position, blob.cachedRadius);
    for (let f of Food.currentSelection) {
      Food.despawn(f);
      blob.addMass(200);
    }
  }
  static spawnRect (min: Vec2, max: Vec2, count: number = 20) {
    for (let i=0; i<count; i++) {
      Food.spawnPosition.set(
        lerp(min.x, max.x, Math.random()),
        lerp(min.y, max.y, Math.random())
      );
      Food.spawn(Food.spawnPosition);
    }
  }
}

Food.all = new Set();
Food.unused = new Array();
Food.currentSelection = new Set();
Food.MAX_MASS = 400;
Food.spawnPosition = new Vec2();