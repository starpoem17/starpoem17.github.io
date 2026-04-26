
[[Temporal Difference]]
# $$
\delta_t = R_{t+1} + \gamma \max_{a'}(S_{t+1}, a') - Q(S_t, A_t)
$$
현재 정책이 실제로 고른 다음 행동이 아닌 현재 Q함수를 기준으로 Q값을 최대화하는 어떤 행동 $a'$을 타겟으로 한다. 즉, [[Q-table]] 상에서 가장 높은 Q-value를 보이는 행동을 $a'$로 결정한다.

현재 환경에 대해 가장 완벽하고 이상적인 행동을 타겟으로 하는 것은 아니다. (이상적인 Q-table을 얻을 수는 없으니까)

만약 $\epsilon - greedy \, policy$가 적용된다고 해도 Q-learning에서는 랜덤 선택된 다음 행동이 타겟이 되지 않는다. ([[SARSA]]의 차이점)

## Off-policy algorithm

실제 행동 정책과 다른 정책을 타겟으로 삼는다.