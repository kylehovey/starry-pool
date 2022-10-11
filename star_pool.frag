#define MAX_DIST 1000.0
#define MAX_STEPS 500
#define EPSILON 0.001

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float floorSDF(vec3 p) {
  return dot(p, vec3(0, 0, 1)) + 1.0;
}

float sceneSDF(vec3 p) {
  return floorSDF(p);
}


float trace(vec3 ro, vec3 rdn) {
  float depth = 0.0;

  for (int i = 0; i < MAX_STEPS; ++i) {
    float dist = sceneSDF(ro + depth * rdn);

    if (dist < EPSILON) return depth;

    depth += dist;

    if (depth > MAX_DIST) break;
  }

  return MAX_DIST;
}

void main(void) {
  vec2 xy = gl_FragCoord.xy - u_resolution.xy / 2.0;

  vec3 ro = vec3(0.0, 0.0, 1.0);

  float cameraX = u_resolution.y / tan(radians(45.0) / 2.0);
  vec3 rdn = normalize(vec3(cameraX, xy.x, xy.y));

  float dist = trace(ro, rdn);

  if (dist < MAX_DIST) {
    float intensity = smoothstep(dist / 10.0, 0.0, 1.0);

    gl_FragColor = vec4(vec3(intensity), 1.0);

    return;
  }

  gl_FragColor = vec4(vec3(0.0), 1.0);
}
