
import { Vec2 } from "@repcomm/vec2d";

export class Body {
  position: Vec2;
  velocity: Vec2;
  tempVector: Vec2;

  mass: number;
  drag: number;

  changed: {
    mass: boolean;
  }

  constructor () {
    this.position = new Vec2();
    this.velocity = new Vec2();
    this.tempVector = new Vec2();
    this.mass = 1;
    this.drag = 0.2;
    this.changed = {
      mass: true
    };
  }
  setMass (m: number): this {
    this.mass = m;
    this.changed.mass = true;
    return this;
  }
  addMass (m: number): this {
    this.setMass(m + this.mass);
    return this;
  }
  subMass (m: number): this {
    this.setMass(this.mass - m);
    return this;
  }
  /**
   * @param delta value between 0 and 1 (ideally), scales the velocity to add
   */
  update (delta: number = 1) {
    this.tempVector
    .copy(this.velocity)
    .mulScalar(delta);

    this.position.add(this.tempVector);

    this.velocity.mulScalar(0.8);

    // if(this.drag > 0 && delta > 0) this.velocity.divScalar(this.drag * delta);
    // console.log(this.velocity);
  }

}
