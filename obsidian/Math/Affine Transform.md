
입력값에 선형 변환을 한 뒤 평행이동을 추가하는 변환

가장 기본적인 형태는 다음과 같다. $x$는 벡터.
$$
y = Ax + b
$$

뉴럴 네트워크에서의 FFN도 affine transform이다.
$$
h = Wx + b
$$

확률 분포에서도 affine transform이 등장한다. 이 경우 확률 분포의 모양은 변하지 않으면서 평균, 분산만 바뀐다. 간단한 표준 정규 분포 예시를 살펴보자.
$$
\begin{aligned}
x' = \sigma x + \mu,& \qquad x \sim \mathcal N(0, I) \\
\\
x' \sim& \mathcal{N}(\mu, \sigma^2 I)
\end{aligned}
$$
$x \in \mathbb R^n$
$\sigma \in \mathbb R$
$\mu \in \mathbb R^n$
$I \in \mathbb R^{n \times n}$

일반화된 수식으로는 다음과 같이 쓸 수 있다.
$$
\begin{aligned}
x' = Ax + b,& \qquad x \sim \mathcal{N}(\mu, \Sigma) \\
\\
x' = Ax + b &\sim \mathcal{N}(A\mu + b, A\Sigma A^\top)
\end{aligned}
$$
$A \in \mathbb R^{m \times n}$
$x \in \mathbb R^n$
$b \in \mathbb R^m$
$\mu \in \mathbb R^n$
$\Sigma \in \mathbb R^{n \times n}$
$A\Sigma A^T = (m \times n) \times (n \times n) \times (n \times m) = (m \times m)$. 
설사 $\Sigma = I$이더라도(공분산이 0. 특히 가우시안 분포에서는 두 좌표축 방향의 확률변수가 독립적) 선형 변환 과정에서 상관성(공분산)이 생길 수 있다.
