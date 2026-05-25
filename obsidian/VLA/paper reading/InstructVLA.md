
## Introduction

오늘날 VLA 모델은 일반적으로 pretrained VLM에 action expert를 붙여서 만든다. Action을 language token으로 discrete하게 처리하는 방식, continuous 하게 보는 diffusion 방식과 flow matching 방식이 있다.

이 중 flow matching 방식이 좋은 성능을 보이고 있지만 text를 autoregressive하게 생성하는 방식의 장점을 놓치고 있다. Text를 autoregressive하게 출력하도록 하여 VLM의 reasoning 능력과 semantic capability를 챙길 수 있다. 해당 연구에서는 VLM이 autoregressive하게 action을 생성하는 방식과 기존 VLA에서 좋은 성능을 보이는 flow matching 방식을 통합하고자 한다.

## Architecture

![[Pasted image 20260523175002.png]]
위는 내가 이해한 흐름도. 아래는 논문 figure 2.

![[Pasted image 20260523175030.png]]

1. VLM
먼저 입력 이미지와 텍스트가 VLM에 입력되면 autoregressive하게 출력 자연어 텍스트와 액션 특수 토큰을 출력하기 시작한다.

이때 추론 속도 향상을 위해 top-k 등의 전략없이 argmax로 greedy하게 토큰을 출력한다. 그러다가 \<act1>, 즉 첫 액션 토큰이 출력되면 이후 액션 토큰은 autoregressive가 아닌 parallel하게 생성한다.

예시를 통해 살펴보자.
배치 B, 입력 텍스트 길이 I, 출력 텍스트 길이 O, 액션 토큰 개수 64, 모델 차원 D

```
[B, I, D] #모델 입력 임베딩
[B, I + 1, D] #greedy generation
...
[B, I + O + 1, D] #첫 번째 액션 토큰 생성
[B, I + O + 64, D] #나머지 63개 액션 토큰을 붙이고 병렬 연산

결과물
[B, I + O, D] #모델 텍스트 출력. 더이상 안 쓰임
[B, 64, D] #Latent action
```

여기에 LoRA adapter MoE가 적용되면 intructVLA의 VLM 동작 구조가 된다. 먼저 말로 설명하면 VLM 내부의 트랜스포머 레이어 별로 scalar head가 붙는다. 이 scalar head가 내놓는 값을 LoRA adapter weight로 삼아 나오는 가중평균이 최종 출력이 된다.

```
[B, T, D] #input hidden state. T는 시스템 프롬프트, 입력, 출력, 액션 토큰을 모두 포함한 토큰 길이. 이전 레이어의 출력 hidden state일 수도 있고, 입력 텍스트 토큰이 임베딩 공간으로 올라간 텐서일 수도 있다.

[B, T, D] #최종 output hidden state
[B, T, 2] #scalar head. 0번 인덱스의 값이 action 가중치, 1번 인덱스 값이 language 가중치. 각 토큰별로 서로 다른 가중치가 들어간다.

→ base linear / action LoRA / language LoRA를 각각 계산  
base_out: [B, T, D]  
action_out: [B, T, D]  
lang_out: [B, T, D]  
  
→ scalar head 값으로 action_out, lang_out을 가중합  
mixed_out = base_out  
+ λ_action * action_out  
+ λ_lang * lang_out
  
mixed_out이 레이어의 최종 출력값이 된다.
```

