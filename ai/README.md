# AI-Denti · AI 서버 (car-damage-segmentation)

차량 파손 이미지를 입력받아 파손 유형별 픽셀 영역과 예상 수리 견적을 반환하는 Flask 서버입니다.

- 원본 모델: [kairess/car-damage-segmentation](https://github.com/kairess/car-damage-segmentation)
- 실행 위치: `ai/car-damage-segmentation/app.py`
- 기본 포트: `5000`

---

## 1. 폴더 구조

```
denti/ai/
├── ai_env/                          # 가상환경 (git에 올리지 않음, 각자 로컬 생성)
└── car-damage-segmentation/
    ├── app.py                       # Flask 서버 실행 파일
    ├── test.ipynb                   # 단일 이미지 추론 테스트 노트북
    ├── src/
    │   └── Models.py                # Unet 모델 정의
    ├── models/                      # 모델 가중치 (git에 올리지 않음, 직접 다운로드)
    │   ├── [DAMAGE][Breakage_3]Unet.pt
    │   ├── [DAMAGE][Crushed_2]Unet.pt
    │   ├── [DAMAGE][Scratch_0]Unet.pt
    │   └── [DAMAGE][Seperated_1]Unet.pt
    └── samples/                     # 테스트용 샘플 이미지
```

---

## 2. 최초 세팅 (처음 한 번만)

### 2-1. 가상환경 생성 및 활성화

`denti/ai` 폴더에서 실행 (Git Bash 기준):

```bash
cd ai
python -m venv ai_env
source ai_env/Scripts/activate
```

활성화되면 프롬프트 앞에 `(ai_env)`가 표시됩니다.

> 재부팅하거나 터미널을 새로 열면 가상환경이 꺼져 있으므로, 작업 전마다 `source ai_env/Scripts/activate`를 다시 실행해야 합니다.

### 2-2. 패키지 설치

```bash
pip install flask flask-cors torch torchvision segmentation-models-pytorch pandas opencv-python albumentations
```

> `torch`는 레포의 `requirements.txt`에 `1.10.1`로 고정되어 있지만, 최신 Python 환경에서는 해당 버전을 설치할 수 없습니다. 버전 지정 없이 설치해도 정상 동작을 확인했습니다.

### 2-3. 모델 가중치 다운로드 (필수)

아래 구글드라이브에서 `.pt` 파일 4개를 받아 `car-damage-segmentation/models/` 폴더에 넣습니다. 폴더가 없으면 새로 생성하세요.

- 다운로드 링크: https://drive.google.com/drive/folders/1q0l5vT14Kka_iu0WZgn1EFJLUbWD8EtY

파일명은 대괄호까지 정확히 동일해야 합니다.

```
[DAMAGE][Breakage_3]Unet.pt
[DAMAGE][Crushed_2]Unet.pt
[DAMAGE][Scratch_0]Unet.pt
[DAMAGE][Seperated_1]Unet.pt
```

> 이 파일들은 `.gitignore`에 의해 git에서 제외됩니다. 팀원 각자 위 링크에서 받아서 로컬에 넣어야 합니다.

---

## 3. 서버 실행

```bash
cd ai/car-damage-segmentation
source ../ai_env/Scripts/activate   # 아직 활성화 안 했다면
python app.py
```

정상 실행되면 아래와 같은 로그가 출력됩니다.

```
모델 로드 완료
Running on http://0.0.0.0:5000
Running on http://<이 PC의 IP>:5000
```

`host='0.0.0.0'`으로 띄우기 때문에, 같은 네트워크의 다른 컴퓨터(Spring Boot 서버 등)에서도 이 PC의 IP로 접근할 수 있습니다.

---

## 4. API

### GET /health
서버 정상 동작 확인용.

```bash
curl http://<AI서버IP>:5000/health
```
```json
{ "status": "ok" }
```

### POST /analyze
이미지를 업로드하면 파손 유형별 픽셀 영역과 예상 견적을 반환합니다.

```bash
curl -X POST http://<AI서버IP>:5000/analyze \
  -F "image=@samples/damage/0000177_sc-153567.jpg"
```

응답 예시:
```json
{
  "details": {
    "Breakage_3": { "pixelArea": 8508, "estimatedCost": 850800 },
    "Crushed_2":  { "pixelArea": 2336, "estimatedCost": 467200 },
    "Scratch_0":  { "pixelArea": 9360, "estimatedCost": 468000 },
    "Seperated_1":{ "pixelArea": 328,  "estimatedCost": 39360  }
  },
  "totalCost": 1825360
}
```

픽셀당 단가는 `app.py` 내 `PRICE_TABLE` 상수로 관리하고 있습니다 (Breakage 100원, Crushed 200원, Scratch 50원, Seperated 120원).

---

## 5. Spring Boot와 연동

Spring Boot(`denti_back`)가 이 서버를 호출하도록 `application.properties`에 아래 값이 설정되어 있어야 합니다.

```properties
ai.server.url=http://<AI서버IP>:5000
```

**AI 서버를 켜는 PC나 IP가 바뀌면, 이 값을 반드시 함께 수정해야 합니다.** (DB 서버와 같은 PC를 고정으로 쓰고 있다면, DB 접속 정보의 IP와 동일한 값을 쓰면 됩니다.)