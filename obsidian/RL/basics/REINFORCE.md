
[[Policy gradient]]의 가장 기본적인 형태

[[Policy-based RL]]의 목적 함수 식은 다음과 같다.
$$
J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)]
$$

위 식을 $\theta$에 대해 미분하면 gradient를 얻을 수 있고 이를 바탕으로 모델 파라미터를 업데이트할 수 있다. 미분할 때 알아야 할 점은 $\theta$가 $\tau$(trajectory)값을 바꾸는 게 아니라 어떤 $\tau$가 나올 확률을 바꾼다는 점이다. 즉, 모델 파라미터 값이 바뀐다고 어떤 $\tau$값에 대한 리턴 값이 바뀌지 않는다. 그 $\tau$가 나올 확률만이 바뀐다. 어떤 $\tau$가 나올 확률을 $P_\theta(\tau)$라고 하자. 그러면 목적 함수 식은 다음과 같다.
$$
J(\theta) = \Sigma_\tau P_\theta(\tau) R(\tau)
$$

이 식을 $\theta$에 대해서 미분하면 다음과 같다.
$$
\nabla_\theta J(\theta)
=
\nabla_\theta
\sum_{\tau} P_\theta(\tau) R(\tau)
$$

미분 기호를 안으로 넣을 수 있다.
$$
\nabla_\theta J(\theta)
=
\sum_{\tau}
\nabla_\theta P_\theta(\tau) R(\tau)
$$

이제 $\nabla_\theta P_\theta(\tau)$를 어떻게 다룰 것이냐는 문제가 남는다. 여기에서 [[Log trick]]을 활용할 수 있다.
$$
\nabla_\theta P_\theta(\tau)
=
P_\theta(\tau)
\nabla_\theta \log P_\theta(\tau)
$$

Log trick을 적용하여 목적 함수 식을 변형하면 다음과 같다.
$$
\nabla_\theta J(\theta)
=
\sum_{\tau}
P_\theta(\tau)
\nabla_\theta \log P_\theta(\tau)
R(\tau)
$$

이 식은 다시 expectation 형태로 쓸 수 있다.
$$
\nabla_\theta J(\theta)
=
\mathbb{E}_{\tau \sim P_\theta}
\left[
\nabla_\theta \log P_\theta(\tau)
R(\tau)
\right]
$$

이제 trajectory 확률 $P_{\theta}(\tau)$를 풀어서 써보자. 먼저 trajectory부터 풀어서 써보면 다음과 같다.
$$
\tau = (s_0, a_0, r_0, s_1, a_1, r_1, \dots)
$$

위처럼 생긴 trajectory가 나올 확률은 다음과 같이 분해된다.
$$
P_\theta(\tau)
=
p(s_0)
\prod_{t=0}^{T}
\pi_\theta(a_t \mid s_t)
p(s_{t+1} \mid s_t, a_t)
$$
$p(s_0)$: 초기 상태 분포
$\pi_\theta(a_t \, | \, s_t)$: 정책이 상태를 보고 어떤 행동을 고를 확률
$p(s_{t+1} \, | \, s_t, a_t)$: 현재 상태, 정책이 선택한 행동이 주어졌을 때 다음 어떤 상태로 전이될 확률

중요한 점은 $\theta$가 정책 $\pi_{\theta}$ 안에만 들어있고 환경 transition $p(s_{t+1} \, | \, s_t, a_t)$에는 들어있지 않다는 것이다. 위 식에 로그를 취해 곱연산을 합연산으로 바꾸고 $\theta$와 연관없는 항들을 미분해서 날릴 수 있다. 로그를 취하는 이유는 위에서 다시 expectation 형태로 쓴 $\nabla_\theta J(\theta)$ 안에 $\nabla_\theta \log P_\theta(\tau)$가 있기 때문이다.

먼저 로그부터 취해보자.
$$
\log P_\theta(\tau)
=
\log p(s_0)
+
\sum_{t=0}^{T}
\log \pi_\theta(a_t \mid s_t)
+
\sum_{t=0}^{T}
\log p(s_{t+1} \mid s_t, a_t)
$$

