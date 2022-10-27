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

float sinSource(vec2 origin, float frequency, float phase, vec2 point) {
    float t = distance(origin, point);

    return sin(TAU * (frequency * t - phase) - u_time);
}

float swell(vec2 uv) {
  float sum = 0.0;

  // Hack to rotate SDF instead of orbiting camera
  float theta = u_time / 5.0;
  mat2 rot = mat2(
      cos(theta), -sin(theta),
      sin(theta), cos(theta)
  );

  for (int i = -COUNT_RADIUS; i < COUNT_RADIUS; ++i) {
      sum += sinSource(rot * vec2(100*i, 0.0), 0.01, sin(u_time / 5.0), uv);
  }

  for (int i = -COUNT_RADIUS; i < COUNT_RADIUS; ++i) {
      sum += sinSource(rot * vec2(0.0, 100*i), 0.01, cos(u_time / 5.0), uv);
  }

  return sum;
}

vec2 texCoords(vec3 p) {
  return p.xy;
}

float floorSDF(vec3 p) {
  vec2 uv = texCoords(p);
  float swellHeight = swell(uv) * 3.0;

  return dot(p, vec3(0, 0, 1)) + 0.0 - swellHeight;
}

float sceneSDF(vec3 p) {
  return floorSDF(p);
}

vec3 sceneNormal(vec3 p) {
  vec2 e = vec2(EPSILON, 0.0);

  return normalize(
      vec3(
        sceneSDF(p + e.xyy),
        sceneSDF(p + e.yxy),
        sceneSDF(p + e.yyx)
      )
  );
}

vec3 colorSin(float value) {
    vec3 preNormal =  vec3(
        sin(value),
        sin(value - TAU/3.0),
        sin(value - 2.0 * TAU/3.0)
    );
    
    return 2.0 * preNormal - 1.0;
}

vec3 colorFor(vec2 uv) {
  float intensity = swell(uv);

  float envelope = 1.0 / (1.0 + exp(pow(length(uv) / 300.0, 2.0)));

  vec3 saturated = colorSin(envelope * intensity);
  vec3 desaturated = vec3(intensity / 6.0) + 0.15 * saturated;

  float brightness = smoothstep(100.0 / length(uv), 0.0, 0.15);

  return brightness * desaturated;
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

  vec3 ro = vec3(-200.0, 0.0, 80.0 + 40.0 * sin(u_time / 3.0));

  float rTheta = -3.1415/(5.0 + sin(u_time / 3.0));
  mat3 rot = mat3(
      cos(rTheta), 0, sin(rTheta),
      0, 1, 0,
      -sin(rTheta), 0, cos(rTheta)
  );

  float cameraX = u_resolution.y / tan(radians(120.0) / 2.0);
  vec3 rdn = normalize(rot * vec3(cameraX, xy.x, xy.y));

  vec3 light = vec3(-10.0, 0, 4);

  float dist = trace(ro, rdn);

  if (dist < MAX_DIST) {
    vec3 pos = ro + dist * rdn;
    vec2 uv = texCoords(pos);
    vec3 normal = sceneNormal(pos);

    vec4 color = vec4(colorFor(uv), 1.0);

    gl_FragColor = color;

    return;
  }

  gl_FragColor = vec4(vec3(0.0), 1.0);
}
