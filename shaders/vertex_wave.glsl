#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aUV;
layout (location = 3) in vec4 aColor;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

uniform float uTime;

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

void main() {
    float eta1 = uEta1;
    float eta2 = uEta2;
    float incident_angle = uTheta / 180.0 * 3.141592653589793;

    float time_scaling = uOmega / uTimeZoom;
    float space_scaling_beta1= uBeta / uSpaceZoom;
    float space_scaling_beta2 = uBeta * eta1 / eta2 / uSpaceZoom;

    float transmited_angle = asin(sin(incident_angle) * eta2/eta1);

    float incident_axis = dot(vec3(sin(incident_angle), 0.0, cos(incident_angle)), aPosition);
    float reflected_axis = dot(vec3(sin(incident_angle), 0.0, -cos(incident_angle)), aPosition);
    float transmited_axis = dot(vec3(sin(transmited_angle), 0.0, cos(transmited_angle)), aPosition);

    float incident_amplitude = 1.0/space_scaling_beta1;
    float reflected_amplitude;
    float transmited_amplitude;

    if (true){ // TE
        reflected_amplitude = (eta2*cos(incident_angle)-eta1*cos(transmited_angle))/(eta2*cos(incident_angle)+eta1*cos(transmited_angle)) * incident_amplitude;
        transmited_amplitude = (2.0*eta2*cos(incident_angle))/(eta2*cos(incident_angle)+eta1*cos(transmited_angle)) * incident_amplitude;
    }else{ //TM
        reflected_amplitude = (eta1*cos(incident_angle)-eta2*cos(transmited_angle))/(eta1*cos(incident_angle)+eta2*cos(transmited_angle)) * incident_amplitude;
        transmited_amplitude = (2.0*eta1*cos(incident_angle))/(eta1*cos(incident_angle)+eta2*cos(transmited_angle)) * incident_amplitude;
    }

    float incident = sin(incident_axis*space_scaling_beta1-uTime*time_scaling)*incident_amplitude;
    float reflected = sin(reflected_axis*space_scaling_beta1-uTime*time_scaling)*reflected_amplitude;

    float transmited_;
    float crit_angle = asin(eta1/eta2);

    float alpha_2 = space_scaling_beta2 * sqrt(eta2 / eta1 * sin(incident_angle) * sin(incident_angle) - 1.0);
    float beta_2x = space_scaling_beta2 * sqrt(eta2 / eta1) * sin(incident_angle);
    // float alpha_2 = 1.0;
    // float beta_2x = 1.0;

    if (crit_angle < incident_angle && eta1 < eta2){
        transmited_ = exp(-alpha_2 * aPosition.z) * sin(beta_2x * aPosition.x)/100.0;
    } else {
        transmited_ = sin(transmited_axis*space_scaling_beta2-uTime*time_scaling);
    }

    float transmited = transmited_*transmited_amplitude;

    float pos_y = mix(incident + reflected, transmited, aPosition.z > 0.0);

    vec3 red_white = mix(vec3(1.0,1.0,1.0), vec3(1.0,0.0,0.0), pos_y/incident_amplitude);
    vec3 white_blue = mix(vec3(1.0,1.0,1.0), vec3(0.0,0.0,1.0), -pos_y/incident_amplitude);
    vec3 color_map = mix(red_white, white_blue, step(pos_y, 0.0));
    vec4 color_map_alpha = mix(vec4(color_map, uTWaveAlpha), vec4(color_map, 1.0), step(aPosition.z, 0.0));


    vColor = color_map_alpha;
    gl_Position = uProjection * uView * uModel * vec4(aPosition.x, pos_y * uAmplitudeScaling, aPosition.z, 1.0);
    // vColor = vec4(aPosition,1.0);
    // vColor = vec4(aUV, 0,0.0);
}
