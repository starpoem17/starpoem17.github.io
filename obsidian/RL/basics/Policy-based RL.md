
$\leftrightarrow$ Value-based RL: 정책을 직접 학습하는 것이 아닌 높은 가치의 행동을 선택. ex) [[Q-Learning]], [[Q-table]], [[DQN]]

RL은 결국 "좋은 행동을 고르는 정책을 학습하는 것"이다.
$$
\pi(a \, | \, s)
$$

초기 강화학습에서는 정책을 직접 학습하기보다는 각 행동이 얼마나 좋은지를 학습한 뒤 그 값을 보고 행동을 선택했다. 즉, 각 행동의 점수를 학습한 뒤 가장 높은 점수의 행동을 선택하는 것을 정책으로 삼는다. Policy-based RL은 행동의 점수를 계산하는 간접적인 방식 대신 정책 자체를 직접 학습한다.

## 배경

[[DQN]]은 아타리 게임에서 큰 성과를 보이며 Value-based RL의 대표적인 성공 사례로 언급된다. 하지만 아타리 게임의 경우 가능한 행동의 가짓수가 유한하여(조이스틱 버튼 개수) 각 행동들의 Q-value를 계산하는 것이 가능했지만 현실 세계의 더 복잡한 문제들은 보통 그렇지 않다. 

로봇 팔을 동작하는 문제에서 행동들은 연속적이다. 팔을 움직이는 각도, 토크 등의 수치들은 이산적이지 않으며 가능한 행동들은 무한히 많다. 그러면 다음의 계산이 어려워진다. 모든 행동을 다 넣어보고 Q-value를 계산한 뒤 비교해볼 수 없기 때문이다.
$$
\arg\max_a Q(s,a)
$$

반면 policy based RL은 정책 네트워크가 행동을 직접 출력할 수 있다.
$$
a = \pi_\theta(s)
$$

확률적으로는 이렇게 표현할 수 있다.
$$
a \sim \pi_\theta(a \mid s)
$$

## 장점1: Exploration

Policy based RL의 또다른 장점은 exploration을 자연스레 녹여낼 수 있다는 점이다. Value-based RL은 기본적으로 가장 높은 Q-value를 가진 행동을 고른다. $\arg\max$는 결정론적이기에 $\epsilon-greedy$ 같은 방법으로 인위적인 exploration 전략을 넣을 수밖에 없다. 정책 확률 분포를 학습하는 policy based RL은 인위적 전략없이도 exploration이 가능하다.

## 장점2: 가능한 행동이 많아도 연산 효율이 크게 떨어지지 않는다

Value based RL은 가능한 행동이 100만 개라면 100만 개의 Q-value를 계산한 뒤 가장 큰 값을 찾아야하지만 policy based RL은 직접 확률 분포를 출력할 수 있다.

## 장점3: 최적 정책이 확률적인 문제에서도 잘 작동한다

가위바위보를 생각해보면 최적 정책이 가위, 바위, 보 중 하나를 고르는 형태가 아닐 수 있다. 항상 가위만 내는 정책은 좋아보이지 않는다. 이같은 경우 policy based RL은 자연스럽게 확률적인 최적 정책은 근사할 수 있다.

## 핵심 아이디어

Policy based RL에서 모델 파라미터를 $\theta$라고 표현하면 정책 확률 분포는 다음과 같다.
$$
\pi_\theta(a \mid s)
$$

에이전트가 환경에서 움직이며 만든 [[Trajectory]]가 다음과 같다고 하자.
$$
\tau = (s_0, a_0, r_0, s_1, a_1, r_1, \dots)
$$

이때 policy based RL의 목적 함수는 다음과 같다. 의미는 "현재 정책 $\pi_{\theta}$대로 행동했을 때 얻을 수 있는 Return의 기댓값"이다. 즉, policy based RL의 목적은 return의 기댓값을 최대로 하는 정책 $\pi_{\theta}$를 찾는 것.
$$
\begin{aligned}
J(\theta) &= \mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)] \\
&= \mathbb{E}_{r \sim \pi_\theta}[G_0] \\
&= \mathbb{E}_{\tau \sim \pi_\theta}[r_0 + \gamma r_1 + \gamma^2 r_2 + ...]
\end{aligned}
$$

Policy based RL은 다음 문제를 푼다고 짧게 표현할 수 있다.
$$
\theta^\* = \arg\max_\theta J(\theta)
$$

## 가장 대표적인 방법: [[Policy gradient]]