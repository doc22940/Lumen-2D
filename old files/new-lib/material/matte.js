import { Material } from "./material.js";
import { glMatrix, vec2 } from "./../dependencies/gl-matrix-es6.js";

class MatteMaterial extends Material {
    constructor(options) {
        super();

        if(!options) options = { };

        this.opacity = options.opacity || 1;
    }

    computeScattering(ray, input_normal, t, contribution, worldAttenuation) {

        let scatterResult = { };

        // opacity test, if it passes we're going to let the ray pass through the object
        if(Math.random() > this.opacity) {
            let newOrigin = vec2.create();
            vec2.scaleAndAdd(newOrigin, ray.o, ray.d, t * 1.000001);
            vec2.copy(ray.o, newOrigin);

            let dot = Math.abs(  vec2.dot(ray.d, input_normal)  );
            let absorbtionDifference = 1 - dot;
            let opacityDot = dot + absorbtionDifference * (1 - this.opacity);

            contribution *= opacityDot;
            contribution *= Math.exp(-t * worldAttenuation);
            
            scatterResult.contribution = contribution;

            return { contribution: contribution };
        }



        // bounce off again
        let newOrigin = vec2.create();
        vec2.scaleAndAdd(newOrigin, ray.o, ray.d, t * 0.9999999);
    
        // we're going to pick a random point in the hemisphere
        let dot = vec2.dot(ray.d, input_normal);   // ** REMEMBER !! **    the dot between ray.d & normal here is expected to be LESS than zero! 
                                                   //                      that's because the incident light ray should normally be negated before making the dot product
        let normal = vec2.clone(input_normal);
        if(dot > 0.0) {     // if it's greater than zero, we have a problem!  see here ^^^
            vec2.negate(normal, normal);
        }            
        
        let newDirection = vec2.create();
        let nv = normal;
        let nu = vec2.fromValues(-normal[1], normal[0]);

        let angleInHemisphere = Math.random() * Math.PI;
        let nudx = Math.cos(angleInHemisphere) * nu[0];
        let nudy = Math.cos(angleInHemisphere) * nu[1];
        let nvdx = Math.sin(angleInHemisphere) * nv[0];
        let nvdy = Math.sin(angleInHemisphere) * nv[1];

        newDirection[0] = nudx + nvdx;
        newDirection[1] = nudy + nvdy;
        vec2.normalize(newDirection, newDirection);

        vec2.copy(ray.o, newOrigin);
        vec2.copy(ray.d, newDirection);    

        
        dot = Math.abs(  vec2.dot(ray.d, input_normal)  );
        contribution *= dot;
        contribution *= Math.exp(-t * worldAttenuation);
        
        scatterResult.contribution = contribution;
        return { contribution: contribution };
    }
}

export { MatteMaterial }