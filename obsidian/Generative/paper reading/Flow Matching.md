
## 배경: Diffusion

생성형 모델이 풀고 싶은 문제는 "우리가 가진 데이터를 학습해서 새로운 샘플을 만드는 것."이다. 예를 들어 고양이 이미지의 경우 현실 세계의 고양이 이미지 분포에서 하나를 샘플링하는 것은 어렵다. 대신 가우시안 노이즈 이미지를 쉽게 샘플링한 뒤 이 이미지를 모델이 변환할 수 있다. 저자들은 deep generative model의 목적은 unknown data distribution을 추정하고 샘플링하는 것이라고 정의하며 최근 생성 모델의 발전은 diffusion based model 덕분이었다고 설명한다.

Diffusion model은 다음 아이디어에서 출발한다.
```
Forward process에서 데이터에 점점 노이즈를 섞는다.
깨끗한 이미지
→ 조금 노이즈 낀 이미지
→ 더 노이즈 낀 이미지
→ 거의 완전한 Gaussian noise
```

```
Reverse process에서는 모델이 그 반대 방향을 학습한다.
Gaussian noise
→ 덜 노이즈 낀 이미지
→ 더 선명한 이미지
→ 최종 이미지
```

모델은 현재 noisy sample에서 제거해야 할 노이즈를 예측한 뒤 이 노이즈를 제거하는 과정을 재귀적으로 반복하여 랜덤 노이즈 샘플에서 그럴 듯한 데이터 샘플을 얻을 수 있다. 이러한 방식은 이미지, 비디오, 오디오 생성에서 성공적이었으나 단점 또한 있다.

재귀적 반복이라는 추론 방식은 필연적으로 높은 계산 비용을 갖는다. 저자들은 본인들의 OT 방식이 diffusion 방식에 비해 더 효율적임과 동시에 모델이 학습하기 더 쉬운 타겟을 제시한다고 말한다.

## 사전지식: CNF(Continuous Normalizing Flow)

Diffusion 이전에도 노이즈를 데이터로 바꾸는 모델이 있었다. 대표적인 것이 Continuous Normalizing Flow이다. CNF는 샘플의 상태를 시간에 따라 연속적으로 변하는 것으로 보고 현재 noisy sample 상태와 시간 t를 보고 어느 방향으로 움직여야 데이터가 되는지 학습한다. 

즉, Z라는 노이즈 샘플이 있을 때 다음과 같이 단순하게 작동하는 방식이 아니다.
"노이즈에 벡터 Δ를 한 번 더하면 데이터 x가 된다."
$$
z + Δ = x
$$

대신 비유적으로 표현하면 CNF는 연속적인 길안내처럼 동작한다.
```
t = 0.00: 오른쪽 위로 조금 가라
t = 0.01: 이번에는 위쪽으로 조금 가라
t = 0.02: 약간 왼쪽으로 휘어라
...
t = 1.00: 데이터 분포 근처 도착
```

CNF에서 알고 가야하는 주요 함수는 3개이다. 
$p_t(x)$: Probability density path
$v_t(x)$: Vector field
$\phi_t(x)$: Flow

## CNF: Probability Density Path

데이터가 $\mathbb R^d$ 공간에 존재한다고 하자. 만약 RGB $224 \times 224$ 이미지가 데이터라면 $d=3 \times 224 \times 224 = 150,528$이고 데이터 $x \in \mathbb R^{150,528}$이라고 할 수 있다.

Probability density path $p$는 시간에 따라 변하는 분포이다.
$$
p : [0, 1] \times \mathbb{R}^d \to \mathbb{R}_{>0}
$$
위 식의 의미는 \[0,1] 범위로 정규화된 시간 $t$와 $\mathbb R^d$ 공간의 데이터를 입력받은 $p$가 양의 실수를 리턴한다는 것이다. 즉, $p$는 $t$와 $x$를 입력으로 받으며 다음과 같이 표현된다.
$$
p_t(x)
$$