이걸 $\theta$로 미분해서 연관없는 항들을 날리자.
$$
\nabla_\theta \log P_\theta(\tau)
=
\sum_{t=0}^{T}
\nabla_\theta
\log \pi_\theta(a_t \mid s_t)
$$

이제 이 식을 $\nabla_\theta J(\theta)$에 적용하면 다음과 같아진다.
$$
\nabla_\theta J(\theta)
=
\mathbb{E}_{\tau \sim \pi_\theta}
\left[
\left(
\sum_{t=0}^{T}
\nabla_\theta \log \pi_\theta(a_t \mid s_t)
\right)
R(\tau)
\right]
$$

괄호를 정리하면 다음과 같다.
$$
\nabla_\theta J(\theta)
=
\mathbb{E}_{\tau \sim \pi_\theta}
\left[
\sum_t
\nabla_\theta \log \pi_\theta(a_t \mid s_t)
R(\tau)
\right]
$$

## 약점 & 실제 구현

위 수식대로면 한 episode가 높은 보상을 받았을 때 해당 에피소드 내의 모든 행동들($\sum_t\nabla_\theta \log \pi_\theta(a_t \mid s_t)$)에 대해 좋은 점수($R(\tau)$)를 준다. 하지만 실제로는 좋은 행동과 나쁜 행동이 섞여있을 가능성이 높다. 따라서 실제 구현에서는 에피소드 전체 리턴인 $R(\tau)$ 대신 해당 시점 이후의 리턴인 $G_t$를 사용한다. 그러면 식은 다음과 같이 바뀐다.
$$
\nabla_\theta J(\theta)
=
\mathbb{E}_{\tau \sim \pi_\theta}
\left[
\sum_{t=0}^{T}
\nabla_\theta \log \pi_\theta(a_t \mid s_t)
G_t
\right]
$$

## 수식의 직관적 이해

한 마디로 표현하자면 "각 시점에서 실제로 했던 행동의 선택 확률을 그 행동 이후 실제로 얻은 리턴값에 비례하여 조정한다."

가장 낯선 항부터 보자. 이 항의 부호는 정책이 특정 상태에서 어떤 행동을 선택할 확률을 늘리는 방향을 의미한다.
$$
\nabla_\theta \log \pi_\theta(a_t \mid s_t)
$$

이 항에 $G_t$를 곱하면 특정 상황 $s_t$에서 행동 $a_t$를 선택할 확률을 높이는 방향으로 움직이되 그 행동 이후의 실제 성과 $G_T$에 비례하여 움직인다. 만약 $G_t$가 아주 큰 양수라면 행동 $a_t$가 좋은 영향을 끼친 것으로 판단하여 해당 행동을 선택할 확률을 크게 높인다. 반대로 $G_t$가 음수가 된다면 행동 $a_t$를 선택할 확률을 낮추는 방향으로 업데이트한다.

한 정책에서 여러 $\tau$를 샘플링하여 평균적인 업데이트 방향을 구한다. 한 에피소드의 결과는 운의 영향을 크게 받을 수 있기 때문이다. 예를 들어 어떤 행동이 실제로는 좋은 행동이나 몇몇 에피소드에서 안 좋게 평가될 수 있다. 평균을 통해 이러한 부정적 노이즈를 감쇠하고자 한다.
$$
\mathbb E_{\tau \sim \pi_{\theta}}[\cdot]
$$

## 파라미터 업데이트

목적 함수 값을 최대화하는 것이 목적이니 gradient ascent를 활용한다.
$$
\theta \leftarrow \theta + \alpha \nabla_\theta J(\theta)
$$

이론적으로는 그렇지만 많은 딥러닝 프레임워크들이 목적함수보다는 손실함수를 기대하기에 목적함수의 부호를 뒤집은 뒤 일반적인 gradient descent 알고리즘을 적용하기도 한다.