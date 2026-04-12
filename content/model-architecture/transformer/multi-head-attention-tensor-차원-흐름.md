---
title: 'Multi Head Attention - Tensor 차원 흐름'
description: '사전학습 시'
draft: false
date: 2026-03-28
tags:
  - "notes"
  - 'model-architecture'
topSection: 'Model Architecture'
---



사전학습 시

seq_len = 사전학습 시 모델에 한 번에 입력할 토큰 길이

(B, seq_len, embed_dim) 입력

입력 텐서를 W_Q, W_K, W_V = nn.Linear(embed_dim, dim) 과 곱하여 Q, K, V를 생성한다.

Q, K, V = (B, seq_len, dim)

MHA를 위해 dim = n_head * n_dim 으로 나눈다. Q, K, V = (B, seq_len, n_head, n_dim)

pytorch에서는 각 헤드별로 행렬곱을 수행하기 위해 (B, n_head, seq_len, n_dim)으로 변형한다

Q = (B, n_head, seq_len, n_dim)
K^T = (B, n_head, n_dim, seq_len)

Q @ K^T / sqrt(n_dim) = attention score = (B, n_head, seq_len, seq_len) / sqrt(n_dim) 수치 안정성을 위해 나눔

최종 형태와 위와 같은 이유는 (M, N) * (N, M) = (M, M) 행렬곱을 생각하면 된다.

상삼각 부분을 -inf로 채워 causal masking 적용하고 softmax 통과. 형태 변화는 없지만 softmax를 통과하면 attention weight라고 부른다
위 attention score 연산을 보면 (seq_len, seq_len) 모양의 attention map이 나오는데 여기에서 앞의 행 seq_len은 Q에서 오고 뒤의 열 seq_len은 K^T에서 오는 것을 확인할 수 있다. 따라서 상삼각 부분을 지워야 미래 정보가 지워진다.
정사각형 모양의 attention map 행렬을 상상한다. 행 인덱스는 위에서부터 아래로 갈수록 미래, 열 인덱스는 왼쪽에서부터 오른쪽으로 갈수록 미래이다. 행=열 인덱스 지점은 한 단어가 자기자신을 참조하는 위치이다. 상삼각 = 열 인덱스 > 행 인덱스. 과거의 Q, 미래의 K. 하삼각 = 행 인덱스 > 열 인덱스. 미래의 Q, 과거의 K.

attention weight @ V = (B, n_head, seq_len, seq_len) * (B, n_head, seq_len, n_dim) = (B, n_head, seq_len, n_dim)

transpose, concat으로 원상복구. (B, n_head, seq_len, n_dim) -> (B, seq_len, n_head, n_dim) -> (B, seq_len, dim)

W_O = nn.Linear(dim, embed_dim) 통과시키고 (B, seq_len, embed_dim) 만들어서 입력과 똑같은 형태로 출력

---

추론 시

curr_len = 현재 스텝에서 입력되는 토큰 길이

past_seq_len = 이전까지 생성되어 캐싱된 토큰의 총 길이

S = curr_len + past_seq_len

(B, curr_len, embed_dim). 만약 단일 사용자와 대화 중이라면 B=1.

W_Q, W_K, W_V랑 곱해서 Q, K, V 생성. (B, curr_len, dim)

헤드 분리 (B, curr_len, n_head, n_dim), 행렬곱을 위한 전치 (B, n_head, curr_len, n_dim)

K와 V는 이전 것과 이번에 새로 만들어진 것을 합쳐야 함.
이전 것 (B, n_head, past_seq_len, n_dim)
새 것 (B, n_head, curr_len, n_dim)
concat하면 (B, n_head, S, n_dim)

새로운 Q와 concat한 K를 행렬곱
Q = (B, n_head, curr_len, n_dim)
K^T = (B, n_head, n_dim, S)

Q @ K^T / sqrt(n_dim) = attention score = (B, n_head, curr_len, S)

소프트맥스 적용해서 attention weight

attention weight @ V = (B, n_head, curr_len, S) * (B, n_head, S, n_dim) = (B, n_head, curr_len, n_dim)

transpose, concat으로 원상복구. (B, n_head, curr_len, n_dim) -> (B, curr_len, n_head, n_dim) -> (B, curr_len, dim)

W_O = nn.Linear(dim, embed_dim) 통과시키면 (B, curr_len, embed_dim)



추론 상황은 크게 두 가지로 나뉨 prefill -> decode

prefill은 사용자가 질문 뭉탱이를 입력하는 경우
curr_len은 질문 토큰의 개수이고 최종 결과물도 토큰 하나가 아니라 curr_len개만큼 나옴.
여기서 추론 상황임에도 causal masking을 부분적으로 적용해야 함
	past_seq_len에는 적용 X. curr_len에는 적용
	학습 시에는 attention map이 정사각형이었기에 상삼각 가리기면 끝났지만 지금은 다름.
	(curr_len, S)는 많은 경우에 정사각형 행렬이 아님. S가 여태 쌓인 대화 토큰 수, 혹은 최대 컨텍스트 윈도우 크기라고 했을 때 curr_len이 작을 확률이 높음. 행은 curr_len이고 열은 S인데 그냥 상삼각을 지우는 건 말이 안 됨. 따라서 (curr_len, S-curr_len) 부분과 (curr_len, curr_len)으로 나눠야 함. (curr_len, S-curr_len) 부분은 마스킹 없이 그대로 사용하면 됨. (curr_len, curr_len) 행렬은 상삼각 부분을 가리는 마스킹 적용 후 두 행렬을 다시 합하면 prefill 상황에 적합한 부분 causal masking 완료.
	코드 구현 시에는 (curr_len, S-curr_len) 크기의 0 텐서와 (curr_len, curr_len) 크기의 상삼각 부분만 -inf로 차있는 텐서를 생성해서 concat한 뒤 attention_score 행렬에 더해 softmax를 적용하면 의도된 바로 동작한다.
단층 모델이라면 상관없지만 다층 모델이라면 한 층의 결과 출력이 다음 층의 입력이 되기 때문에 중요함. causal masking을 적용하지 않으면 학습 때와 달리 미래 토큰의 정보까지 머금은 결과 출력이 다음 층의 입력이 되어 분포가 망가질 수 있음. 즉, 추론 시에도 prefill 상황에는 causal masking을 적용해 kv cache 값의 순수성을 보존해야 함.
최종 결과물 curr_len개 중 마지막 값만 가지고 다음 토큰을 예측하면 됨. 그 앞 토큰의 최종 결과 출력은 필요없음. 그 앞 토큰을 한 번에 입력한 것은 kv cache 생성 시 gpu 병렬 연산을 활용하기 위했을 뿐임.

decode 상황은 prefill 이후 토큰을 하나씩 생성하는 과정
curr_len=1
토큰 하나 만들고, kv cache에 다시 넣고, 그걸로 다시 토큰 만들고... 반복
