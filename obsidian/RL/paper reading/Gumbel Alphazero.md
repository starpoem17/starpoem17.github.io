
## POLICY IMPROVEMENT BY PLANNING WITH GUMBEL
https://openreview.net/forum?id=bERaNdoegnO

## 배경

Alphazero의 PUCT는 강력한 성능을 입증했지만 두 가지 문제가 있다.
1. 이론적으로 PUCT가 반드시 더 나은 수 탐색을 보장하지 않는다.
2. 기존 PUCT는 최소 200회 수준의 트리 탐색을 필요로 한다(탐색 비용이 비싸다.)

PUCT는 cumulative regret를 최소화하는 데에 특화된 알고리즘이다. 이것이 문제가 되는 이유는 체스 도메인과 이 아이디어가 어울리지 않기 때문이다. 체스에서 수 탐색을 진행하는 경우, 중간에 탐색 과정에서 생각하는 수들이 좋고 나쁜지는 전혀 중요하지 않다. 마지막에 실제로 두는 그 한 수만이 중요하다. 하지만 cumulative regret를 최소화하는 PUCT는 탐색 과정에서 생각하게 되는 수들까지도 최적으로 두려고 노력하기에 이러한 부분에서 연산 비효율 및 성능에서도 문제가 발생한다는 것이다.

본 연구는 Dirichlet noise와 temperature를 활용해 exploration을 진행하던 기존 PUCT 구조를 Gumbel noise와 Sequential Halving 아이디어를 도입하여 더 적은 계산 비용으로 더 나은 성능에 도달할 수 있음을 입증한다.

## Policy Improvement

### $$
\mathbb E[q(A_{n+1})] \ge \Sigma_a \pi(a) q(a)
$$
논문의 6번 수식. 논문 저자들은 행동 탐색 절차가 항상 위 부등식을 만족하도록 설계되면 기존 policy network보다 항상 더 낫거나 같은(나쁘지 않은) 정책 개선이 된다고 말한다.

$\pi(a)$: policy network가 행동 a를 고를 확률
$q(a)$: 행동 a를 선택했을 때의 Q-value
$A_{n+1}$: n번의 탐색 이후 실제로 선택하는 행동

즉, 부등식의 왼쪽 부분은 "탐색 알고리즘이 고르는 action의 기대 Q-value"이고 부등식의 오른쪽 부분은 "policy network $\pi$ 대로 행동했을 때의 기대 Q-value"이다.

### $$
q\!\left(
\arg\max_{a \in A_{\mathrm{top}\, n}} g(a) + \mathrm{logits}(a) + \sigma\!\left(q(a)\right)
\right)
\;\ge\;
q\!\left(
\arg\max_{a \in A_{\mathrm{top}\, n}} g(a) + \mathrm{logits}(a)
\right)
$$
논문의 7번 수식.  $\sigma(q(a))$가 양 변의 유일한 차이점이다. 논문 저자들은 Sequential Halving 과정을 통해 q(a)가 커질수록 유리해지는 단조증가함수 $\sigma(q(a))$를 통해 더 높은 Q-value를 리턴하는 행동 a에 가산점을 줄 수 있으며 이를 통해 적어도 policy network보다 못한 선택은 하지 않게 된다고 설명한다.

## Gumbel-max trick

일반적인 딥러닝 상황에서는 softmax 함수를 활용하여 확률 분포를 계산한 뒤 샘플링하지만 Gumbel-max trick을 사용하면 softmax 연산 없이도 동일한 효과를 얻을 수 있다.
### $$
\pi(a) = softmax(logits(a))
$$
위처럼 softmax를 계산하는 대신 $g(a) \sim Gumbel(0,1)$을 활용할 수 있다.
### $$
\arg\max_{a}(logits(a) + g(a))
$$
각 로짓에 Gumbel noise를 더한 뒤 argmax를 취하면 softmax를 명시적으로 계산하지 않고도 $\pi(a)$에서 샘플링한 것과 완전히 동일한 분포의 샘플을 얻을 수 있는 것이다.

굳이 softmax를 쓰지 않고 Gumbel trick을 사용하는 이유는 후술할 sequential halving과 연결하기 위함이다.

# Sequential Halving(SH)

![[Pasted image 20260413011012.png]]
Alphazero의 PUCT는 트리 방문 횟수가 가장 많았던 수를 최종 수로 선택하지만 본 연구는 SH를 제시한다. 작동 원리는 단순하다. $g + logits$가 큰 후보들을 랜덤으로 선택한 뒤 이후에는 탐색의 결과로 리턴되는 $\hat{q}$(정확한 Q-value를 알아내는 것은 불가능하다. 근사하여 대용으로 사용한다.) 값을 활용해 후보를 반씩 줄여나간다. 이 과정을 통해 탐색 예산을 효율적으로 분배할 수 있으며 적어도 policy network보다 나쁘지 않은 행동을 선택할 수 있다.