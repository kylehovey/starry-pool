#define TAU 6.28318530718
#define COUNT_RADIUS 2
#define MAX_DIST 1000.0
#define MAX_STEPS 500
#define EPSILON 0.001

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float round(float a) {
  return floor(a + 0.5);
}

float floorSDF(vec3 p) {
  return dot(p, vec3(0, 0, 1)) + 0.0;
}

float sceneSDF(vec3 p) {
  return floorSDF(p);
}

vec2 texCoords(vec3 p) {
  return p.xy;
}

float sinSource(vec2 origin, float frequency, float phase, vec2 point) {
    float t = distance(origin, point);

    return sin(TAU * (frequency * t - phase) - u_time);
}

vec3 colorSin(float value) {
    vec3 preNormal =  vec3(
        sin(value),
        sin(value - TAU/3.0),
        sin(value - 2.0 * TAU/3.0)
    );
    
    return 2.0 * preNormal - 1.0;
}

vec4 colorFor(vec2 uv) {
  float sum = 0.0;

  for (int i = -COUNT_RADIUS; i < COUNT_RADIUS; ++i) {
      sum += sinSource(vec2(100*i, 0.0), 0.02, sin(u_time / 5.0), uv);
  }

  for (int i = -COUNT_RADIUS; i < COUNT_RADIUS; ++i) {
      sum += sinSource(vec2(0.0, 100*i), 0.02, cos(u_time / 5.0), uv);
  }

  float envelope = 1.0 / (1.0 + exp(pow(length(uv) / 300.0, 2.0)));

  vec3 saturated = colorSin(envelope * sum);
  vec3 desaturated = vec3(sum / 6.0) + 0.1 * saturated;

  float brightness = smoothstep(100.0 / length(uv), 0.0, 0.15);

  return vec4(brightness * desaturated, 1.0);
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

  vec3 ro = vec3(-40.0, 0.0, 20.0);

  float cameraX = u_resolution.y / tan(radians(120.0) / 2.0);
  vec3 rdn = normalize(vec3(cameraX, xy.x, xy.y));

  float dist = trace(ro, rdn);

  if (dist < MAX_DIST) {
    vec3 pos = ro + dist * rdn;
    vec2 uv = texCoords(pos);

    vec4 color = colorFor(uv);

    gl_FragColor = color;

    return;
  }

  gl_FragColor = vec4(vec3(0.0), 1.0);
}
