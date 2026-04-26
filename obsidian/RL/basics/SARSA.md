
[[Temporal Difference]]
# $$
\delta_t = R_{t+1} + \gamma Q(S_{t+1}, A_{t+1}) - Q(S_t, A_t)
$$
현재 정책이 실제로 고른 행동 $A_{t}$로 인해 $S_{t+1}$이 상태로 주어진다. 이 $S_{t+1}$에서 모델이 실제로 선택하는 그 다음 행동이 $A_{t+1}$이다. 즉, [[Q-table]] 상의 최적 행동이 타겟이 아니다.

만약 $\epsilon - greedy \, policy$가 적용된다고 하면 SARSA에서는 랜덤 선택된 다음 행동이 타겟이 될 수도 있다. ([[Q-Learning]]과의 차이점)

## On-policy algorithm

실제 행동 정책을 타겟으로 삼아 학습한다.