$p_0$는 노이즈 샘플 $x_0$가 나오는 표준 정규 분포이다.
$p_1$은 실제 데이터가 나오는 true distribution $q$를 근사하는 확률 분포이다.
즉, CNF가 $p$를 학습하는 것은 노이즈 분포를 실제 데이터 분포 근사처럼 바꾸는 변환 과정이라고 할 수 있다.

추가로 $p$는 확률 밀도 함수이기에 다음 또한 만족한다. 각 시간대 $t$별로 모든 데이터 샘플을 더하면 전체 확률 1이 된다는 의미이다.
$$
\int p_t(x) dx = 1
$$

여기서 오해하면 안 되는 것이 $p_t(x)$는 노이즈 데이터 $x_0$ 하나가 따라가는 경로가 아니다. 데이터가 따라가는 경로는 trajectory, flow $\phi$로 표현되며 후술할 예정이다. 즉, 해당 논문에서는 path와 trajectory를 구분하여 읽어야 한다.
path: 분포가 이동하는 경로. CNF가 진정으로 학습하고 싶은 것.
trajectory: 샘플 하나가 이동하는 경로

간단한 예시를 통해 구체화해보자.
1차원에서 표준정규분포를 따르는 노이즈 분포를 양의 방향으로 이동시키는 단순한 path가 있다면 수식적으로 다음과 같이 표현할 수 있다. 아래 수식은 $p_t$에서 $x$를 샘플링하는 것과 분포 $\mathcal N(t, 1)$에서 $x$를 샘플링하는 것이 같다는 의미이다.
$$
p_t(x) = \mathcal{N}(x \mid t, 1)
$$

수치를 대입하여 확인해보면 다음과 같다.
$$
\begin{aligned}
p_0(x) &= \mathcal N(x \mid 0, 1) \\
p_{0.5}(x) &= \mathcal N(x \mid 0.5, 1) \\
p_1(x) &= \mathcal N(x \mid 1, 1)
\end{aligned}
$$

각 시간 $t$마다 정규분포가 있어 $\int p_t(x) dx = 1$를 만족한다.
시간 $t$에 따라 정규분포의 중심이 이동한다. 즉, $p_t$는 시간에 따라 이동하는 분포의 path이다.

## CNF: Vector Field

논문에서 말하는 vector field는 다음과 같다.
$$
v : [0, 1] \times \mathbb{R}^d \to \mathbb{R}^d
$$

마찬가지로 시간과 데이터를 입력으로 받는다.
$$
v_t(x)
$$

의미하는 바는 단순하다. "현재 노이즈 샘플 $x$를 실제 데이터에 가깝게 만들기 위해 어느 벡터 방향으로 진행해야 하는가?"

CNF 모델이 직접적으로 학습하는 것은 vector field이다. 궁극적으로는 모델이 학습한 vector field가 만들어내는 분포가 probability density path를 따르도록 하는 것이 목적이다.

## CNF: Flow

Vector field를 활용해서 그 이동 경로인 flow를 만들 수 있다. 논문에서 말하는 flow는 다음과 같다.
$$
\phi : [0,1] \times \mathbb R^d \rightarrow \mathbb R^d
$$

의미는 "처음에 $x$에 있던 데이터가 vector field를 따라 시간 $t$까지 움직였을 때 도착한 위치"이다. 예를 들어보자.
노이즈 샘플 $x_0$에서 시간이 흐르지 않았으므로 $x_0$ 그대로이다.
$$
\phi_0(x_0) = x_0
$$

노이즈 샘플 $x_0$에서 시간 1까지 이동했으므로 최종 데이터 샘플이 나올 것으로 기대되나 vector field가 완벽하지 않을 수 있기에(모델 출력이 완벽하지 않을 수 있기에) 근사로 표현된다.
$$
x_0 \sim p_0,\qquad \hat{x}_1 = \phi_1(x_0),\qquad \hat{x}_1 \sim p_1 \approx q
$$

