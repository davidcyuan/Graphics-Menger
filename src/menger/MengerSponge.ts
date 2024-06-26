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
  //each triangle is 9 points of data
  triangles: number[][];
  triangles_norm: number[][];
  //each normal is 9 copies of data
  normals: number[][];

  //[z][x][y]
  children: Cube[][][];
  has_children: boolean;
  depth: number;

  //
  dirty: boolean;
 
  constructor(min_corn: Float32Array, max_corn: Float32Array, depth: number) {
    this.min_corner = min_corn;
    this.max_corner = max_corn;
    this.length = max_corn[0] - min_corn[0];
    this.triangles = [];
    this.triangles_norm = [];
    

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

    this.dirty = true;
  }

  is_dirty(): boolean{
    return this.dirty;
  }
  set_clean(): void{
    this.dirty = false;
  }
  set_dirty(): void{
    this.dirty = true;
  }
 
  //local x/y are vectors mimicking x/y in square
  private gen_square(bottom_left_corner: number[], local_x: number[], local_y: number[], norm: number[]): [number[][][], number[][][]]{
    //2 triangles, 3 points each, 3 dimensions each, 2x3x3
    var square: number[][][] = [];
    var square_normal: number[][][] = [];
    
    // 3 points, 3 dimensions each, 3x3
    var triangle_left: number[][] = [];
    var bottom_corner: number[] = [bottom_left_corner[0], bottom_left_corner[1], bottom_left_corner[2]];
    var top_corner: number[] = [bottom_corner[0] + local_y[0], bottom_corner[1] + local_y[1], bottom_corner[2] + local_y[2]];
    var top_right_corner: number[] = [top_corner[0] + local_x[0], top_corner[1] + local_x[1], top_corner[2] + local_x[2]];
    triangle_left[0] = bottom_corner;
    triangle_left[1] = top_corner;
    triangle_left[2] = top_right_corner;
    var triangle_left_norm: number[][] = [];
    triangle_left_norm[0] = norm;
    triangle_left_norm[1] = norm;
    triangle_left_norm[2] = norm;

    var triangle_right: number[][] = [];
    var right_bottom_corner = bottom_corner;
    var right_top_right_corner = top_right_corner;
    var right_right_corner = [right_bottom_corner[0] + local_x[0], right_bottom_corner[1] + local_x[1], right_bottom_corner[2] + local_x[2]];
    triangle_right[0] = right_bottom_corner;
    triangle_right[1] = right_top_right_corner;
    triangle_right[2] = right_right_corner;
    var triangle_right_norm: number[][] = [];
    triangle_right_norm[0] = norm;
    triangle_right_norm[1] = norm;
    triangle_right_norm[2] = norm;
    
    square[0] = triangle_left;
    square[1] = triangle_right;
    square_normal[0] = triangle_left_norm;
    square_normal[1] = triangle_left_norm;


    return [square, square_normal];
  }

  //turn [3xpoint][3xdimension] => [9xnumbers]
  private flatten_triangle(triangle: number[][]): number[]{
    var flat_triangle: number[] = [];

    for(var point: number=0; point<3; point++){
      flat_triangle[point * 3] = triangle[point][0];
      flat_triangle[point * 3 + 1] = triangle[point][1];
      flat_triangle[point * 3 + 2] = triangle[point][2];
    }

    return flat_triangle;
  }

  private push_square(square: number[][][]): void{
    var flat_left_triangle = this.flatten_triangle(square[0]);
    this.triangles.push(flat_left_triangle);

    var flat_right_triangle = this.flatten_triangle(square[1]);
    this.triangles.push(flat_right_triangle);
  }
  private push_square_norm(square_norm: number[][][]): void{
    var flat_left_triangle_norm = this.flatten_triangle(square_norm[0]);
    this.triangles_norm.push(flat_left_triangle_norm);

    var flat_right_triangle_norm = this.flatten_triangle(square_norm[1]);
    this.triangles_norm.push(flat_right_triangle_norm);
  }

  private gen_triangles(): void{
    //three points, 3 dimensions per point = 9 numbers / triangle
    //here, [x][y][z]. with children, [z][x][y]

    //front face, starting corner is [0][0][0]
    var front_local_x: number[] = [this.length, 0, 0];
    var front_local_y: number[] = [0, this.length, 0];
    //norm = - local z
    var front_norm: number[] = [0, 0, -1];
    var front_bottom_left_corner: number[] = [this.min_corner[0], this.min_corner[1], this.min_corner[2]];
    var front_square: number[][][];
    var front_square_norm: number[][][];
    [front_square, front_square_norm]= this.gen_square(front_bottom_left_corner, front_local_x, front_local_y, front_norm);
    // console.log(front_square_norm);
    this.push_square(front_square);
    this.push_square_norm(front_square_norm);
    


    //right face, starting corner is [1][0][0]
    var right_local_x: number[] = [0, 0, this.length];
    var right_local_y: number[] = [0, this.length, 0];
    //norm = +x
    var right_norm: number[] = [1, 0, 0];
    var right_bottom_left_corner: number[] = [this.min_corner[0] + this.length, this.min_corner[1], this.min_corner[2]];
    var right_square: number[][][];
    var right_square_norm: number[][][];
    [right_square, right_square_norm] = this.gen_square(right_bottom_left_corner, right_local_x, right_local_y, right_norm);
    this.push_square(right_square);
    this.push_square_norm(right_square_norm);

    //left face, starting corner [0][0][1]
    var left_local_x: number[] = [0, 0, -1*this.length];
    var left_local_y: number[] = [0, this.length, 0];
    //norm = -x
    var left_norm: number[] = [-1, 0, 0];
    var left_bottom_left_corner: number[] = [this.min_corner[0], this.min_corner[1], this.min_corner[2] + this.length];
    var left_square: number[][][];
    var left_square_norm: number[][][];
    [left_square, left_square_norm] = this.gen_square(left_bottom_left_corner, left_local_x, left_local_y, left_norm);
    this.push_square(left_square);
    this.push_square_norm(left_square_norm);

    //top face, starting corner [0][1][1]
    var top_local_x: number[] = [0, 0, -1*this.length];
    var top_local_y: number[] = [this.length, 0, 0];
    //top norm = +y
    var top_norm: number[] = [0, 1, 0];
    var top_bottom_left_corner: number[] = [this.min_corner[0], this.min_corner[1] + this.length, this.min_corner[2] + this.length];
    var top_square: number[][][];
    var top_square_norm: number[][][];
    [top_square, top_square_norm] = this.gen_square(top_bottom_left_corner, top_local_x, top_local_y, top_norm);
    this.push_square(top_square);
    this.push_square_norm(top_square_norm);

    //bottom face, starting corner [0][0][0]
    var bottom_local_x: number[] = [0, 0, this.length];
    var bottom_local_y: number[] = [this.length, 0, 0];
    //bottom norm = -y
    var bottom_norm = [0, -1, 0];
    var bottom_bottom_left_corner: number[] = [this.min_corner[0], this.min_corner[1], this.min_corner[2]];
    var bottom_square: number[][][];
    var bottom_square_norm: number[][][];
    [bottom_square, bottom_square_norm] = this.gen_square(bottom_bottom_left_corner, bottom_local_x, bottom_local_y, bottom_norm);
    this.push_square(bottom_square);
    this.push_square_norm(bottom_square_norm);

    //back face, starting corner [0][1][1]
    var back_local_x: number[] = [this.length, 0, 0];
    var back_local_y: number[] = [0, -1*this.length, 0];
    //back norm +z
    var back_norm: number[] = [0, 0, -1];
    var back_bottom_left_corner: number[] = [this.min_corner[0], this.min_corner[1] + this.length, this.min_corner[2] + this.length];
    var back_square: number[][][];
    var back_square_norm: number[][][];
    [back_square, back_square_norm] = this.gen_square(back_bottom_left_corner, back_local_x, back_local_y, back_norm);
    this.push_square(back_square);
    this.push_square_norm(back_square);
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
            if(z != 0 && false){}
            else{
              //center, so don't render
              if(x==1&&y==1 || x==1&&z==1 || y==1&&z==1){}
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

  flatten_norms(): Float32Array{
    var flattened_norms: number[] = [];

    //return this cube's vertices
    if(this.has_children == false){
      //triangle is a 9-length float32 array
      for(var triangle of this.triangles_norm){
        
        let counter = 0;
        for(var num of triangle){
          flattened_norms.push(num);
          counter = counter + 1;
          if(counter > 0 && counter%3 == 0){
            flattened_norms.push(0);
          }
        }
      }
    }
    //get vertices from children
    else{
      // console.log("should not be here");
      for(var z: number = 0; z<3; z++){
        for(var x: number = 0;x<3;x++){
          for(var y: number = 0;y<3;y++){
            //skipping non-z's for now
            if(z != 0 && false){}
            else{
              //center, so don't render
              if(x==1&&y==1 || x==1&&z==1 || y==1&&z==1){}
              else{
                var child_flatten_norms: Float32Array = this.children[z][x][y].flatten_norms();
                for(var num of child_flatten_norms){
                  flattened_norms.push(num);
                }
              }
            }
          }
        }
      }
    }
    
    return new Float32Array(flattened_norms);
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
            if(z != 0 && false){}
            else{
              //center, so don't render
              if(x==1&&y==1 || x==1&&z==1 || y==1&&z==1){}
              else{
                var child_flatten_indices: Uint32Array = this.children[z][x][y].flatten_indices();
                for(var index of child_flatten_indices){
                  flattened_indices.push(counter);
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
          // this.children[z][x][y].gen_triangles();
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
  level: number;

  // TODO: sponge data structures
  
  constructor(level: number) {
	  

    // var min_corn = new Float32Array(3);
    // min_corn[0] = -0.5;
    // min_corn[1] = -0.5;
    // min_corn[2] = -0.5;
    // var max_corn = new Float32Array(3);
    // max_corn[0] = 0.5;
    // max_corn[1] = 0.5;
    // max_corn[2] = 0.5;
    // this.test_cube = new Cube(min_corn, max_corn, level);
    this.setLevel(level);
  }

  /**
   * Returns true if the sponge has changed.
   */
  public isDirty(): boolean {
    return this.test_cube.is_dirty();
  }

  public setClean(): void {
    this.test_cube.set_clean();
  }
  
  public setLevel(level: number): void
  {
    this.level = level;
    var min_corn = new Float32Array(3);
    min_corn[0] = -0.5;
    min_corn[1] = -0.5;
    min_corn[2] = -0.5;
    var max_corn = new Float32Array(3);
    max_corn[0] = 0.5;
    max_corn[1] = 0.5;
    max_corn[2] = 0.5;
    this.test_cube = new Cube(min_corn, max_corn, level);
	  this.test_cube.set_dirty();
  }

  /* Returns a flat Float32Array of the sponge's vertex positions */
  public positionsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
    //  console.log("PositionsFlat: "+this.test_cube.flatten_vertices().length);
     return this.test_cube.flatten_vertices();
  }

  /**
   * Returns a flat Uint32Array of the sponge's face indices
   */
  public indicesFlat(): Uint32Array {
    // TODO: right now this makes a single triangle. Make the cube fractal instead.
    // return new Uint32Array([0, 1, 2]);
    // console.log("indicesFlat: " + this.test_cube.flatten_indices().length);
    return this.test_cube.flatten_indices();
  }

  /**
   * Returns a flat Float32Array of the sponge's normals
   */
  public normalsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
    //not used right now
    // var flattened_normals: number[] = [];
    // for(var a: number = 0; a<2880;a++){
    //   flattened_normals.push(0.0);
    // }
    // console.log("normalsFlat: " + flattened_normals.length);
	  // return new Float32Array(flattened_normals);
    // console.log("PositionsNorm: "+this.test_cube.flatten_norms());
    return this.test_cube.flatten_norms();
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
