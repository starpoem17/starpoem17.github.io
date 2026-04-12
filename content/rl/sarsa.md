---
title: 'SARSA'
description: '\delta t = R {t+1} + \gamma Q(S {t+1}, A {t+1})   Q(S t, A t)'
draft: false
date: 2026-04-08
tags:
  - "notes"
  - 'rl'
topSection: 'RL'
---
# $$
\delta_t = R_{t+1} + \gamma Q(S_{t+1}, A_{t+1}) - Q(S_t, A_t)
$$
현재 정책이 실제로 고른 다음 행동 $A_{t+1}$을 활용해서 타겟을 만든다.

만약 $\epsilon - greedy \, policy$가 적용된다고 하면 SARSA에서는 랜덤 선택된 다음 행동이 타겟이 될 수도 있다. ([Q-Learning](./q-learning.md)과의 차이점)