```
트랜스포머 블록의 자세한 내부 구조는 다음과 같다. 하나의 scalar head에서 나온 값을 여러 LoRA weight에서 재사용한다.

Transformer block l
input hidden state x_l: [B, T, D]

1. Self-attention sublayer

  x_attn_in = Norm(x_l): [B, T, D]

  Router / scalar head:
    λ_attn = scalar_head(x_attn_in): [B, T, 2]
    λ_action_attn   = λ_attn[..., 0:1]: [B, T, 1]
    λ_language_attn = λ_attn[..., 1:2]: [B, T, 1]

  Q projection:
    base W_q
    action LoRA_q
    language LoRA_q
    q = W_q(x_attn_in)
      + λ_action_attn   * LoRA_action_q(x_attn_in)
      + λ_language_attn * LoRA_language_q(x_attn_in)

  K projection:
    base W_k
    action LoRA_k
    language LoRA_k
    k = W_k(x_attn_in)
      + λ_action_attn   * LoRA_action_k(x_attn_in)
      + λ_language_attn * LoRA_language_k(x_attn_in)

  V projection:
    base W_v
    action LoRA_v
    language LoRA_v
    v = W_v(x_attn_in)
      + λ_action_attn   * LoRA_action_v(x_attn_in)
      + λ_language_attn * LoRA_language_v(x_attn_in)

  Attention:
    attn_out = Attention(q, k, v): [B, T, D]

  Router / scalar head:
    λ_o = scalar_head(attn_out or o_proj input): [B, T, 2]

  O projection:
    base W_o
    action LoRA_o
    language LoRA_o
    o = W_o(attn_out)
      + λ_action_o   * LoRA_action_o(attn_out)
      + λ_language_o * LoRA_language_o(attn_out)

  residual:
    x_mid = x_l + o: [B, T, D]


2. MLP sublayer

  x_mlp_in = Norm(x_mid): [B, T, D]

  Router / scalar head:
    λ_mlp = scalar_head(x_mlp_in): [B, T, 2]
    λ_action_mlp   = λ_mlp[..., 0:1]: [B, T, 1]
    λ_language_mlp = λ_mlp[..., 1:2]: [B, T, 1]

  Up projection:
    base W_up
    action LoRA_up
    language LoRA_up
    up = W_up(x_mlp_in)
       + λ_action_mlp   * LoRA_action_up(x_mlp_in)
       + λ_language_mlp * LoRA_language_up(x_mlp_in)

  activation:
    h_ff = activation(up)

  Down projection:
    base W_down
    action LoRA_down
    language LoRA_down
    down = W_down(h_ff)
         + λ_action_mlp   * LoRA_action_down(h_ff)
         + λ_language_mlp * LoRA_language_down(h_ff)

  residual:
    x_{l+1} = x_mid + down: [B, T, D]
```

2. DINOv2
Latent action을 조건으로 FiLM이 적용되는 것이 특징이다.

```
VLM latent action: #VLM 차원과 DINOv2 차원이 다르다.
  C = [B, 64, D_vlm]

현재 observation image:
  image = [B, 3, 224, 224]

DINOv2 FiLM conditioning:
  c = mean(C, dim=1) #VLM latent action을 64개 액션 토큰에 대해 avg pool
  c = [B, D_vlm]

DINOv2 patch embedding:
  x = [B, P, D_vis]
  default: [B, 256, 1024]

For each DINOv2 ViT block:
  x = x + Attention(Norm(x)) #residual self-attention

  gamma = Linear_scale_l(c): [B, 1024]
  beta  = Linear_shift_l(c): [B, 1024]

  x = x * (1 + gamma[:, None, :]) + beta[:, None, :] #FiLM

  x = x + MLP(Norm(x)) #residual MLP

DINOv2 output:
  visual_embed = [B, 256, 1024]

projector:
  visual_feature = MLP(visual_embed)
  visual_feature = [B, 256, D_action]
```

3. Action expert
VLM, DINOv2의 출력을 모두 concat하여 입력으로 받는다.

```
visual_feature: [B, 256, D_action] #DINOv2
latent_action_projected: [B, 64, D_action] #VLM latent action
action_embeds: [B, 16, D_action] #noisy action

input_seq = concat(
  visual_feature,
  latent_action_projected,
  action_embeds
)

input_seq: [B, 256 + 64 + 16, D_action]
```

어텐션 마스킹은 각 블록 단위로 적용된다. 즉, VISION | LATENT | NOISY ACTION 3개 그룹이 서로를 볼 때는 마스킹이 적용되고 그룹 내부에서는 마스킹이 적용되지 않는다.

VISION
\[ vision: O | latent: X | noisy action: X ]
DINOv2의 vision token끼리는 서로를 마스킹없이 자유롭게 볼 수 있다. 하지만 latent와 noisy action은 볼 수 없다.

LATENT
\[ vision: O | latent: O | noisy action: X ]

NOISY ACTION
\[ vision: O | latent: O | noisy action: O ]
Noisy action은 전체를 볼 수 있다.