Vector field와 flow 사이의 관계를 수식으로 표현하면 다음과 같다.
$$
\frac{d}{dt}\phi_t(x) = v_t(\phi_t(x))
$$
Flow trajectory의 미분, 순간 속도가 vector field이다.
적분식으로 쓰면 다음과 같다.
$$
\phi_t(x_0)=x_0+\int_0^t v_s(\phi_s(x_0))\,ds
$$

## CNF: Push-Forward Equation

Push-forward equation이 성립한다면 모델 예측 $v_t$가 분포 $p_t$의 이동을 설명할 수 있음이 증명된다.

Push-forward equation의 식 형태는 다음과 같다.
$$
p_t = [\phi_t]_* p_0
$$
$[\cdot]_*$은 논문에서 정의하는 연산 기호로 push-forward operation을 의미한다. 위 식을 말로 풀어 설명하면 $p_0$에서 샘플들을 뽑고 해당 샘플들을 $\phi_t$를 따라 이동시켰을 때 나타나는 분포가 $p_t$라는 의미이다.

즉, 아래 수식의 의미를 짧게 함축한 것이 push-forward equation이다.
$$
x_0 \sim p_0,\qquad x_t = \phi_t(x_0), \qquad x_t \sim p_t
$$

아주 간단한 예시를 살펴보자.
$p_0 = \mathcal N(0,1)$이고 $\phi(x) = x + 3$ 이라고 하자. Flow는 이 경우 단순히 양수 방향으로 3만큼 이동시키는 함수이다. 이때 $p_0$를 flow를 따라 이동시키는 수식은 다음과 같다. Flow가 샘플들을 이동시키기에 그 분포 또한 똑같이 이동한 것이다ㅏ.
$$
\begin{aligned}
x_1&=\phi(x_0)=x_0+3 \\
x_1 &\sim \mathcal{N}(3,1)
\end{aligned}
$$

이걸 push-forward 방식으로 쓰면 다음과 같이 간략히 표현된다.
$$
p_1 = [\phi]_*p_0
$$

CNF의 목적이 $p_1 \approx q$임을 고려하면 다음과 같이 고쳐쓸 수 있다.
"CNF는 $[\phi_1]_* p_0 \approx q$ 를 만족하는 $\phi$를 찾고자 한다."

Push-forward operation을 구체화하면 다음과 같다.
$$
p_t(x)
=
[\phi_t]_*p_0(x)
=
p_0(\phi_t^{-1}(x))
\det\left[
\frac{\partial \phi_t^{-1}}{\partial x}(x)
\right]
$$

최우측 식의 항들을 하나씩 살펴보자.
$p_0(\phi_t^{-1}(x))$. $x$에 도착한 샘플이 시간 $t$만큼 이동하기 이전에는 어디에 있었으며 그 샘플은 $p_0$ 분포에서 어떤 밀도 값을 갖는가.
$\det\left[\frac{\partial \phi_t^{-1}}{\partial x}(x)\right]$. 확률 밀도는 공간의 부피에 반비례한다. 어떤 변환이 공간을 넓게 펼치면 같은 확률 질량이 넓게 퍼지므로 밀도는 낮아진다.

하지만 이미지와 같은 고차원 실수 공간에서 determinant를 계산한다든가 역함수 연산을 한다든가 하는 것은 비용이 비싸다. 따라서 본 연구에서는 동등한 검증 조건을 갖는 continuity equation을 통해 증명한다.

## CNF: [[Continuity Equation]]

$$
\frac{\partial}{\partial t}p_t(x)
+
\operatorname{div}\left(p_t(x)v_t(x)\right)
=0
$$
위 식이 성립하면 "$p_t$라는 밀도의 변화가 $v_t$라는 흐름에 의해 생긴 것"으로 볼 수 있다. 

하지만 이 식 또한 실전 학습에서 매번 풀지 않는다. 대신 continuity equation을 만족하는 target vector field $u_t$를 만들고 모델이 이를 추종하도록 만든다.

