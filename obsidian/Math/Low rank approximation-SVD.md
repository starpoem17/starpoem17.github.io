
Singular Value Decomposition이 딥러닝에서 갖는 의미에 대해 알아보자. 다음은 우리가 익히 아는 SVD 수식이다.
$$
\begin{aligned}
W &= U \Sigma V^T \\
U &= WW^T \\
\Sigma &= diag(\sigma_1, \sigma_2, ...) \\
V &= W^TW
\end{aligned}
$$
$$
W \in \mathbb R^{m \times n}, \quad
U \in \mathbb{R}^{m \times m}, \quad
\Sigma \in \mathbb{R}^{m \times n}, \quad
V \in \mathbb{R}^{n \times n}
$$

$U, V$는 orthogonal matrix이므로 다음과 같다.
$$
U^\top U = I, \quad V^\top V = I
$$

SVD 수식을 다음과 같이 변형할 수 있다.
$$
WV = U \Sigma
$$
행렬 $U, V$의 열벡터를 각각 $u_i, v_i$라 하고 $\Sigma$의 대각 성분을 $\sigma_i$라 하면 다음과 같다.
$$
Wv_i = \sigma_i u_i
$$
이때 $v_i$를 input singular direction, $u_i$를 output singular direction이라고 한다. 식의 의미는 "input singular direction $v_i$ 방향으로 들어온 벡터는 선형 변환 $W$를 거치며 길이가 $\sigma_i$배 된 output singular direction $u_i$ 방향으로 나간다."는 것이다. 즉, 어떤 벡터 $x$가 행렬 $W$에 의해 선형 변환 되는 경우 벡터 $x$의 각 방향 성분은 $V^T$와 곱해지며 input singular direction 방향으로 정렬되고, $\Sigma$ 행렬에 의해 각 방향 성분의 크기가 조정되며, 최종적으로 output singular direction 방향으로 정렬되어 나간다.

예시를 통해 살펴보자.
$$
W =
\begin{bmatrix}
\sqrt{2} & -\sqrt{2} & 0 \\
\frac{3}{\sqrt{2}} & \frac{3}{\sqrt{2}} & 0 \\
0 & 0 & 1
\end{bmatrix}
$$
$$
U =
\begin{bmatrix}
0 & -1 & 0 \\
1 & 0 & 0 \\
0 & 0 & 1
\end{bmatrix},
\quad
\Sigma =
\begin{bmatrix}
3 & 0 & 0 \\
0 & 2 & 0 \\
0 & 0 & 1
\end{bmatrix},
\quad
V =
\begin{bmatrix}
\frac{1}{\sqrt{2}} & -\frac{1}{\sqrt{2}} & 0 \\
\frac{1}{\sqrt{2}} & \frac{1}{\sqrt{2}} & 0 \\
0 & 0 & 1
\end{bmatrix}
$$
Input singular direction
$$
v_1 =
\begin{bmatrix}
\frac{1}{\sqrt{2}} \\
\frac{1}{\sqrt{2}} \\
0
\end{bmatrix},
\quad
v_2 =
\begin{bmatrix}
-\frac{1}{\sqrt{2}} \\
\frac{1}{\sqrt{2}} \\
0
\end{bmatrix},
\quad
v_3 =
\begin{bmatrix}
0 \\
0 \\
1
\end{bmatrix}
$$

Output singular direction
$$
u_1 =
\begin{bmatrix}
0 \\
1 \\
0
\end{bmatrix},
\quad
u_2 =
\begin{bmatrix}
-1 \\
0 \\
0
\end{bmatrix},
\quad
u_3 =
\begin{bmatrix}
0 \\
0 \\
1
\end{bmatrix}
$$

Singular value
$$
\sigma_1 = 3,\quad \sigma_2 = 2,\quad \sigma_3 = 1
$$

먼저 $Wv_i = \sigma_i u_i$ 식이 성립함을 $i=1$인 상황을 통해 확인해보자.
$$
Wv_1 =
\begin{bmatrix}
\sqrt{2}\frac{1}{\sqrt{2}} - \sqrt{2}\frac{1}{\sqrt{2}} \\
\frac{3}{\sqrt{2}}\frac{1}{\sqrt{2}} + \frac{3}{\sqrt{2}}\frac{1}{\sqrt{2}} \\
0
\end{bmatrix}
=
\begin{bmatrix}
0 \\
3 \\
0
\end{bmatrix}
= 3u_1
$$

이번에는 일반적인 벡터 $x$가 선형 변환을 거치는 과정을 살펴보자.
$$
x =
\begin{bmatrix}
1 \\
2 \\
3
\end{bmatrix}
$$

