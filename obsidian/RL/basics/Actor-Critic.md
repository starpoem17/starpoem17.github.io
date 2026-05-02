
한 문장으로 표현하면 "정책을 학습하는 Actor와 그 정책이 얼마나 좋은지 평가해주는 Critic을 함께 쓰는 구조"이다.

## 배경

[[REINFORCE]] 알고리즘의 credit assignment problem, 일관되지 않은 return, 그로 인한 높은 분산 등의 문제로 학습이 불안정하다.

## 핵심 아이디어

에피소드가 끝날 때까지 기다리는 Monte carlo 방식 대신 [[Temporal Difference]]를 활용하자. 이러면 REINFORCE 알고리즘의 문제였던 높은 분산을 완화할 수 있다.

Actor-Critic에는 두 가지 학습 대상이 있다. 먼저 Actor는 정책이다. REINFORCE에서도 등장하던 익숙한 항이다.
$$
\pi_\theta(a \mid s)
$$

REINFORCE와 다른 점은 Critic, 가치 함수이다. $w$는 Critic의 파라미터이다.
$$
V_w(s)
$$

ㅇㅇ