
## 배경

전통적인 비전 모델들은 단순히 이미지를 입력받으면 클래스 중 하나를 예측하거나 객체를 탐지하거나, 글자를 읽는 등 여러 task 중 특화된 하나만을 할 수 있었다. 하지만 더 나아가 현실의 다양한 시각 문제(classification, captioning, VQA, OCR, Detection 등)를 모두 다룰 수 있는 범용적인 모델은 없었다. 이런 흐름에서 등장한 것이 VLM이다. 해당 연구 또한 시각-언어 범용 인터페이스를 만들고자 하는 흐름을 그대로 따른다. 저자들은 이미지와 텍스트 프롬프트를 입력으로 받아 텍스트를 출력하는 이 모델이 classification, captioning, VQA, dialogue, detection, segmentation 같은 출력을 텍스트 토큰으로 바꾸어 처리할 수 있다고 말한다.

CLIP의 한계를 꼽자면 먼저 기본적으로 텍스트를 출력하는 모델이 아니고 복잡한 질문에 약하다. 또한 텍스트 전체와 이미지 전체가 잘 맞는지는 잘 할 수 있지만 "왼쪽 위 작은 물체", "오른쪽 빨간 옷 입은 사람" 같은 세밀한localization에 대해서는 약할 수 있다.

CLIP 다음의 흐름은 생성형이었다. 여러 이미지 작업들을 전부 텍스트로 처리하고자 하는 움직임이었다. 예를 들어 VQA는 직관적으로 다음과 같이 처리할 수 있다.
입력: 이미지 + "What is the person doing?"
출력: "Riding a bike."

Detection도 텍스트 토큰으로 처리할 수 있다.
입력: 이미지 + "detect dog"
출력: \<loc0123>\<loc0456>\<loc0789>\<loc0901> dog

이 방식을 통해 모델 구조를 task마다 따로 만드는 것이 아닌 하나의 텍스트 디코더가 정답 문자열을 생성할 수 있다. PaliGemma는 이를 통해 다양한 downstream task에 적용될 수 있다.

PaLI 계열 모델들은 PaLM-E 단계에서 500B급 모델을 활용했으나 그 다음 단계인 PaLI-3 모델을 통해 5B급 모델로 10배, 100배 큰 모델들과 비슷한 성능을 보이며 더 나은 vision pretrain과 data curation을 통해 거대 모델에 근접할 수 있음을 보였다. PaliGemma는 이 흐름에서 2~3B급 모델로도 PaLM-E, PaLI-3 같은 모델들과 비교 가능한 성능에 도달할 수 있음을 보이고자 한다.

## 아이디어

![[Pasted image 20260429220459.png]]
Figure 1을 통해 PaliGemma의 구조가 꽤 단순함을 알 수 있다. SigLIP의 이미지 인코더가 내놓는 이미지 벡터를 linear 레이어에 통과시킨다. Linear 레이어가 필요한 이유는 Gemma가 입력받을 수 있는 형태의 토큰 임베딩 차원으로 맞춰줘야 하기 때문이다. 저자들은 복잡한 MLP 구조가 단순 선형 변환에 비해 큰 이점을 보이지 않았다고 말한다.

PaliGemma는 챗봇이 아니라 versatile base VLM이다. 여러 downstream task에 잘 적응하는 모델을 만들겠다는 뜻이다. 사전학습에는 caption, OCR, VQA, VQG, detection, segmentation, grounded captioning이 모두 포함된다. 다양한 task를 섞어 모델이 다양한 각도에서 시각-언어 이해를 하도록 만든다. Task마다 prefix를 붙여 학습 신호가 충돌하지 않도록 한다.

이미지 인코더를 freeze하지 않고 학습시켜 CLIP류 이미지 인코더가 공간적 이해에 약한 문제를 해소하고자 한다. 단, 학습 초기의 misaligned gradient로 인해 모델 품질이 망가지지 않도록 linear warmup을 적용한다.

## 이미지의 텍스트 토큰화

PaliGemma는 이미지를 고정된 정사각형 해상도로 resize 한다. 논문에서는 224, 448, 896 해상도 모델을 사용한다. 어쨌든 이미지 텐서 shape은 torch 스타일로 다음과 같을 수 있다.
$$
[B, C, H, W]
$$

논문에서 이미지는 $16 \times 16 = 256$개의 패치로 잘린다고 설명한다. 따라서 SigLIP 이미지 인코더의 출력은 다음과 같다.
$$
[B, 256, dim_{sig}]
$$

위 텐서를 선형 변환하여 Gemma 모델이 받을 수 있는 구조로 바꾼다.
$$
[B, 256, dim_{sig}] \rightarrow [B, 256, dim_{gem}]
$$

이를 텍스트 프롬프트 토큰과 concat하면 Gemma 모델에 입력할 텐서 준비는 끝이다. 내부 sequence를 펼쳐보면 다음과 같다.
```
[IMG_1]
[IMG_2]
...
[IMG_256]
[BOS]
["Where"]
["is"]
["the"]
["photographer"]
["resting"]
["?"]
[SEP]
["In"]
["a"]
["hammock"]
...
[EOS]
[PAD]
```

## Prefix / Suffix

