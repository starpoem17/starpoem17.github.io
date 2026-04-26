
On-policy: 현재 정책이 생성한 데이터를 활용한다.

Off-policy: experience replay, target network를 활용하여 i.i.d 가정을 맞추려고 노력한다.

## 대표적인 On-policy

- SARSA
- REINFORCE
- A2C
- PPO
- TRPO
## 대표적인 Off-policy

- Q-learning
- DQN
- TD3
- SAC

## On-policy의 장점1: Online network와 데이터의 일치

On-policy는 현재 정책이 어떻게 행동하는지, 어떤 보상을 받는지 직접 보고 학습할 수 있다. 하지만 Off-policy는 replay buffer에서 현재 정책의 실제 분포와 다른 데이터를 가지고 학습하기에 괴리가 발생할 수 있다.

예를 들어 On-policy는 현재 정책이 주로 겪는 문제가 즉각적으로 업데이트될 수 있지만 Off-policy는 replay buffer에서 랜덤 샘플링하는 데이터들에 의존하기에 현재 정책이 겪는 문제와 관련없는 것들을 학습할 수 있다.

## On-policy의 장점2: Policy Gredient와 더 잘 맞는다


## On-policy의 장점3: 정책 개선이 더 안정적이고 보수적이다


## On-policy의 장점4: continuous action에서 더 자연스럽다


## On-policy의 장점5: exploration을 정책에 포함하기 쉽다
