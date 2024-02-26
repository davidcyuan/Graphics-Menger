import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";


export class Floor {

  dirty: boolean;
  positions: number[];
  normals: number[];
  indices: number[];

  constructor() {
    this.positions = [];
    this.normals = [];
    this.indices = [];
    this.dirty = false;
  }

  public isDirty(): boolean {
       return this.dirty;
  }

  public setClean(): void {
      this.dirty = false;
  }

  public positionsFlat(): Float32Array {
    this.positions.push(1000, -2.0, 1000, 1.0);
    this.positions.push(1000, -2.0, -1000, 1.0);
    this.positions.push(-1000, -2.0, 1000, 1.0);
    this.positions.push(-1000, -2.0, -1000, 1.0);

    this.normals.push(0.0, 1.0, 0.0, 0.0);
    this.normals.push(0.0, 1.0, 0.0, 0.0);
    this.normals.push(0.0, 1.0, 0.0, 0.0);
    this.normals.push(0.0, 1.0, 0.0, 0.0);

                 
    this.indices.push(0, 1, 2);
    this.indices.push(3, 2, 1);
    

    return new Float32Array(this.positions);
  }

  public indicesFlat(): Uint32Array {
    return new Uint32Array(this.indices);
  }

  public normalsFlat(): Float32Array {
	  return new Float32Array(this.normals);
  }

  public uMatrix(): Mat4 {
    const ret : Mat4 = new Mat4().setIdentity();

    return ret;    
  }
  
}
