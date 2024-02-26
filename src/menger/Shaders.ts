export let defaultVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec4 aNorm;
    
    varying vec4 lightDir;
    varying vec4 normal;   
 
    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    void main () {
		//  Convert vertex to camera coordinates and the NDC
        gl_Position = mProj * mView * mWorld * vec4 (vertPosition, 1.0);
        
        //  Compute light direction (world coordinates)
        lightDir = lightPosition - vec4(vertPosition, 1.0);
		
        //  Pass along the vertex normal (world coordinates)
        normal = aNorm;
    }
`;

// TODO: Write the fragment shader
//           gl_Fragcolor = vec4(1.0, 0.0, 0.0, 1.0);              gl_Fragcolor = vec4(0.0, 1.0, 0.0, 1.0);     gl_Fragcolor = vec4(0.0, 0.0, 1.0, 1.0);
export let defaultFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;
	
    
    void main () {

        float x_mag = abs(normal.x);
        float y_mag = abs(normal.y);
        float z_mag = abs(normal.z);
        float phong_coeff = max(dot(normal, lightDir), 0.0);

        float red_weight = 0.0;
        float green_weight = 0.0;
        float blue_weight = 0.0;

        if(x_mag > y_mag && x_mag > z_mag){
            red_weight = 1.0;
        }
        else if(y_mag > x_mag && y_mag > z_mag){
            green_weight = 1.0;
        }
        else if(z_mag > x_mag && z_mag > y_mag){
            blue_weight = 1.0;
        }
        else{
            
        }
        gl_FragColor = vec4(phong_coeff * red_weight * 1.0, phong_coeff * green_weight * 1.0, phong_coeff * blue_weight * 1.0, 1.0);
    }
`;

// TODO: floor shaders

export let floorVSText = ``;
export let floorFSText = ``;

