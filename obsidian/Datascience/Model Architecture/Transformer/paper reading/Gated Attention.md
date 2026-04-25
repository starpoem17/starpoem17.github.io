
# Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free
https://openreview.net/forum?id=1b7whO4SfY

## 배경

Transformer에서 게이팅 방식은 강력한 효과를 보여주고 있지만 정확히 어떤 방식의 게이팅이 얼마나 효과적으로 작동하는 것인지, 게이팅 방식 자체가 효과적인 것인지 아니면 단순히 비선형성이 추가된 것으로 성능이 향상된 것인지 확인되지 않았다. 해당 연구는 30가지 종류의 변형 게이팅 방식들을 종합 비교했다고 말한다.

1. 게이팅 위치
- SDPA 뒤
- Value projection 뒤
- Key projection 뒤
- Query projection 뒤
- 최종 dense output layer 뒤

2. Headwise vs Elementwise
3. Head specific vs Head shared
4. Multiplicative vs Additive

## 결과

SDPA 뒤
Elementwise
Head specific
multiplicative using sigmoid
방식이 가장 좋은 결과를 냈다. 추가로 [[Sink Attention]]에서 제기된 attention sink 문제에 대해서도 해결된 모습을 보여 long context extrapolation에도 유리하게 작용한다고 한다.

![[Pasted image 20260425170717.png]]