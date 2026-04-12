---
title: 'BPTT'
description: 'BPTT(Back Propagation Through Time)'
draft: false
date: 2026-03-27
tags:
  - "datascience"
  - "rnn"
  - "notes"
category: 'rnn'
---


BPTT(Back Propagation Through Time)

BPTT의 문제점
1. Gradient Vanishing Problem -> LSTM, GRU 등의 변형 아키텍처
2. attn과 같이 병렬 연산이 까다로움. 초대형 모델 학습에서 최적화 등의 문제 발생. 이는 트랜스포머 모델과 달리 순전파 연산에 있어서 필연적인 직렬성이 따르기 때문.
3. 역전파 연산 수행 시 gradient vanishing, exploding 문제가 발생하기 더 쉬움.

Truncated BPTT와 같은 형태도 있으나 임시 해결책일 뿐. 이 경우 먼 거리의 토큰끼리 주고받는 영향이 역전파에 반영되지 않는 문제가 있다.