## 아이디어: Naive Flow Matching

$$
\mathcal L_{FM}(\theta) = \mathbb E_{t \sim U[0,1], p_t(x)} \left\| v_t(x) - u_t(x) \right\|^2
$$
$p_t$를 향해 가는 $u_t$라는 이상적인 vector field를 설정하고 모델이 출력하는 벡터장 $v_t$가 이를 추종하도록 손실 함수를 설계한다. 따라서 손실이 0이 되면 우리가 만든 CNF 모델이 $p_t$를 잘 만들 수 있다. 하지만 문제는 위 식의 $p_t$도, $u_t$도 알 방법이 없다는 것이다.

## 아이디어: Conditional Flow Matching

$u_t(x)$는 알 수가 없다. 전체 노이즈 분포 $p_0$에서 정답 데이터 분포 $p_t$로 향해가는 vector field를 아는 것은 어렵지만 몇몇 데이터 샘플들에 대한 벡터장을 계산하는 것은 가능하다.

$$
\mathcal L_{CFM}(\theta) = \mathbb E_{t \sim U[0,1], q(x_1), p_t(x \mid x_1)}||v_t(x) - u_t(x \mid x_1)||^2
$$
계산하기 어려운 $p_t$, $u_t(x)$ 대신 $p_t(x \mid x_1), u_t(x \mid x_1)$을 쓰면 unbiased esimate가 가능하다. $\mathcal L_{FM}$을 미분하는 것과 $\mathcal L_{CFM}$을 미분하는 것에서 같은 gradient를 얻을 수 있다.

## Gaussian Conditional Path

그럼 $p_t(x \mid x_1)$은 어떻게 구할 것인가? 수식은 다음과 같다.
$$
p_t(x \mid x_1) = \mathcal N(x \mid \mu_t(x_1), \sigma_t(x_1)^2I)
$$

데이터 샘플 하나를 condition으로 두고 평균과 분산이 바뀌는 가우시안 분포를 쓴다.

$t=0$인 경우, $\mu_0(x_1) = 0, \sigma_0(x_1) = 1$로 설정한다.
$p_0$는 표준 정규 분포가 되어 노이즈가 샘플링되는 분포를 의미한다. 어떤 데이터 샘플 $x_1$이 condition으로 주어지든 변하지 않는다.

$t=1$인 경우, $\mu_1(x_1) = x_1, \sigma_1(x_1) = \sigma_{min}$으로 설정한다. $\sigma_{min}$은 임의의 아주 작은 수.
$p_1$은 평균이 타겟 데이터 샘플 $x_1$이고 분산이 아주 작아 데이터 샘플에 몰려있는 분포이다. 분산을 0으로 설정하면 더 이상 일반적인 확률 분포로 다루기 어렵다. 작은 오차를 허용하여 CE loss의 라벨 스무딩과 비슷한 효과를 얻을 수 있다.

이렇게 Gaussian path를 정하면 이 path를 만들어내는 conditional vector field를 닫힌 형태로 계산해 얻을 수 있다.

## Optimal Transport

Optimal Transport(OT)를 학습 타겟으로 제시한다. 저자들은 OT가 diffusion 방식에 비해 더 효율적이고 나은 성능을 보이는 학습 타겟이라고 말한다.


![[Pasted image 20260502165328.png]]
Figure 3을 통해 diffusion 방식은 노이즈에서 데이터 샘플로 이동하는 경로가 복잡하고 비효율적임을 단순화해서 보여준다. 반면 OT 방식은 더 단순하고 직선적인 학습 타겟을 모델에 제시하여 빠른 학습과 효율적인 추론 연산을 가능하게 한다. 실제로 diffusion 방식은 최종 목적지에 도달한 뒤에도 계속 진행하여 지나쳤다가 되돌아오는 overshoot and backtracking 현상이 발생할 수 있다고 말한다.