SVD 관점에서 $x$는 $W$와 바로 곱해지는 것이 아니라 다음의 단계를 거친다고 볼 수 있다.
$$
x
\overset{V^\top}{\longrightarrow}
V^\top x
\overset{\Sigma}{\longrightarrow}
\Sigma V^\top x
\overset{U}{\longrightarrow}
U\Sigma V^\top x
$$

먼저 $V^Tx$는 벡터 $x$가 input singular direction 성분 $v_1, v_2, v_3$을 각각 얼마나 갖고 있는지를 의미한다. 
$$
V^\top x =
\begin{bmatrix}
\frac{1}{\sqrt{2}} & \frac{1}{\sqrt{2}} & 0 \\
-\frac{1}{\sqrt{2}} & \frac{1}{\sqrt{2}} & 0 \\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
1 \\
2 \\
3
\end{bmatrix}
=
\begin{bmatrix}  
\frac{3}{\sqrt{2}} \\  
\frac{1}{\sqrt{2}} \\  
3  
\end{bmatrix}
$$

즉, 위 식을 다음과 같이 해석할 수 있다. $V^Tx$는 단순한 행렬곱이 아니라, $x$를 input singular direction 기준으로 분해하는 과정이다.
$$
x =
\frac{3}{\sqrt{2}}v_1
+
\frac{1}{\sqrt{2}}v_2
+
3v_3
$$

다음으로 $\Sigma$를 곱하는 것은 각 방향 성분의 크기를 singular value만큼 조정한다는 의미이다. $v_i$ 방향 성분을 $\sigma_i$만큼 곱해 늘리거나 줄인다. 방향을 바꾸지 않는다는 점이 중요하다.
$$
\Sigma V^\top x =
\begin{bmatrix}
3 & 0 & 0 \\
0 & 2 & 0 \\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
\frac{3}{\sqrt{2}} \\
\frac{1}{\sqrt{2}} \\
3
\end{bmatrix}
=  
\begin{bmatrix}  
\frac{9}{\sqrt{2}} \\  
\sqrt{2} \\  
3  
\end{bmatrix}
$$

마지막으로 $U$를 곱하는 것은 조정된 성분을 output singular direction으로 재조립하는 과정이다.
$$
U\Sigma V^\top x =
\begin{bmatrix}
0 & -1 & 0 \\
1 & 0 & 0 \\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
\frac{9}{\sqrt{2}} \\
\sqrt{2} \\
3
\end{bmatrix}
=
\begin{bmatrix}  
-\sqrt{2} \\  
\frac{9}{\sqrt{2}} \\  
3  
\end{bmatrix}
$$

Output singular direction으로 정리하면 다음과 같다.
$$
Wx =
\frac{9}{\sqrt{2}}u_1
+
\sqrt{2}u_2
+
3u_3
$$

위에서 기술한 일련의 과정을 일반식으로 쓰면 다음과 같다.
$$
Wx
=
\sum_i (v_i^\top x)Wv_i
=
\sum_i \sigma_i(v_i^\top x)u_i
$$

## 딥러닝 응용

만약 $\sigma_i$가 엄청 작다면 해당 singular value와 대응되는 singular direction들은 선형 변환에 크게 기여하지 않는다고 볼 수 있다. 기존 singular value들 중 가장 큰 상위 k개만 남겨서 행렬 크기를 줄일 수 있다. 이를 rank-k approximation이라고 한다. 이러한 근사를 통해 연산 효율을 높일 수 있다.

Rank-k approx를 수식으로 표현하면 다음과 같다.
$$
W_k = U_k \Sigma_k V_k^\top
$$
$$
U_k \in \mathbb{R}^{m \times k}, \quad
\Sigma_k \in \mathbb{R}^{k \times k}, \quad
V_k \in \mathbb{R}^{n \times k}
$$
상위 k개의 singular value와 그와 쌍을 이루는 eigenvector of $WW^T, W^TW$만 남기고 나머지는 드랍한다.

수학적으로는 작은 singular value를 제거해도 행렬 $W$의 근사 오차가 작다. 하지만 딥러닝 모델 전체에서 성능 저하가 항상 작다는 의미는 아니다. 이유는 다음과 같다.

1. layer 하나의 오차가 뒤 layer들을 지나며 증폭될 수 있다.
2. 작은 singular direction이라도 특정 드문 입력 패턴에서는 중요할 수 있다.
3. activation 분포를 고려하지 않은 순수 weight SVD는 실제 데이터에서의 중요도와 다를 수 있다.
4. transformer나 CNN에서는 단일 weight matrix만 압축해도 LayerNorm, residual connection, attention 구조와 상호작용하면서 결과가 달라질 수 있다.

따라서 실제 모델 압축에서는 보통 다음 절차를 쓴다.

1. weight matrix $W$에 SVD 적용
2. 상위 k개 singular value만 유지
3. $W$를 두 개의 작은 행렬 $A, B$로 대체
4. 필요하면 fine-tuning으로 성능 회복