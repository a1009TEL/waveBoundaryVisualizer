#version 300 es
precision mediump float;

uniform float uEta1;
uniform float uEta2;
uniform float uTheta;
uniform float uUIAlpha;

uniform sampler2D uText;

in vec4 vColor;
out vec4 outColor;

float atan2(float y, float x)
{
    float t0, t1, t3, t4;

    t3 = abs(x);
    t1 = abs(y);
    t0 = max(t3, t1);
    t1 = min(t3, t1);
    t3 = 1.0 / t0;
    t3 = t1 * t3;

    t4 = t3 * t3;
    t0 = -0.013480470;
    t0 = t0 * t4 + 0.057477314;
    t0 = t0 * t4 - 0.121239071;
    t0 = t0 * t4 + 0.195635925;
    t0 = t0 * t4 - 0.332994597;
    t0 = t0 * t4 + 0.999995630;
    t3 = t0 * t3;

    t3 = (abs(y) > abs(x)) ? (1.570796327 - t3) : t3;
    t3 = (x < 0.0) ? (3.141592654 - t3) : t3;
    t3 = (y < 0.0) ? -t3 : t3;

    return t3;
}

// logic from : https://iquilezles.org/articles/distfunctions2d/
float sdSegment( in vec2 p, in vec2 a, in vec2 b )
{
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

float arrow(in vec2 p, in vec2 a, in vec2 b){
    float main_line = sdSegment(p, a, b);

    vec2 dir = b-a;
    float ang = atan2(dir.y, dir.x);
    float ang_plus = ang + 0.6;
    float ang_minus = ang - 0.6;

    vec2 o1 = b - 0.03 * vec2(cos(ang_plus), sin(ang_plus));
    vec2 o2 = b - 0.03 * vec2(cos(ang_minus), sin(ang_minus));

    float tip1 = sdSegment(p, b, o1);
    float tip2 = sdSegment(p, b, o2);

    return min(min(tip1, tip2), main_line);
}

const float CUTS_NUMBER = 30.0;

void main() {
    float ang = uTheta / 180.0 * 3.141592653589793;

    vec2 incidence = vec2(0.0, 0.0) - vec2(cos(ang), sin(ang));
    vec2 reflected = vec2(0.0, 0.0) - vec2(cos(ang), -sin(ang));

    float border = min(min(vColor.x, 1.0-vColor.x), min(vColor.y, 1.0-vColor.y)) / 2.0;
    vec2 pos = vec2(vColor.x, vColor.y)-vec2(0.5, 0.5);
    float line_incidence = arrow(pos, incidence * 0.4, incidence * 0.03);
    float line_reflected = arrow(pos, reflected * 0.03, reflected * 0.4);
    float line_transmited = 1.0;

    float center_line = sdSegment(pos,vec2(0.0,-0.5), vec2(0.0,0.5))*2.0;
    float traversal_cuts = step(mod(vColor.y * CUTS_NUMBER, 1.0), 0.3);
    center_line = max(center_line, traversal_cuts);

    float crit_angle = 1000.0;

    if (uEta1 < uEta2)
        crit_angle = asin(uEta1/uEta2);

    if (ang < crit_angle){
        float transmited_ang = asin(sin(ang) * uEta2/uEta1);
        vec2 transmited = vec2(cos(transmited_ang), sin(transmited_ang));
        line_transmited = arrow(pos, transmited * 0.03, transmited * 0.4);
    }

    float h = min(min(min(line_incidence, line_reflected), line_transmited), center_line);

    vec4 lines = vec4(1.0, 1.0, 1.0, step(min(h, border), 0.004) * uUIAlpha);
    vec4 text = texture(uText, vec2(vColor.x, vColor.y));
    text = vec4(text.x, text.y, text.z, text.w * uUIAlpha);
    outColor = max(lines, text);
}
