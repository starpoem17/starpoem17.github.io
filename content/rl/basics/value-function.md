---
title: 'Value Function'
description: '강화학습에서 에이전트는 "무엇이 좋은가?"를 알고 싶어 한다. 이때 좋은 정도를 수치화한 것이 Value이다.'
draft: false
date: 2026-04-08
tags:
  - "notes"
  - 'rl'
topSection: 'RL'
---

강화학습에서 에이전트는 "무엇이 좋은가?"를 알고 싶어 한다. 이때 좋은 정도를 수치화한 것이 Value이다.
두 종류의 value function을 이해하기 위해 return의 개념을 알 필요가 있다.

# Return

Return이란 앞으로 받을 누적 보상을 말한다.
## $$
G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} \, ...
$$
$R_{t+1}$ : 지금 행동하고 받는 즉시 보상
그 뒤는 $[0,1]$의 범위를 갖는 상수 discount factor $\gamma$ 가 적용된 미래의 보상들

# State Value Function(상태가치함수)

정의식은 아래와 같다.
## $$
V^{\pi}(s) = \mathbb E_{\pi}[G_t \, | \, S_t = s]
$$
현재 상태가 s일 때 정책 $\pi$를 따르면 기대되는 return이 얼마인가

# Action Value Function(행동가치함수, Q-function)

정의식은 아래와 같다.
## $$
Q^{\pi}(s,a) = \mathbb E_{\pi}[G_t \, | \, S_t = s, A_t = a]
$$
현재 상태가 s이고 이번 행동을 a로 고정한 뒤부터 정책 $\pi$를 따르면 기대되는 return이 얼마인가

# Bellman Equation

위와 같은 가치 함수를 "현재 보상 = 즉시 보상 + 감쇠된 미래 보상" 형태로 쓴 재귀식이 Bellman Equation이다. 

각각의 가치 함수에 대해 Bellman Equation이 생긴다.
- 상태가치함수에 대한 Bellman Equation. [Bellman Equation of V-function](./bellman-equation-of-v-function.md)
- 행동가치함수에 대한 Bellman Equation. [Bellman Equation of Q-function](./bellman-equation-of-q-function.md)