```
[B, 256 + 64 + 16, D_action] #input
[B, 256 + 64 + 16, D_action] #attention output

[:, -16, :] #noisy action 토큰만 슬라이싱

[B, 16 * D_action] #Flatten

[B, 16 * 7] #MLP 통과

[B, 16, 7] #reshape
```

논문에서 (S.)라는 표기가 등장하는 데 이는 robot state, proprioception을 action expert에 입력하는 모델 구조를 말한다. 이 경우 action expert 입력은 다음과 같이 바뀐다.

```
visual_feature: [B, 256, D_action]          # DINOv2
latent_action_projected: [B, 64, D_action]  # VLM latent action
proprio_feature: [B, 1, D_action]           # robot state / proprioception
action_embeds: [B, 16, D_action]            # noisy action

input_seq = concat(
  visual_feature,
  latent_action_projected,
  proprio_feature,
  action_embeds
)

input_seq: [B, 256 + 64 + 1 + 16, D_action]
```
어텐션 블록의 경우 proprioception은 latent action과 한 그룹으로 취급된다.


## Train Phases

2개 phase로 이뤄진다. 먼저 action을 학습시키고, 복잡한 instruction도 따를 수 있도록 language LoRA adpater와 그 가중치 계산을 위한 scalar head를 학습시킨다.

1. Action pre-training
$$
\mathcal L = \mathcal L_{LM} + \mathcal L_{FM}
$$
Text에 대한 cross entropy loss와 action에 대한 flow matching loss를 그대로 더해서 최종 loss값으로 삼는다.

이 단계에서는 오직 action LoRA adapter와 latent action embedding, 그리고 action expert만 학습된다. 나머지는 freeze. 애초에 language LoRA adapter는 이 단계에서 생성되지도 않는다. 평범한 LoRA 파인튜닝만이 action LoRA adapter에 대해 수행된다.

Latent action input embedding과 output embedding이 모두 학습된다. Input embedding은 말 그대로 액션 토큰을 모델이 입력받을 때의 임베딩 벡터이고 output embedding은 action expert에 넘어가는 latent action token의 hidden state이다.

2. Vision-language-action instruction tuning
Action을 다루는 LoRA adapter, latent action embedding, action expert 학습이 1차적으로 끝나면 language LoRA adapter, scalar head가 붙어 학습이 시작된다.

## Efficient Inference

모델 전체 forward 연산은 모델 아키텍처를 보면 알 수 있듯 상당히 비싸다. 따라서 매 스텝 전체 forward 연산을 수행하는 대신 caching을 적극적으로 활용한다.

이후 설명에서 1 step은 action expert가 한 번에 \[B, 16, 7] 출력을 생성하는 과정을 말한다. 16은 action expert가 한 번에 16개의 일련의 action sequence를 만든다는 의미이고 7은 6DoF 로봇팔의 7개 관절(6개 + 손 관절)을 의미한다.

VLM의 출력은 크게 두 가지로 나눌 수 있다. Text와 action latent. 이때 매 스텝마다 text를 새롭게 생성할 이유는 많지 않다. 한 번의 text 출력으로 연속된 행동을 계속 수행할 수 있기 때문이다. 따라서 InstructVLA는 20 스텝마다 text를 출력한다. 중간의 스텝 동안에는 캐싱해둔 출력 텍스트를 재활용하여 autoregressive한 과정없이 단 한 번의 forward로 action latent를 출력한다.

또한 action latent는 2스텝마다 새롭게 생성한다. 즉, action expert가 매 스텝마다 다르게 입력받는 값은 오직 DINOv2의 image feature이다.

## Action Ensemble

처음 생성된 0번 인덱스 action sequence = $[a_{00}, a_{01}, a_{02}, ...]$
그 다음 생성된 1번 인덱스 action sequence = $[a_{10}, a_{11}, a_{12}, ...]$
마지막으로 생성된 최신 2번 인덱스 action sequence = $[a_{20}, a_{21}, a_{22},...]$

이 경우 $a_{02}, a_{11}, a_{20}$은 모두 같은 시점의 행동을 말한다. 최신의 $a_{20}$만을 사용하는 게 좋아보일 수도 있지만 $a_{20}$이 $a_{00}, a_{10}$과 자연스럽게 이어지지 않을 수 있다. 하나의 action sequence 안에서는 행동들이 자연스럽게 배치되지만 서로 다른 action sequence의 행동들끼리는 부자연스러울 수 있기 때문이다.

