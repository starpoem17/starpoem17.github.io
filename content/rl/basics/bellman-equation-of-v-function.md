---
title: 'Bellman Equation of V-function'
description: '기본적으로 재귀식 형태'
draft: false
date: 2026-04-06
tags:
  - "notes"
  - 'rl'
topSection: 'RL'
---
<div class="math-heading-block" data-heading-level="1"></div>
$$
V^{\pi}(s) = \mathbb E_{\pi} [R_{t+1} + \gamma V^{\pi}(S_{t+1}) \,|\, S_t = s]
$$
기본적으로 재귀식 형태

현재 상태의 가치 = 즉시 보상 + 미래의 보상. 이 아이디어가 강화학습 알고리즘의 기초가 된다.

## 1. $V^\pi(s)$
현재 상태 s의 가치
- 지금 상태 s에서 출발해서
- 정책 $\pi$대로 행동하면
- 평균적으로 얼마나 좋은 미래가 기대되는가

## 2. $\mathbb E_{\pi}[\cdot]$
기댓값이 필요한 이유
- 강화학습 환경은 대개 확률적이다

같은 상태에서 같은 행동을 해도
- 80% 확률로 다음 상태 $s_1$
- 20% 확률로 다음 상태 $s_2$
다음 상태가 다를 수 있다.

정책 $\pi$도 확률적이기에 같은 상태에서 같은 정책을 따르더라도 다음 행동이 다를 수 있다.

Bellman Equation은 "가능한 미래들의 평균치"를 본다.

## 3. $R_{t+1}$
즉시 보상.

상태 s에서 한 번 행동한 직후 받는 보상
- 지금 당장 좋음
- 지금 당장 손해

## 4. $\gamma$
discount factor

$[0, 1]$ 범위

먼 미래의 보상일수록 현재에는 작게 반영한다

무한합의 발산을 막는 장치

## 5. $V^{\pi}(S_{t+1})$
다음 상태의 가치

이 구조 때문에 재귀식

## 6. $S_t = s$
현재 상태는 s라는 evidence

# 더 풀어서 쓴 Bellman Equation
<div class="math-heading-block" data-heading-level="1"></div>
$$
V^{\pi}(s) = \sum_{a}\pi(a|s) \sum_{s', r}p(s', r | s, a)[r + \gamma V^{\pi}(s')]
$$
의미는 똑같다.

## 1. $\sum_{a}\pi(a|s)$
정책 $\pi$가 상태 $s$에서 행동 $a$를 선택할 확률

## 2. $\sum_{s', r}p(s',r|s,a)$
정책 $\pi$가 상태 s에서 행동 a를 선택했다고 가정한 상황.

상태 s 행동 a임을 evidence로 두고 이 경우 다음 상태로 $s'$이 나오고 보상으로 $r$이 나올 확률

## 3. $[r + \gamma V^{\pi}(s')]$
다음 상태가 $s'$, 즉시 보상으로는 $r$이 나왔다고 가정한 상황.

이 경우 얻는 1-step 보상.

즉, 정책 $\pi$가 선택할 수 있는 모든 행동 $a$에 대해, 그리고 선택된 행동 하나에 뒤따라오는 모든 후속 상태 $s'$과 즉시 보상 $r$에 대해 $\sum$를 돌려서 1-step 보상의 가중확률 합을 구한다.
