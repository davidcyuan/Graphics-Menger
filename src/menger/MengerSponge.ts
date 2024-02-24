import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";

/* A potential interface that students should implement */
interface IMengerSponge {
  setLevel(level: number): void;
  isDirty(): boolean;
  setClean(): void;
  normalsFlat(): Float32Array;
  indicesFlat(): Uint32Array;
  positionsFlat(): Float32Array;
}

//pray i know how to make a  typscript class
class Cube {
  //corners[x][y][z]
  min_corner: Float32Array;
  max_corner: Float32Array;
  length: number;
  triangles: Float32Array[];

  //[z][x][y]
  children: Cube[][][];
  has_children: boolean;
  depth: number;
 
  constructor(min_corn: Float32Array, max_corn: Float32Array, depth: number) {
    this.min_corner = min_corn;
    this.max_corner = max_corn;
    this.length = max_corn[0] - min_corn[0];
    this.triangles = [];

    this.children = [];
    this.has_children = false;
    this.depth = depth;

    //are there precision errors?
    if(this.depth <= 1.5){
      this.gen_triangles();
    }
    else{
      this.gen_children();
      this.has_children = true;
    }
  }
 
  private gen_triangles(): void{
    //three points, 3 dimensions per point = 9 numbers / triangle

    //front face

    let triangle_front_left = new Float32Array(9);
    //bottome left point
    triangle_front_left[0] = this.min_corner[0];
    triangle_front_left[1] = this.min_corner[1];
    triangle_front_left[2] = this.min_corner[2];
    //up point
    triangle_front_left[3] = this.min_corner[0];
    triangle_front_left[4] = this.min_corner[1] + this.length;
    triangle_front_left[5] = this.min_corner[2];
    //up right point
    triangle_front_left[6] = this.min_corner[0] + this.length;
    triangle_front_left[7] = this.min_corner[1] + this.length;
    triangle_front_left[8] = this.min_corner[2];
    this.triangles.push(triangle_front_left);

    let triangle_front_right = new Float32Array(9);
    //bottom left point
    triangle_front_right[0] = triangle_front_left[0];
    triangle_front_right[1] = triangle_front_left[1];
    triangle_front_right[2] = triangle_front_left[2];
    //up right point
    triangle_front_right[3] = triangle_front_left[6];
    triangle_front_right[4] = triangle_front_left[7];
    triangle_front_right[5] = triangle_front_left[8];
    //right point
    triangle_front_right[6] = triangle_front_right[0] + this.length;
    triangle_front_right[7] = triangle_front_right[1]
    triangle_front_right[8] = triangle_front_right[2];
    this.triangles.push(triangle_front_right);

    //right face

    let triangle_right_left = new Float32Array(9);
    //bottom left point
    triangle_right_left[0] = this.min_corner[0] + this.length;
    triangle_right_left[1] = this.min_corner[1];
    triangle_right_left[2] = this.min_corner[2];
    //up point
    triangle_right_left[3] = triangle_right_left[0];
    triangle_right_left[4] = triangle_right_left[1] + this.length;
    triangle_right_left[5] = triangle_right_left[2];
    //up right point
    triangle_right_left[6] = triangle_right_left[3];
    triangle_right_left[7] = triangle_right_left[4];
    triangle_right_left[8] = triangle_right_left[5] + this.length;
    this.triangles.push(triangle_front_left);

    let triangle_right_right = new Float32Array(9);
    //bottom left point
    triangle_right_right[0] = triangle_right_left[0];
    triangle_right_right[1] = triangle_right_left[1];
    triangle_right_right[2] = triangle_right_left[2];
    //up right point
    triangle_right_right[3] = triangle_right_left[6];
    triangle_right_right[4] = triangle_right_left[7];
    triangle_right_right[5] = triangle_right_left[8];
    //right point
    

  }

  flatten_vertices(): Float32Array{
    var flattened_vertices: number[] = [];

    //return this cube's vertices
    if(this.has_children == false){
      //triangle is a 9-length float32 array
      for(var triangle of this.triangles){
        let counter = 0;
        for(var num of triangle){
          flattened_vertices.push(num);
          counter = counter + 1;
          if(counter > 0 && counter%3 == 0){
            flattened_vertices.push(1);
          }
        }
      }
    }
    //get vertices from children
    else{
      for(var z: number = 0; z<3; z++){
        for(var x: number = 0;x<3;x++){
          for(var y: number = 0;y<3;y++){
            //skipping non-z's for now
            if(z != 0 ){}
            else{
              //center, so don't render
              if(x == 1 && y == 1){}
              else{
                var child_flatten_vertices: Float32Array = this.children[z][x][y].flatten_vertices();
                for(var num of child_flatten_vertices){
                  flattened_vertices.push(num);
                }
              }
            }
          }
        }
      }
    }

    return new Float32Array(flattened_vertices);
  }

