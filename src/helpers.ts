import { Vec2 } from "@repcomm/vec2d";

export function arrow (ctx: CanvasRenderingContext2D, center: Vec2, dir: Vec2, scale: number = 1, color: string = "red") {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, 4, 4, 0, 0, Math.PI*2);
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(center.x+(dir.x*scale), center.y+(dir.y*scale));
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}
