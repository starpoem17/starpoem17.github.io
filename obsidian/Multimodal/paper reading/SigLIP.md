
## 배경
[[CLIP]]의 vision-text contrastive pretraining 기법은 범용 vision backbone을 만드는 대표적인 방법이 되었다. 하지만 softmax 기반 constrastive loss는 학습 비용 측면에서 부담스러울 수 있다.

![[Pasted image 20260429152958.png]]
Figure 1은 CLIP이 multi GPU 학습 환경에서 여러 device에 분산되어 있는 representation을 모아야함을 보여준다. SigLIP은 이 문제를 해결하기 위해 chunked implementation을 제안한다.

Contrastive learning은 큰 배치가 필요하다. 배치 사이즈가 곧 negative sample의 수이기 때문이다. 본 연구는 pretraining을 더 효율적으로 만들고 제한된 자원에서도 더 좋은 모델을 학습할 수 있도록 했다.

## 아이디어

CLIP이 푸는 문제를 단순히 표현하면 다음과 같다. 
"이미지 I1에 대해 T1, T2, T3, T4 중 정답 텍스트는 무엇인가?"

SigLIP은 위 문제를 다음처럼 바꾼다.
"I1-T1은 맞는 쌍인가? 예"
"I1-T2는 맞는 쌍인가? 아니오"
"I1-T3는 맞는 쌍인가? 아니오"
"I1-T4는 맞는 쌍인가? 아니오"

즉, CLIP이 풀던 multi class classification 문제를 binary 문제처럼 바꾼다.

## 스도코드
![[Pasted image 20260429154455.png]]
각 인코더가 입력을 받은 뒤 길이 1로 정규화된 벡터를 리턴한다.
$$
\begin{aligned}
zimg &= l2_{normalize}(img_{emb}) \\
ztxt &= l2_{normalize}(txt_{emb})
\end{aligned}
$$

이후 learnable temperature, bias가 적용된 내적을 통해 코사인 유사도를 계산한다. 배치 사이즈가 n이기 때문에 $n \times n$ 행렬이 생긴다.

labels 행렬을 만든다. $eye(n)$은 대각 성분은 1이고 나머지는 0인 행렬이다. 결국 labels는 대각 성분은 1이고 나머지는 -1인 행렬이 된다.

positive pair 단일 샘플의 경우 i == j 이고 labels == 1 이므로 손실은 다음과 같다. 이 손실 값을 줄이기 위해 $logit_{ij}$를 키우는 방향으로 모델이 업데이트된다.
$$
\mathcal{L}_{ij}
=
-\log \sigma(\text{logit}_{ij})
$$

negative pair의 경우 i != j 이고 labels == -1 이므로 다음과 같다. 이 손실 값을 줄이기 위해 logit값을 작게 만들고자 하는 방향으로 모델이 학습한다.
$$
\mathcal{L}_{ij}
=
-\log \sigma(-\text{logit}_{ij})
$$

## 요약

CLIP은 배치 사이즈가 클수록 negative pair의 개수가 늘어나고 softmax 연산에서 분모에 기여하는 항이 늘어나며 모델이 더 어려운 문제를 풀도록 유도할 수 있다. SigLIP은 배치 사이즈가 클수록 한 번의 파라미터 업데이트에서 보는 negative pair의 개수가 늘어난다는 건 동일하지만 softmax 연산 대신 sigmoid를 채택하여 손실 함수가 배치 사이즈에 직접적으로 영향을 받지 않는다.

CLIP에서 배치 사이즈를 늘리는 건 multiclass classification 문제에서 클래스 종류를 늘리는 것과 같지만 SigLIP에서 배치 사이즈를 늘리는 건 binary classification 문제의 개수를 늘리는 것과 같다. SigLIP은 여전히 큰 배치 사이즈를 필요로 하지만 상대적으로 작은 배치 사이즈에서도 CLIP보다 더 나은 성능을 보이며 또한 contrastive learning에서 배치 사이즈는 무조건 클수록 좋을 것이라는 가정이 틀렸음을 보여준다.