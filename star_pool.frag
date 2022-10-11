#define MAX_DIST 100.0
#define MAX_STEPS 255
#define EPSILON 0.0001

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

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 xy = fragCoord - iResolution.xy / 2.0;
  vec3 ro = vec3(0.0, 0.0, 0.1);
  vec3 rdn = normalize(vec3(0, xy.x, -xy.y));

  float dist = trace(ro, rdn);

  if (dist < MAX_DIST) {
    fragColor = vec4(vec3(1.0), 1.0);

    return;
  }

  fragColor = vec4(vec3(0.0), 1.0);
}
