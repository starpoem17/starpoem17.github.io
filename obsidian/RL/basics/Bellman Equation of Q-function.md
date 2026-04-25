# $$
Q^{\pi}(s,a) = \mathbb E_{\pi}[R_{t+1} + \gamma Q^{\pi}(S_{t+1}, A_{t+1})\,|\,S_t = s, A_t = a]
$$
식의 각 항에 대해서는 [[Bellman Equation of V-function]]의 설명과 일맥상통한다.

# 실전에서 Q-function이 중요한 이유

### $a^* = argmax_a Q(s,a)$
위 식을 통해 현재 상태 s에서 가장 좋은 행동을 바로 고를 수 있다.