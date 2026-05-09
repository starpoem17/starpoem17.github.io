
## 배경

로봇이 제자리에서 한 바퀴 돌아야하는 상황에서 로봇은 왼쪽으로 돌 수도 있고, 오른쪽으로 돌 수도 있다. 둘 다 가능한 행동이며 정답이라고 할 수 있다. 즉, 같은 observation에 대해 가능한 action 정답이 여러 개이다. 이러한 상황을 multimodal action distribution이라고 한다. 수학적으로 표현하면 "확률 분포 $P(a \mid o)$가 여러 개의 봉우리를 갖는다."고 할 수 있다.

![[Pasted image 20260503210605.png]]
Figure 1은 이 같은 문제 상황에서 각 policy 표현 방식이 어떻게 동작하는지 보여준다.

먼저 explicit policy는 모델이 observation을 보고 바로 행동을 추론한다. Figure 1 (a)에서 나타나는 대표 방식 세 가지는 "scalar regression", "mixture of gaussian", "categorical"이다. 

Scalar regression의 경우 멀티모달 문제 상황에서 평균을 내는 경향이 있다. 왼쪽으로 도는 것이 -1, 오른쪽으로 도는 것이 1이라는 출력값이면 모델이 그 평균인 0을 출력할 수 있다. 이는 멀티모달 문제 상황에 적절하지 않다.

Mixture of Gaussian의 경우 멀티모달 문제에 꽤나 적절해 보이지만 몇 개의 가우시안 분포를 섞어 쓸 것인지 정하기 어렵고 여러 가우시안 분포 중 몇 개 분포가 행동 정책을 지배할 수 있다. 

Categorical 또한 멀티모달 문제에 좋아보인다. 각 action dimension에 대해 bin을 나누고 모델이 예측하도록 하는 것이다. 예를 들어 x축 dimension에 대해 \[-1, -0.9], \[-0.9, -0.8], ..., \[0.0, 0.1], ..., \[0.9, 1.0] 같은 bin을 만들 수 있다. 하지만 이 방식은 action dimension이 커질수록 카테고리의 개수가 급격히 증가한다. 예를 들어 x축 이동, y축 이동, 토크, 각도 등의 action dimension이 10개 존재하고 각 dimension을 10개 bin으로 나눈다고 가정하자. 그렇게 되면 선택 가능한 조합이 $10^{10}$개가 된다.

Implicit policy는 observation과 action을 모델에 모두 입력하고 그 출력 energy가 가장 낮은 값을 찾아 리턴한다. Energy는 부호가 역전된 Q-value 정도로 이해할 수 있다. Figure 1 (b) 그림을 보면 검은 선을 따라 에너지가 낮은 구간(멀티모달 문제에서는 가능한 정답 후보가 여러 개)이 있고 모델은 여기에서 가장 낮은 값을 리턴한다. 멀티모달 문제에 좋지만 추론 최적화(추론 상황에서도 가능한 행동 후보들을 모두 계산해야 함)와 불안정한 학습 문제가 있다.

논문에서 제시하는 diffusion policy는 implicity policy처럼 복잡한 분포를 표현하면서도 상대적으로 안정적인 학습이 가능하다고 저자들은 말한다. 또한 이미지 생성과 같은 고차원 출력 문제에서 diffusion 모델이 뛰어난 성능을 보였기에 single step of action이 아닌 action sequence 생성에도 유리해 모델이 근시안적으로 사고하는 문제를 피할 수 있다고 말한다.

## 아이디어

