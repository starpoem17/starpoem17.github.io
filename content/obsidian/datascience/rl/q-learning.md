---
title: 'Q-Learning'
description: '\delta t = R {t+1} + \gamma \max {a''}(S {t+1}, a'')   Q(S t, A t)'
draft: false
date: 2026-04-09
tags:
  - "notes"
  - 'datascience'
topSection: 'Datascience'
---
# $$
\delta_t = R_{t+1} + \gamma \max_{a'}(S_{t+1}, a') - Q(S_t, A_t)
$$
현재 정책이 실제로 고른 다음 행동이 아닌 현재 Q함수를 기준으로 Q값을 최대화하는 어떤 행동 $a'$을 타겟으로 한다. 즉, 현재 환경에 대해 가장 완벽하고 이상적인 행동을 타겟으로 하는 것은 아니다.

만약 $\epsilon - greedy \, policy$가 적용된다고 해도 Q-learning에서는 랜덤 선택된 다음 행동이 타겟이 되지 않는다. ([SARSA](./sarsa.md)의 차이점)
