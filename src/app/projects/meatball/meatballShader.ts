import { glsl } from "../../../../scripts/galleryShared";

export const meatballShader = glsl`
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform int u_mode;
uniform vec2 u_viewRotation;
uniform vec3 u_cameraPos;
uniform float u_size;

varying vec2 vUv;

const int MAX_STEPS = 100;
const float MAX_DIST = 100.0;
const float SURF_DIST = 0.00076;
const float ITERATIONS = 10.0;

// --- Oklab Colors Helper Functions ---
// (Source: Björn Ottosson, https://bottosson.github.io/posts/oklab/)

vec3 linear_srgb_to_oklab(vec3 c) {
    float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

    float l_ = pow(l, 1.0/3.0);
    float m_ = pow(m, 1.0/3.0);
    float s_ = pow(s, 1.0/3.0);

    return vec3(
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    );
}

vec3 oklab_to_linear_srgb(vec3 c) {
    float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
    float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
    float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    return vec3(
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

// --- Thank you for the help, Björn! ---

mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, -c);
}

// --- Easing Functions ---
float applyEasing(float t, int mode) {
    if (mode == 0) return t; // Linear (Default)
    if (mode == 1) return t * t; // Ease In (Quadratic)
    if (mode == 2) return t * t * t * t; // Ease In (Quartic - Strong)
    if (mode == 3) return 1.0 - (1.0 - t) * (1.0 - t); // Ease Out (Quadratic)
    if (mode == 4) return pow(t, 0.5); // Square Root (Log-like)
    if (mode == 5) return 1.0 - (1.0 / (1.0 + t * 10.0)); // Inverse / 1/x style (Compressed at end)

    return t;
}

// Mix two colors in Oklab space for better gradients
vec3 mixOklab(vec3 colA, vec3 colB, float t) {
    vec3 okA = linear_srgb_to_oklab(colA);
    vec3 okB = linear_srgb_to_oklab(colB);
    vec3 okMix = mix(okA, okB, t);
    
    return oklab_to_linear_srgb(okMix);
}

//  SDF
vec2 GetDist(vec3 p) {
    // Kelvin Transform (Evil)
    float k = 1.0;
    float r2 = dot(p, p);

    if (r2 > 0.000001) {
        p = p / r2 * k;
    }

    vec3 z = p;
    float dr = 1.0;
    float r = 0.0;
    
    float iterCount = 0.0;
    
    float Power = u_size + (0.1 * sin(u_time * 0.1)); 

    for (int i = 0; i < int(ITERATIONS); i++) {
        r = length(z);
        if (r > 2.0) break;

        iterCount = float(i); // For color: track iteration

        // Convert to polar coordinates
        float theta = acos(z.y / r);
        float phi = atan(z.z, z.x);
        
        dr = pow(r, Power - 1.0) * Power * dr + 1.0; // Derivative
        
        // Scale and rotate
        float zr = pow(r, Power);
        theta = theta * Power;
        phi = phi * Power;
        
        // Convert back to Cartesian coordinates
        z = zr * vec3(sin(theta) * cos(phi), cos(theta), sin(theta) * sin(phi));
        z += p;
    }
    
    float orbitFactor = iterCount / ITERATIONS; // Normalize

    float mandelbulbDist = 0.5 * log(r) * r / dr;
    mandelbulbDist *= r2 / k;

    return vec2(mandelbulbDist, orbitFactor);
}

//  Raymarching
float RayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0; // Distance Origin
    
    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = GetDist(p).x; // Distance to Scene
        dO += dS;
        if(dO > MAX_DIST || dS < SURF_DIST) break;
    }
    
    return dO;
}

// Normal Calculation
vec3 GetNormal(vec3 p) {
    float d = GetDist(p).x;
    vec2 e = vec2(0.001, 0);
    
    vec3 n = d - vec3(
        GetDist(p-e.xyy).x,
        GetDist(p-e.yxy).x,
        GetDist(p-e.yyx).x
    );
    
    return normalize(n);
}

// Light Calculation
float GetLight(vec3 p, vec3 ro) {
    vec3 n = GetNormal(p); // Normal
    float totalDif = 0.0;

    // 1st Light
    vec3 lightPos1 = ro;
    float dist = length(lightPos1 - p);
    vec3 l1 = normalize(lightPos1 - p);
    float atten = 1.0 / (1.0 + dist * 0.5);
    float dif1 = clamp(dot(n, l1), 0.0, 1.0) * atten;
    
    // 1st Shadow
    float d1 = RayMarch(p + n * SURF_DIST * 4.0, l1);
    if(d1 < dist) dif1 *= 0.1;
    
    totalDif += dif1;

    totalDif += 0.1; // Ambient light

    return totalDif;
}

void main() {
    vec2 uv = vUv - 0.5;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    vec3 ro = u_cameraPos; // Avoid singularity at origin
    
    vec3 forward = vec3(0, 0, 1); // Default look forward Z+
    vec3 upRef = vec3(0, 1, 0);
    
    forward.yz *= rot(-u_viewRotation.y); // Pitch
    forward.xz *= rot(-u_viewRotation.x); // Yaw

vec3 right = cross(upRef, forward);
    if (length(right) < 0.001) {
        // Fallback right vector if Looking straight Up/Down
        right = normalize(cross(vec3(0,0,1), forward)); 
    } else {
        right = normalize(right);
    }    
    
    vec3 up = cross(forward, right);
    
    vec3 rd = normalize(forward + uv.x * right + uv.y * up);

    float d = RayMarch(ro, rd); // Raymarch
    vec3 col = vec3(0);
    
    if(d < MAX_DIST) {
        vec3 p = ro + rd * d;
        
        vec2 materialData = GetDist(p);
        float t = materialData.y;

        t = applyEasing(t, u_mode);
        t = floor(t * ITERATIONS) / ITERATIONS; // Stepping (Quantize the gradient)

        vec3 albedo = mixOklab(u_colorA, u_colorB, t);
        float lighting = GetLight(p, ro);

        col = albedo * lighting;
    } else {
        // Background
        col = vec3(0.02, 0.02, 0.03) + 0.1 * vUv.y; // Simple gradient background
    }

    // Gamma correction
    col = pow(col, vec3(1.0/2.2));
    gl_FragColor = vec4(col, 1.0);
}
`;