따라서 InstructVLA는 가중 평균을 통해 최종 행동을 산출한다. 이때 가중치는 최신 action sequence와의 코사인 유사도를 활용한다.

$a_{02}$의 가중치
$$
w_{02} = \frac{(a_{02} \cdot a_{20})}{||a_{02}|| \times ||a_{20}||}
$$

$a_{11}$의 가중치
$$
w_{11} = \frac{(a_{11} \cdot a_{20})}{||a_{11}|| \times ||a_{20}||}
$$

$a_{20}$의 가중치
$$
w_{20} = 1
$$

이렇게 해서 나온 가중치를 통해 가중 평균을 구한다. 이 가중 평균 7차원 벡터가 최종 행동이 된다.

## Experiment

InstructVLA-Expert. Stage 1 학습만 끝낸 모델. Action 생성은 가능하나 복잡한 instruction 처리 능력과 일반 multimodal 지식은 떨어질 것으로 기대된다.
InstructVLA-Generalist. Stage 2 학습까지 마친 모델.
(S.)가 붙는 경우는 Robot state, 즉 proprioception이 입력되는 경우를 말한다.

![[Pasted image 20260525154604.png]]
일반적인 multimodal 지식에 관한 벤치마크. 로봇 조작 성능이 아닌 InstructVLA가 얼마나 multimodal 지식을 잘 보존했는지 보여준다. OpenVLA는 catastrophic forgetting으로 전부 0점을 받았고, ChatVLA, Magma와 같은 다른 generalist VLA 모델들도 선방하고 있지만 InstructVLA가 전반적으로 더 나은 성능을 보이고 있다.

또한 InstructVLA는 VLM 백본으로 Eagle2를 사용하는데 InstructVLA가 Eagle2와 비슷하거나 더 나은 성능을 보인다는 점에서 해당 연구에서 제시한 방법론이 VLM의 일반적인 지식을 보존하는데 효과적임을 증명한다.

![[Pasted image 20260525161905.png]]
VLM이 있는데 DINO vision encoder가 추가로 필요할까? Table 3를 보면 그런 것 같다. 두 개의 SimplerENV 벤치마크에서 유의미한 성능 차이를 보인다.

Language motion은 action을 autoregressive한 토큰으로 표현한 데이터를 말한다. 이 데이터를 학습시키면 VLM 모델이 action을 language token으로 출력하는 능력도 갖게 된다. 다만 실제 추론 상황에서는 language motion이 출력되는 것은 아니다.

Language motion 데이터는 다음과 같이 구성되어 있다.
```
Query: What action should the robot take to {lang}? Give both move primitive and action.
Output: {move_primitive} <new_token_0>...<new_token_63>
```
즉, 쿼리에서 구체적으로 요구하는 경우에만 출력한다. 추론 상황에서 출력하는 건 아니더라도 이러한 데이터를 흘려넣어주는 것이 모델 일반화 성능에 도움이 된다고 해석할 수 있다.

![[Pasted image 20260525163601.png]]
Stage 1에서 action expert 학습 이후 stage 2에서 action expert를 또 학습시킬 이유가 있는가? (a) figure를 보면 그럴 이유는 없는 것으로 나타난다.

(b)는 파인튜닝 전략에 따른 성능 차이를 보여준다. Full Fine Tuning, AR co-training, MoE 제거 IntructVLA 모두 원본 InstructVLA에 비해 낮은 성능을 보인다. Manip은 manipulation, MM-vet은 multimodal 성능을 말한다.

![[Pasted image 20260525164212.png]]
(b)에서 Generalist w/o think는 VLM이 자연어 텍스트 출력 이후 latent action 출력이 아니라 곧바로 latent action을 출력하도록 하는 mode를 의미한다. 가능은 하지만 성능이 떨어지는 것을 확인할 수 있다.

![[Pasted image 20260525164406.png]]
학습 데이터에 QA, Captioning 같은 일반적인 VLM multimodal 데이터를 포함하는 것이 특히 reasoning이 필요한 행동에 도움이 되는가를 정리한 table 4. 직접적인 action data는 아니지만 도움이 되는 것을 확인할 수 있다.

# $$
\begin{aligned}
W + \alpha W_A + \beta W_L
\end{aligned}
$$
