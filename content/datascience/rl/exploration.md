---
title: 'Exploration'
description: '탐험을 위해 훈련 상황에서 모델의 수에 의도적인 무작위성을 부여'
draft: false
date: 2026-04-08
tags:
  - "datascience"
  - "rl"
  - "notes"
category: 'rl'
---

탐험을 위해 훈련 상황에서 모델의 수에 의도적인 무작위성을 부여

# $\epsilon - greedy \, policy$

$\epsilon$ 확률만큼 random action, $1-\epsilon$만큼 greedy action 선택. ($epsilon$은 $[0,1]$ 스케일)

전형적인 방식은 $argmax$로 greedy action을 선택하고 random action 선택의 경우 가능한 모든 행동들에 대해 uniform distribution을 만들어서 선택.