prefix = 모델에게 주는 지시문 / 질문 / task 설명
suffix = 모델이 생성해야 하는 정답 / 답변 / 출력 문자열

토큰 sequence는 이미지-prefix-suffix 순으로 구성된다.
```
[IMG_1]
[IMG_2]
...
[IMG_N]
[BOS]
[prefix token 1]
[prefix token 2]
...
[SEP]
[suffix token 1]
[suffix token 2]
...
[EOS]
[PAD]
```

PaliGemma는 다음과 같은 조건부 생성 모델이다. 따라서 image, prefix는 입력으로 보고 suffix만 출력으로 학습한다. 저자들은 prefix까지도 loss를 걸어 질문을 맞히게 하는 실험도 했지만 성능이 떨어졌다고 보고한다.
$$
p(\text{suffix} \mid \text{image}, \text{prefix})
$$

Task에 따라 prefix는 달라진다. 똑같은 이미지가 들어가도 prefix에 따라서 출력해야할 suffix는 달라진다. 저자들은 1024개의 location 토큰을 추가했다고 설명한다. 이는 정규화된 이미지 좌표를 1024개 bin으로 나눈 값을 나타낸다. 정규화된 좌표라 함은 \[0, 1] 실수 범위의 좌표 구간을 1024개로 나누고 해당 구간 번호를 location 토큰으로 표현한 것이다.

이미지 크기가 정사각형 224 픽셀, 448 픽셀, 896 픽셀일 수 있다. 절대좌표를 쓰면 해상도마다 표현이 달라지기에 정규화하여 일관성을 챙긴다. 예를 들어 입력이 448 픽셀 이미지이고 모델이 \<loc0347> 토큰을 출력한 경우 $347 \div 1023 \approx 0.339$, $0.339 \times 448 \approx 152$. 즉, 절대 좌표 152 쯤에 뭔가 있다고 모델이 출력한 것이다.

Detection 문제의 경우 모델이 박스를 출력해야 하기에 4개 좌표를 출력해야 한다. 다음과 같은 형식으로 출력한다.
\<loc_ymin>\<loc_xmin>\<loc_ymax>\<loc_xmax> object_name
ex) \<loc0200>\<loc0300>\<loc0700>\<loc0800> dog

Segmentation 문제는 더 복잡하다. 새 특수 토큰으로 128개의 segmentation 토큰을 추가했다고 설명한다. 해당 논문에서 다루고자 하는 Referring expression segmentation의 경우 문장으로 지칭한 특정 객체를 픽셀 단위로 표시하는 문제이다. 예를 들어 "기린을 찾아달라"는 요구가 입력되면 모델은 이미지 내에서 기린에 해당하는 픽셀만을 1로 분류하고 나머지를 0으로 분류할 수 있다. 하지만 만약 224 픽셀의 정사각형 이미지의 모든 픽셀을 그대로 표현하면 $224^2 = 50176$ 개의 픽셀을 0과 1로 표기해야 하는데 50176 길이의 텍스트를 모델이 autoregressive하게 출력하기에는 계산이 너무 비효율적이다. ex) 000000111110000000...
따라서 PaliGemma 모델은 마스크를 그대로 출력하지 않고 [[VQ-VAE]] 방식으로 압축된 discrete code sequence로 바꿔서 출력한다. Codebook size 128의 VQ-VAE 모델을 사용한다고 이해할 수 있다.

1. Captioning
prefix: "caption en\n"
suffix: "A person is lying in a hammock on the beach."

2. VQA
prefix: "answer en Where is the person resting?\n"
suffix: "in a hammock"

3. OCR
prefix: "ocr\n"
suffix: "OPEN 24 HOURS"

4. Detection
prefix: "detect dog ; person\n"
suffix: "\<loc0123>\<loc0456>\<loc0789>\<loc0910> dog ..."

5. Segmentation
prefix: "segment giraffe\n"
suffix: "\<loc0347>\<loc0553>\<loc0788>\<loc0749>
\<seg093>\<seg106>\<seg114>\<seg078>\<seg064>
\<seg012>\<seg031>\<seg055>\<seg050>\<seg012>
\<seg083>\<seg118>\<seg084>\<seg078>\<seg127>
\<seg121>"

Segmentation 출력 구조
객체가 대략 어디 있는지: loc 4개
그 객체의 정확한 모양은 어떤지: seg code sequence

즉, PaliGemma 모델은 학습 중에는 VQ-VAE의 codebook 토큰들을 맞히도록 훈련되고, 추론 상황에서는 VQ-VAE 디코더에 PaliGemma seg 토큰 출력을 입력하여 픽셀 단위 마스크를 복원한다.
# Attn masking

어텐션 마스킹을 통해 image, prefix에 대해서는 loss를 계산하지 않고 suffix에 대한 loss만을 계산한다.

![[Pasted image 20260501140321.png]]
Figure 2의 행은 Query이고 열은 Key이다. Image-prefix 사이의 attention 연산은 이뤄지지만 loss는 오직 suffix 값 예측에 대해서만 연산한다. 행렬이 $N \times N$이고 suffix 길이가 $n(n < N)$일 경우 모델 출력값은 $N$개이지만 이 중 $n$개에 대해서만 loss를 계산한다.