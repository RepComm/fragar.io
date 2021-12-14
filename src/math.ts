
export function lerp (from: number, to: number, by: number): number {
  return from*(1-by)+to*by;
}

export function stringHashCode (str: string): number {
  let hash = 0;
  let i=0;
  let chr: number;

  if (str.length === 0) return hash;

  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export function numberHashCode (num: number): number {
  let hash = 0;
  for (let i=0; i<20; i++) {
    hash  = ((hash << 5) - hash) + num;
    hash |= 0; // Convert to 32bit integer
  }
  hash /= 100000000;

  return hash - Math.floor(hash);;
}

export function isEven (t: number): boolean {
  return Math.floor(t) % 2 === 0;
}

export function smoothNoise (t: number): number {
  let f: number;
  let c: number;

  if (isEven(t)) {
    f = Math.floor(t);
    c = Math.ceil(t+1);
  } else {
    f = Math.floor(t-1);
    c = Math.ceil(t);
  }

  let rf = numberHashCode(f);
  let rc = numberHashCode(c);

  return lerp(rf, rc, Math.cos((t - f) * Math.PI) );
}

