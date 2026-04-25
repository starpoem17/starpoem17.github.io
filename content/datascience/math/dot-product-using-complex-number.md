---
title: 'Dot Product Using Complex Number'
description: '벡터 내적 시에는 한 쪽 벡터를 transpose하는 것으로 shape을 맞추고 같은 위치의 요소들끼리 곱할 수 있다.'
draft: false
date: 2026-04-25
tags:
  - "notes"
  - 'datascience'
topSection: 'Datascience'
---

벡터 내적 시에는 한 쪽 벡터를 transpose하는 것으로 shape을 맞추고 같은 위치의 요소들끼리 곱할 수 있다.
$$
a =
\begin{bmatrix}
a_{1}\\
a_{2}
\end{bmatrix}
\qquad
b =  
\begin{bmatrix}  
b_{1}\\  
b_{2}
\end{bmatrix}
$$
$$
a^Tb = a_1b_1 + a_2b_2
$$
2차원 실수 공간과 복소 공간이 일대일 대응이라는 것을 활용하여 벡터를 복소수로 표현한 경우에는 transpose 대신 켤레복소수를 활용한 뒤 실수부만 추출하여 내적값을 얻을 수 있다.
$$
\begin{aligned}
a &= a_1 + ia_2 \\
b &= b_1 + ib_2
\end{aligned}
$$
켤레복소수를 사용하지 않은 경우,
$$
ab = a_1b_1 + ia_1b_2 + ia_2b_1 - a_2b_2
$$
실수부: $a_1b_1 - a_2b_2$

켤레복소수를 사용한 경우,
$$
a^*b = (a_1 - ia_2)(b_1 + ib_2) = a_1b_1 - ia_2b_1 + ia_1b_2 + a_2b_2
$$
실수부: $a_1b_1 + a_2b_2$

참고로 $a^*b$와 $ab^*$의 실수부 결과는 같다.
