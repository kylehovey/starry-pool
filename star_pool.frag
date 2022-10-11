#define MAX_DIST 100.0
#define MAX_STEPS 255
#define EPSILON 0.0001

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float floorSDF(vec3 ro, vec3 rdn) {
  float cA = dot(rdn, vec3(0, 0, -1));

  return cA * ro.z;
}


float trace(vec3 ro, vec3 rdn) {
  float depth = 0.0;

  for (int i = 0; i < MAX_STEPS; ++i) {
    float dist = floorSDF(ro, rdn);

    if (dist < EPSILON) return depth;

    depth += dist;

    if (depth > MAX_DIST) return MAX_DIST;
  }

  return MAX_DIST;
}

void main(void) {
  vec2 xy = gl_FragCoord.xy - u_resolution.xy / 2.0;
  vec3 ro = vec3(0.0, 0.0, 0.1);
  vec3 rdn = normalize(vec3(0, xy.x, -xy.y));

  float dist = trace(ro, rdn);

  if (dist < MAX_DIST) {
    gl_FragColor = vec4(vec3(1.0), 1.0);

    return;
  }

  gl_FragColor = vec4(vec3(0.0), 1.0);
}
