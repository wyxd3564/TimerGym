# Page snapshot

```yaml
- banner:
  - button "템플릿 선택": 템플릿
  - heading "운동 타이머" [level=1]
  - button "키보드 단축키 도움말": "?"
  - button "설정": ⚙️
- main:
  - main "타이머 표시":
    - 'button "현재 시간: 01:00. 클릭하여 시간 설정"': 01:00
    - text: 타이머 정지
    - img "타이머 진행률 0%, 01:00 남음":
      - img "진행률 0%": 0% 완료
      - 'status "현재 반복 횟수: 0회"'
    - text: 진행률 0%, 01:00 남음
  - group "반복 횟수 조절":
    - button "반복 횟수 감소 (↓ 키 또는 클릭)" [disabled]: "-"
    - 'status "현재 반복 횟수: 0회"': "0"
    - button "반복 횟수 증가 (↑ 키 또는 클릭)": +
  - group "타이머 조절":
    - button "타이머 시작 (스페이스바 또는 클릭)": 시작
    - button "타이머 초기화 (R 키 또는 클릭)" [disabled]: 초기화
```