  flatten_indices(): Uint32Array{
    var flattened_indices: number[] = [];
    let counter = 0;

    //return this cube's vertices
    if(this.has_children == false){
      for(var triangle of this.triangles){
        flattened_indices.push(counter);
        flattened_indices.push(counter + 1);
        flattened_indices.push(counter + 2);
        counter = counter+3;
      }
    }
    //calc vertices from children
    else{
      for(var z: number = 0; z<3; z++){
        for(var x: number = 0;x<3;x++){
          for(var y: number = 0;y<3;y++){
            //skipping non-z's for now
            if(z != 0 ){}
            else{
              //center, so don't render
              if(x == 1 && y == 1){}
              else{
                var child_flatten_vertices: Float32Array = this.children[z][x][y].flatten_vertices();
                for(var num of child_flatten_vertices){
                  flattened_indices.push(counter)
                  counter = counter + 1;
                }
              }
            }
          }
        }
      }
    }

    return new Uint32Array(flattened_indices);
  }

  private gen_children(): void{
    var child_length: number = this.length / 3;

    for(var z: number = 0; z <3; z++){
      this.children[z] = [];
      for(var x: number = 0; x<3; x++){
        this.children[z][x] = [];
        for(var y: number = 0; y<3; y++){
          let child_min_corner: Float32Array = new Float32Array(3);
          child_min_corner[0] = this.min_corner[0] + child_length * x;
          child_min_corner[1] = this.min_corner[1] + child_length * y;
          child_min_corner[2] = this.min_corner[2] + child_length * z;

          let child_max_corner: Float32Array = new Float32Array(3);
          child_max_corner[0] = child_min_corner[0] + child_length;
          child_max_corner[1] = child_min_corner[1] + child_length;
          child_max_corner[2] = child_min_corner[2] + child_length;

          this.children[z][x][y] = new Cube(child_min_corner, child_max_corner, this.depth - 1);
          this.children[z][x][y].gen_triangles();
        }
      }
    }
  }

  print_children_mins(): void{
    for(var z: number = 0; z <3; z++){
      for(var x: number = 0; x<3; x++){
        for(var y: number = 0; y<3; y++){
          console.log("z: " + z + " x: " + x + " y: " + y + " mins: " + this.children[z][x][y].min_corner);
        }
      }
    }
  }
}


/**
 * Represents a Menger Sponge
 */
export class MengerSponge implements IMengerSponge {

  test_cube: Cube;

  // TODO: sponge data structures
  
  constructor(level: number) {
	  this.setLevel(level);

    var min_corn = new Float32Array(3);
    min_corn[0] = -0.5;
    min_corn[1] = -0.5;
    min_corn[2] = -0.5;
    var max_corn = new Float32Array(3);
    max_corn[0] = 0.5;
    max_corn[1] = 0.5;
    max_corn[2] = 0.5;
    this.test_cube = new Cube(min_corn, max_corn, 4);
	  // TODO: other initialization	
  }

  /**
   * Returns true if the sponge has changed.
   */
  public isDirty(): boolean {
       return true;
  }

  public setClean(): void {
  }
  
  public setLevel(level: number)
  {
	  // TODO: initialize the cube
  }

  /* Returns a flat Float32Array of the sponge's vertex positions */
  public positionsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
     return this.test_cube.flatten_vertices();
  }

  /**
   * Returns a flat Uint32Array of the sponge's face indices
   */
  public indicesFlat(): Uint32Array {
    // TODO: right now this makes a single triangle. Make the cube fractal instead.
    // return new Uint32Array([0, 1, 2]);
    console.log(this.test_cube.flatten_indices());
    return this.test_cube.flatten_indices();
  }

  /**
   * Returns a flat Float32Array of the sponge's normals
   */
  public normalsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
    //not used right now
	  return new Float32Array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
  }

  /**
   * Returns the model matrix of the sponge
   */
  public uMatrix(): Mat4 {

    // TODO: change this, if it's useful
    const ret : Mat4 = new Mat4().setIdentity();

    return ret;    
  }
  
}
