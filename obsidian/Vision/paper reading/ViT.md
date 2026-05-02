
## CLS token

NLP에서 흔히 쓰이는 [EOS], [EOT], [PAD]와 같은 특수 토큰의 일종이다.

이미지가 9개 패치로 나뉘었다고 가정하자.

원본 이미지
→ 9개 패치로 분할
→ 각 패치를 벡터로 변환
→ 맨 앞에 learnable [CLS] token 추가
→ 총 10개 토큰으로 Transformer Encoder 통과
→ 마지막 layer의 CLS token 출력만 classification head에 넣음
→ class 예측

9개 패치는 각각 벡터가 된 후 다음과 같이 표현될 수 있다.
[CLS], patch_1, patch_2, ..., patch_9

여기에 position embedding을 더하면 다음과 같다.
[CLS + pos_0],
[patch_1 + pos_1],
[patch_2 + pos_2],
...
[patch_9 + pos_9]

위 10개 토큰이 서로 self-attention을 하는 것이다. 어텐션 레이어 이후 출력값이 다음과 같다고 하자.
z_CLS, z_patch1, z_patch2, ..., z_patch9

위 10개 최종 출력값 중 CLS 토큰만을 활용하여 classification을 진행한다.
MLP Head or Linear Head(z_CLS)

ViT가 이미지를 attention layer에 입력하기 직전 sequence를 만드는 과정을 수식으로 한 줄로 표현하면 다음과 같다.
$$
z_0 = [x_{\text{class}}; x_p^1 E; x_p^2 E; \cdots; x_p^N E] + E_{\text{pos}}
$$
$z_0$: Transformer encoder에 들어가는 초기 입력 sequence
$x_{class}$: CLS 토큰 벡터
$x_p^i$: $i$번째 패치
$E$: 패치를 벡터로 바꾸는 linear projection matrix
$x_p^i E$: $i$번째 패치가 벡터로 임베딩된 결과
";": 벡터를 sequence 방향으로 이어붙임
$E_{pos}$: position embedding
