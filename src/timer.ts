
export interface TimerCallback {
  desiredFps?: number;
  desiredMillisInterval?: number;
  timeLast?: number;
  (enlapsedTime: number): void;
}

export class Timer {
  private active: boolean;

  private listeners: Set<TimerCallback>;

  private intervalIndex: number;

  private handler: TimerHandler;

  constructor () {
    this.stop();

    this.listeners = new Set();

    let timeNow = 0;
    let enlapsed = 0;

    this.handler = ()=>{
      timeNow = Date.now();

      if (this.active) {
        for (let listener of this.listeners) {
          enlapsed = timeNow - (listener.timeLast||0);
          if (enlapsed > listener.desiredMillisInterval) {
            listener.timeLast = Date.now();
            listener(enlapsed);
          }
        }
      }
    };
  }
  start (baseFps: number = 120) {
    if (this.intervalIndex !== undefined) {
      clearInterval(this.intervalIndex);
    }
    this.intervalIndex = setInterval(this.handler, 1000/baseFps);
    this.active = true;
  }
  stop () {
    if (this.intervalIndex !== undefined) {
      clearInterval(this.intervalIndex);
      this.intervalIndex = undefined;
    }
    this.active = false;
  }
  listen (fps: number, timer: TimerCallback) {
    timer.desiredFps = fps;
    timer.desiredMillisInterval = 1000/fps;
    this.listeners.add(timer);
  }
  deafen (timer: TimerCallback) {
    this.listeners.delete(timer);
  }
  isListening (timer: TimerCallback): boolean {
    return this.listeners.has(timer);
  }
}