Closed-loop action-sequence prediction
Closed-loop: 로봇이 한 번 계획하고 끝내는 것(open-loop)이 아니라 실행 중 계속 관측을 받아 다시 계획한다.
모델이 액션을 독립적으로 생성하면 시간적 일관성(temporal consistency), 긴 맥락의 작업에서 부드러운 동작(smoothness in long-horizon)이라는 목적을 달성하기 힘들다. 따라서 Action-sequence를 생성하여 여러 스텝의 액션을 한 번에 추론한다.
$T_o$: observation horizon. 모델이 한 번에 보는 observation의 길이
$T_p$: action prediction horizon. 모델이 한 번에 예측하는 action의 길이
$T_a$: action execution horizon. 모델이 한 번에 실제 수행하는 action의 길이
예를 들어 $T_p = 16, T_a = 8$이라면 한 번에 16개 스텝의 액션을 생성하고 실제로는 8개 액션만 수행한다. 이후에는 다시 $T_o$개의 최신 관측을 보고 16개 예측을 생성하고 실제로는 8개 액션만 수행한다... (반복)
이를 통해 모델이 환경 변화에 예민하게 반응하도록 함과 동시에 시간적 일관성 또한 유지하도록 한다.
위 값들은 하이퍼파라미터이며 해당 연구에서는 $T_o = 2, T_p = 16, T_a = 8$ 설정이 많은 경우에 가장 좋은 성능을 보였다고 한다.

Warm starting
재계획을 할 때 완전히 처음부터 예측하지 않는다. 이전 행동으로 8개 스텝을 수행했다면 아직 8개의 행동 계획이 남아있다. 이렇게 남은 8개 행동 계획을 초기값으로 참고하여 재계획할 수 있다. 이를 통해 새 계획이 이전 계획과 단절되지 않고 부드럽게 이어질 수 있다.

Visual observation conditioning
해당 연구에서 모델이 디노이징하는 과정은 다음과 같은 수식으로 표현된다.
$$
A_t^{k-1}
=
\alpha
\left(
A_t^k
-
\gamma \epsilon_\theta(O_t, A_t^k, k)
+
\mathcal{N}(0, \sigma^2 I)
\right)
$$
$A_t^k$. 노이즈가 $k$번 들어간 action sequence.
$\gamma$. step size. 한 번에 얼마나 이동할 것인가.
$\epsilon_\theta (O_t, A_t^k, k)$. 모델이 예측한 노이즈. 노이즈 샘플에서 노이즈를 빼야 원본에 가까워진다.
$\alpha$. scaling factor. 1보다 약간 작은 값을 설정하는 것이 안정성을 높인다고 한다.
매 스텝 가우시안 노이즈를 더하는 이유는 Stochastic Langevin Dynamics와 연결된다. Langevin Dynamics는 확률 분포에서 샘플을 뽑기 위해 random noise를 더하는 과정을 반복한다. 이를 통해 모델이 결정론적으로 동작하는 것을 막을 수 있다. 앞서 언급했듯 멀티모달 분포 상황을 다루기 위해서는 다양한 정답 상황을 모델이 인식할 수 있어야 한다. 노이즈를 반복하여 더함으로써 모델이 확률 분포 전체를 탐색할 수 있다.

중요한 건 diffusion 모델이 예상되는 미래 상태, observation을 생성하지는 않는다는 것이다. 이를 통해 추론 연산은 효율적으로, action 예측은 정확하게 만들며 real time inference에도 적합한 모델을 훈련할 수 있다.
$$
P(A_t, O_t)
$$
위 식처럼 쓰면 모델이 action과 observation까지 생성 대상에 포함한다. 이 대신 다음과 같이 observation은 조건에만 넣어 모델이 생성은 하지 않도록 한다는 의미이다.
$$
P(A_t \mid O_t)
$$

데이터셋에서 원본 샘플을 하나 뽑고 $x^0$라고 하자. 이 샘플에 대해 랜덤한 숫자 $k$를 뽑고 $k$에 맞는 노이즈 $\epsilon^k$를 설정한다. $K$가 전체 iteration 횟수라면 $k$는 전체 반복 과정에서 특정 시점을 말한다. 랜덤 $k$를 뽑는 이유는 하나의 데이터 샘플에 대해 $K$번 연산하는 것은 학습이 너무 비싸고 특정 숫자 $k$에 대해서만 학습시키는 것은 일반화가 안 되기 때문이다. 이때 손실 함수는 다음과 같이 정의할 수 있다.
$$
	\mathcal L = MSE(\epsilon^k, \epsilon_\theta(O_t, A_t^0 + \epsilon^k, k))
$$

## 아키텍처

