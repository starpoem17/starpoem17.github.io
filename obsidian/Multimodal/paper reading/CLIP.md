
## Zero shot prediction

훈련 상황에서 본 적 없는 클래스
and 해당 클래스에 대한 예시를 보여주지 않음
and 해당 클래스의 이름이나 설명만 입력

예를 들어 CLIP이 말라뮤트 분류 데이터셋으로 fine-tuning된 적 없더라도, 사전학습 중 웹 데이터에서 “malamute”, “dog”, “sled dog” 같은 표현과 관련 이미지를 충분히 접했다면, 추론 시 “a photo of a malamute”라는 class prompt와 테스트 이미지의 유사도를 비교해 말라뮤트 클래스를 선택할 수 있다.

## 배경

기존의 SOTA vision 모델들은 이미지넷 문제 해결에서처럼 고정된 클래스 집합을 예측하도록 학습되었다. 이는 학습 과정에서 이미 봤던 클래스에는 강하지만 새로운 시각 개념을 다루려면 그에 맞는 라벨링 데이터를 갖고 와 학습시켜야 한다. CLIP은 이 문제를 해결하기 위해 인터넷에서 수집한 4억 쌍의 image-text pair 데이터를 활용해 이미지를 자연어 설명과 연결하여 zero shot image prediction 문제를 해결하고자 한다.

"시각 모델이 단순히 클래스 번호를 맞히는 수준을 넘어 자연어 설명을 이해하기 시작했다."

## 아이디어

![[Pasted image 20260428233408.png]]
Transformer Language Model은 이미지를 입력받으면 "a dog running on the grass"와 같은 문장을 생성한다. 가장 어려운 문제를 풀고자 한다. 똑같은 이미지를 봐도 설명할 수 있는 방법이 무궁무진한데 언어 모델은 이러한 세부적 언어 표현을 맞히는 데 많은 자원을 투자한다.

Bag of Words Prediction의 경우 언어 모델과 달리 문장 순서를 무시한다. 이미지를 입력받으면 "grass", "dog" 같은 단어를 출력하는 문제를 푼다. Figure 2를 보면 알 수 있듯 언어 모델과 같은 성능을 도달하는 데 있어 3배 더 적은 사전 학습 이미지를 필요로 한다.

본 연구에서 주장하는 CLIP의 경우 단어를 생성하지 않는다. 정확한 단어, 문장 순서를 맞힐 필요 없이 텍스트와 이미지가 서로 잘 어울리는지 본다. Contrastive learning을 통해 ImageNet zero shot prediction 문제에서 높은 효율성을 보일 수 있다.


![[Pasted image 20260428201543.png]]

1. Contrastive pretraining

배치 사이즈가 3이라고 가정하면 다음과 같은 데이터가 있을 수 있다.
I1: 강아지 사진      T1: "a photo of a dog"
I2: 비행기 사진      T2: "a photo of a plane"
I3: 자동차 사진      T3: "a photo of a car"

CLIP 모델은 같은 쌍 벡터끼리의 내적값은 커지고, 다른 쌍 벡터끼리의 내적값은 작아지기를 원한다.
I1 · T1 높게
I2 · T2 높게
I3 · T3 높게

I1 · T2, I1 · T3 낮게
I2 · T1, I2 · T3 낮게
I3 · T1, I3 · T2 낮게

2. Class 이름을 자연어 프롬프트로 변환
새로운 데이터셋의 클래스가 cat, pizza, wolf라고 하면 class name만 넣는 것보다 "A photo of a {label}."과 같은 prompt template을 쓰면 성능이 더 좋아진다고 한다. 여기에 prompt engineering과 prompt ensembling을 함께 쓰면 더 좋아졌다고 보고한다.

3. 프롬프트를 텍스트 인코더에 입력, 테스트 이미지를 이미지 인코더에 입력
각 이미지 벡터와 다른 모든 테스트 텍스트 벡터 사이의 코사인 유사도를 계산하여 그 값이 가장 높은 텍스트가 예측값이 된다.

## 스도코드
![[Pasted image 20260428201503.png]]
배치 사이즈가 3이라고 가정하자.
I1 T1
I2 T2
I3 T3

