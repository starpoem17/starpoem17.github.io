---
title: 'Bellman Optimality Equation'
description: 'Bellman Expectation Equation은 정책  \pi 가 정해져 있을 때 그 정책을 따를 경우의 가치에 관한 식이다.'
draft: false
date: 2026-04-08
tags:
  - "notes"
  - 'rl'
topSection: 'RL'
---

Bellman Expectation Equation은 정책 $\pi$가 정해져 있을 때 그 정책을 따를 경우의 가치에 관한 식이다. 
반면 Bellman Optimality Equation은 고정된 정책이 아닌 앞으로 매 순간 최적으로 행동할 경우의 가치에 관한 식이다.

# Optimal Value Function(최적가치함수)
# $$
V^*(s) = \max_{\pi}V^\pi(s)
$$
정의식은 위와 같다.

상태 s에서 시작했을 때 가능한 모든 정책 중 가장 높은 기대 $return$을 주는 정책이 내놓는 상태 가치

즉, 상태 s의 최선의 가치.

# Optimal Action-Value Function(최적행동가치함수)
# $$
Q^*(s,a) = \max_\pi Q^\pi(s,a)
$$
정의식은 위와 같다.

상태 s에서 먼저 행동 a를 하고 이후 가능한 최선의 정책을 쓴다고 했을 때 얻을 수 있는 최대의 $return$

즉, 지금 a를 하고 이후 최적으로 행동하면 얼마나 좋은가

# Expectation VS Optimality
# $$
Q^{\pi}(s,a) = \mathbb E_{\pi}[R_{t+1} + \gamma Q^{\pi}(S_{t+1}, A_{t+1})\,|\,S_t = s, A_t = a]
$$
Q-function의 Bellman Expectation Equation

여기서는 다음 행동 $A_{t+1}$이 정책 $\pi$에 의해 결정된다.

즉, 다음

# $$
Q^\pi(s,a) = \mathbb E[R_{t+1} + \gamma \max_{a'}Q^*(S_{t+1}, a') \, | \, S_t = s, A_t = a]
$$
Q-function의 Bellman Optimality Equation

여기서는 다음 행동을 정책 평균으로 보지 않는다. 다음 상태 $S_{t+1}$에 도달하면 가능한 행동 $a'$ 중 가장 좋은 것을 고른다고 가정한다.

즉, 지금 한 행동의 보상 + 다음 순간부터는 항상 최선의 선택을 한다고 가정한 미래 가치

그럼에도 $\mathbb E$가 식에 있는 이유는 환경의 확률성 때문

# 예시 상황

현재 상태 $s$에서 행동 $a$를 했더니 다음 상태 $s'$로 간다고 하자.

이제 $s'$에서는 두 행동이 가능하다.

- 왼쪽: 장기적으로 가치 3
- 오른쪽: 장기적으로 가치 10

그렇다면 최적 행동가치는 다음 상태 이후를 이렇게 본다.

$\max_{a'} Q^*(s', a') = 10$

즉, 최적으로 행동한다면 당연히 오른쪽을 고를 것이다.

따라서

$Q^*(s,a) = \mathbb E[R_{t+1} + \gamma \cdot 10]$

처럼 이해할 수 있다.

반면 Bellman expectation equation에서는 정책이 왼쪽 50%, 오른쪽 50%로 움직인다면,

$Q^\pi (s,a) = \mathbb E [R_{t+1} + \gamma (0.5 \cdot 3 + 0.5 \cdot 10)]$

처럼 평균을 보게 된다.

즉, optimality는 **평균적 미래**가 아니라 **최선의 미래**를 본다.

# 이걸 어디다가 쓰냐

강화학습 시 모델이 추종해야 할 타겟으로 쓰일 수 있다.
[Q-Learning](./q-learning.md)