선형적이고 직관적인 평균, 표준편차를 설정하는 것이 자연스럽지 않냐는 의문에서 저자들은 다음과 같은 값들을 제시한다. 저자들은 단순하기에 모델이 학습하기 쉬울 것으로 예상되며, 실제로도 두 가우시안 분포 사이의 optimal transport solution과도 맞아떨어진다고 설명한다.
$$
\begin{aligned}
\mu_t(x) = tx_1,& \qquad \sigma_t(x) = 1 - (1 - \sigma_{min})t \\
\\
u_t(x \mid x_1) &= \frac{x_1 - (1 - \sigma_{min})x}{1 - (1 - \sigma_{min})t}
\end{aligned}
$$

위와 같은 평균, 표준편차를 통해 conditional flow를 정의하면 다음과 같다.
$$
\psi_t(x) = (1 - (1 - \sigma_{min})t)x + tx_1
$$

$\psi_t(x)$는 앞서 정의한 분포 $p_0$를 $p_t$로 옮기는 선형 보간이다. 따라서 저자들은 실제로 OT가 straight line trajectory를 만든다고 설명한다.

[[Affine Transform]]을 사용하여 위 식이 유도되는 것을 확인할 수 있다.
$$
x_0 \sim \mathcal N(0, I)
$$
위 식의 $x_0$에 대해 $\psi_t$를 적용하여 아핀 변환하면 다음과 같다.
$$
\psi_t(x_0) = (1 - (1 - \sigma_{min})t)x_0 + tx_1 \sim \mathcal{N}\left(t x_1,\left(1-(1-\sigma_{\min})t\right)^2I\right) = p_t
$$

따라서 $\psi_t(x_0) = x_t$.

## 학습

학습 상황에서는 \[0,1] 범위의 $t$를 랜덤 샘플링한 뒤 해당 시간 $t$에서의 데이터 샘플 $x_1$, 노이즈 샘플 $x_0$, 중간 샘플 $x_t$를 만들고 모델이 그 시점에서의 target vector field를 학습하도록 한다.

$x_t$는 다음 수식을 활용해서 구한다.
$$
x_t = \psi_t(x_0) = (1 - (1 - \sigma_{min})t)x_0 + tx_1
$$

모델 학습 타겟은 $x_t = \psi_t(x_0)$이므로 다음과 같다.
$$
u_t(\psi_t(x_0) \mid x_1) = \frac{d}{dt}\psi_t(x_0)
$$

## 추론

추론 상황에서는 $x_1$이 없다. 또한 적분 대신 임의의 횟수의 연산 반복을 통해 근사한다. 즉, 적분 구간 \[0,1]을 10개 구간으로 근사할 수도 있고, 50개 구간으로 근사할 수도 있다.

추론 과정을 보면 먼저 노이즈를 샘플링한다.
$$
x_0 \sim \mathcal{N}(0,I)
$$

그다음 모델을 통해 vector field를 계산한다. $x_t$ 미분값을 모르니 모델을 통해 추론하는 것이다.
$$
v_t(x_t;\theta) = \frac{d}{dt}x_t
$$

작은 스텝으로 적분을 근사한다.
$$
x_{t+\Delta t}
=
x_t + \Delta t \cdot v_t(x_t;\theta)
$$

예를 들어 보자. 100 스텝으로 근사한다면 다음과 같다.
$$
\begin{aligned}
x_{\frac{1}{100}} &= x_0 + \frac{1}{100}v_0(x_0;\theta) \\
\\
x_{\frac{2}{100}} &= x_{\frac{1}{100}} + \frac{1}{100} v_{\frac{1}{100}}\left(x_{\frac{1}{100}};\theta\right) \\
\\
...
\end{aligned}
$$

학습 상황에서는 $x_1$을 알기 때문에 $x_t = \psi_t(x_0)$를 활용해서 $x_t$를 계산하고 이를 미분한 값을 타겟으로 설정한다.
추론 상황에서는 $x_1$을 모르니 $x_t = \psi_t(x_0)$도 모른다. 