이미지와 텍스트는 각각 인코더를 통과하여 이미지 벡터와 텍스트 벡터가 된다.
$$
\begin{aligned}
I_f &= \text{image vector} \\
T_f &= \text{text vector}
\end{aligned}
$$

이미지 인코더와 텍스트 인코더는 서로 무관한 모델들이다. 따라서 이미지 인코더의 출력 벡터와 텍스트 인코더의 출력 벡터는 서로 크기도 다르고 의미도 다르다. 따라서 선형 변환을 통해 크기와 의미를 맞출 필요가 있다.
$$
\begin{aligned}
W_i &= \text{image feature를 공통 embedding space로 보내는 선형 변환} \\
W_t &= \text{text feature를 공통 embedding space로 보내는 선형 변환}
\end{aligned}
$$

L2 normalization은 consine similarity를 사용하기 위해 필요하다. 각 벡터의 길이를 1로 맞춰 두 벡터의 내적이 cosine similarity를 의미하도록 할 수 있다. 코사인 거리에서 벡터의 크기는 중요하지 않다. 

이제 모든 이미지-텍스트 쌍의 코사인 유사도 행렬을 만든다.
$$
logits = np.dot(I_e, T_e.T) * np.exp(t)
$$
$I_e$: 이미지 임베딩 벡터
$T_e.T$: 텍스트 임베딩 벡터. 내적을 위해 transpose
$t$: temperature. learnable parameter

Temperature의 경우 softmax 연산에서의 그것과 비슷하다. 다만 값이 커지면 softmax 분포를 더 뾰족하게 만들고 작아지면 더 완만하게 만든다는 점에서 방향성은 다르다. 예를 들어 이미지 I1이 세 텍스트와 비슷한 정도가 다음과 같다고 하자.
I1·T1 = 0.30
I1·T2 = 0.25
I1·T3 = 0.10

여기에 np.exp(t) = 10을 곱하면 다음과 같다. softmax 연산 시 분포가 더 뾰족해진다. 너무 커지면 학습이 불안정해질 수 있기에 해당 연구에서는 최댓값을 제한했다.
I1·T1 = 3
I1·T2 = 2.5
I1·T3 = 1

이후 CEL을 활용해서 손실을 계산한다. 주의할 점은 두 가지이다.
1. Cosine Loss를 사용하는 게 아니다. 크기 1로 정규화된 벡터 내적을 통해 코사인 유사도를 계산하고 CEL을 적용한다. "Cosine Similarity 기반 Cross Entropy Loss"
2. 텍스트->이미지 손실, 이미지->텍스트 손실을 평균 내어 어느 쪽이든 잘 작동하도록 훈련시킨다.

## 프롬프트가 분류기의 가중치 역할을 한다

일반적인 이미지 분류 모델의 경우 인코더가 이미지를 feature vector로 변환하고 이를 마지막 classification head로 입력한다.
$$
z_c = h^\top w_c + b_c
$$
$h$   = 이미지 feature vector
$w_c$ = class c에 해당하는 weight vector
$b_c$ = class c에 해당하는 bias
$z_c$ = class c의 logit

만약 클래스가 3개라면 weight vector도 세 개 있다. 모델은 각 3개 클래스에 대한 logit을 계산하고 softmax 연산으로 확률을 구한다. 여기에서 weight vector는 다음과 같은 역할을 한다고 이해할 수 있다.
"이미지 feature h가 $w_{dog}$ 방향과 비슷하면 dog 점수가 높아진다."
"이미지 feature h가 $w_{cat}$ 방향과 비슷하면 cat 점수가 높아진다."
"이미지 feature h가 $w_{car}$ 방향과 비슷하면 car 점수가 높아진다."

즉, $w_{dog}$는 dog라는 이미지 클래스를 대표하는 방향 벡터이다. CLIP은 $w_{dog}$를 직접 학습하는 대신 프롬프트 입력으로 받은 텍스트 벡터가 이 역할을 대신한다. 그렇기에 학습하지 않은 새로운 클래스를 예측하는 zero shot 문제에서도 기존 분류 모델보다 더 나은 일반화 성능을 보인다.