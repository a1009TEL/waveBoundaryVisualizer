#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aUV;
layout (location = 3) in vec4 aColor;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

uniform float uTime;

uniform bool uTM;

uniform float uTWaveAlpha;
uniform float uAmplitudeScaling;
uniform float uTimeZoom;
uniform float uSpaceZoom;

uniform float uOmega;
uniform float uBeta;
uniform float uTheta;
uniform float uEta1;
uniform float uEta2;

out vec4 vColor;

float transmitedOblique(float eta1, float eta2, float incident_angle, float transmited_angle, bool use_TM){
    if (use_TM){
        return (2.0*eta1*cos(incident_angle))/(eta1*cos(incident_angle)+eta2*cos(transmited_angle));
    } else {
        return (2.0*eta2*cos(incident_angle))/(eta2*cos(incident_angle)+eta1*cos(transmited_angle));
    }
}

float reflectedOblique(float eta1, float eta2, float incident_angle, float transmited_angle, bool use_TM){
    if (use_TM){
        return (eta1*cos(incident_angle)-eta2*cos(transmited_angle))/(eta1*cos(incident_angle)+eta2*cos(transmited_angle));
    } else {
        return (eta2*cos(incident_angle)-eta1*cos(transmited_angle))/(eta2*cos(incident_angle)+eta1*cos(transmited_angle));
    }
}

// vec2 transmitedTR(float eta1, float eta2, float incident_angle, float transmited_angle, int use_TM){
//         float alpha_2 = space_scaling_beta2 * sqrt((eta2*eta2) / (eta1*eta1) * sin(incident_angle) * sin(incident_angle) - 1.0);
//         float beta_2x = space_scaling_beta2 * eta2 / eta1 * sin(incident_angle);
//
//         float transmited_amplitude exp(-alpha_2 * aPosition.z) * 2.0 * sin(beta_2x * aPosition.x - uTime*time_scaling) * incident_amplitude;
// }
//
// vec2 reflectedTR(float eta1, float eta2, float incident_angle, float transmited_angle, int use_TM){
//     float a = sqrt((eta2*eta2)/(eta1*eta1) * sin(incident_angle) * sin(incident_angle) - 1.0);
//     float d = eta2*eta2*cos(incident_angle)*cos(incident_angle) + a*a;
//
//     float reflected_amplitude = ((eta2*eta2)*cos(incident_angle)*cos(incident_angle) - a*a) / d;
//     float reflected_phase_shift = (2.0 * eta1*eta2*a*cos(incident_angle)) / d;
//
//     return vec2(reflected_amplitude, reflected_phase_shift);
// }

void main() {
    float time = uTime / uTimeZoom;

    float eta1 = uEta1;
    float eta2 = uEta2;
    float incident_angle = uTheta / 180.0 * 3.141592653589793;

    float omega = uOmega;
    float beta1 = uBeta;
    float beta2 = uBeta * eta1 / eta2;

    float incident_axis = dot(vec3(sin(incident_angle), 0.0, cos(incident_angle)), aPosition) / uSpaceZoom;
    float reflected_axis = dot(vec3(sin(incident_angle), 0.0, -cos(incident_angle)), aPosition) / uSpaceZoom;

    float incident, reflected, transmited;
    float incident_amplitude = uSpaceZoom / 1000.0;

    float crit_angle = 1000.0;

    if (eta1 < eta2)
        crit_angle = asin(eta1/eta2);

    if (incident_angle < crit_angle){
        float transmited_angle = asin(sin(incident_angle) * eta2/eta1);
        float transmited_axis = dot(vec3(sin(transmited_angle), 0.0, cos(transmited_angle)), aPosition) / uSpaceZoom;

        float reflected_amplitude = reflectedOblique(eta1, eta2, incident_angle, transmited_angle, uTM) * incident_amplitude;
        float transmited_amplitude = transmitedOblique(eta1, eta2, incident_angle, transmited_angle, uTM) * incident_amplitude;

        incident = sin(incident_axis*beta1-time*omega)*incident_amplitude;
        reflected = sin(reflected_axis*beta1-time*omega)*reflected_amplitude;
        transmited = sin(transmited_axis*beta2-time*omega)*transmited_amplitude;
    } else {
        float alpha_2 = beta2 * sqrt((eta2*eta2) / (eta1*eta1) * sin(incident_angle) * sin(incident_angle) - 1.0);
        float beta_2x = beta2 * eta2 / eta1 * sin(incident_angle);

        float a = sqrt((eta2*eta2)/(eta1*eta1) * sin(incident_angle) * sin(incident_angle) - 1.0);

        if(uTM){
            float temp_eta = eta2;
            eta2 = eta1;
            eta1 = temp_eta;
        }

        float d = eta2*eta2 * cos(incident_angle)*cos(incident_angle) + a*a;
        float reflected_phase_shift = (2.0 * eta1*eta2*a*cos(incident_angle)) / d / uSpaceZoom; // phase also affected by zoom
        float reflected_amplitude = ((eta2*eta2) * cos(incident_angle)*cos(incident_angle) - a*a) / d * incident_amplitude;

        incident = sin(incident_axis*beta1 - time*omega) * incident_amplitude;
        reflected = sin(reflected_axis*beta1 - time*omega - reflected_phase_shift) * reflected_amplitude;

        transmited = exp(-alpha_2 * aPosition.z / uSpaceZoom) * 2.0 * sin(beta_2x * aPosition.x / uSpaceZoom - time*omega) * incident_amplitude;
    }


    float pos_y = mix(incident + reflected, transmited, aPosition.z > 0.0);

    vColor = vec4((pos_y/incident_amplitude), 0.0, 0.0, 1.0);
    gl_Position = uProjection * uView * uModel * vec4(aPosition.x, pos_y * uAmplitudeScaling, aPosition.z, 1.0);
}
