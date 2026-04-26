
[[Policy gradient]]의 핵심 기법으로 등장한다.

내용은 다음 항등식이 성립한다는 것이다.
$$
\nabla_\theta P_\theta(\tau)
=
P_\theta(\tau)
\nabla_\theta \log P_\theta(\tau)
$$

왜냐하면 다음 식이 성립하기 때문이다. 평범한 자연로그 미분을 생각해보자. $y = \ln x$, $y' = 1/x$.
$$
\nabla_\theta \log P_\theta(\tau)
=
\frac{1}{P_\theta(\tau)}
\nabla_\theta P_\theta(\tau)
$$

