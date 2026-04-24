# recycle-master
머신러닝 팀 프로젝트 입니다.

## 기술 스택
- **Frontend:** React Native
- **Backend:** Fast API (Python)
- **AI-Modeling:** Colab
- **Collaboration:** GitHub, Discord, Notion

## 1.  레파지토리 클론 & 브랜치 설정

❗각자 vscode 터미널에서 실행할 명령어:

```bash
git clone https://github.com/somin16/recycle-master.git
cd recycle-master
```

## 2. 개발 환경 구성 (백엔드,  python/Fast API)

❗ backend 폴더로 이동 후 실행하세요.

1) 가상환경 생성

```bash
cd backend
python -m venv venv

# (windows 파워쉘 권한 에러 발생 시: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser 실행)
```

2) 가상환경 활성화

```bash
# windows
.\venv\Scripts\activate
# mac
source venv/bin/activate
```

3) 가상환경 비활성화

```bash
deactivate
```

## 3. 의존성 설치 (백엔드)
❗가상환경이 활성화된 상태에서 실행하세요.

1) requirements.txt 파일을 사용하여 필요한 패키지 설치 (처음 설치 or 추가/버전업)
```bash
pip install -r requirements.txt
```
2) requirements.txt 내용 바탕으로 가상환경 동기화 (삭제 or 다운그레이드 1개라도 있을 시)
```bash
pip install pip-tools #각자 1번만 하면 됩니다
pip-sync requirements.txt # 삭제된 패키지까지 자동 제거됩니다
```
3) requirements.txt 업데이트 (새로운 패키지 설치 or 삭제 후)
```bash
pip freeze > requirements.txt
```
## 4. 라이브러리 설치 (프론트엔드)
❗ frontend 폴더로 이동 후 실행하세요
```bash
npm install
# package.json 프론트엔드 라이브러리 및 실행 스크립트 관리용
# "dependencies":실제 서비스 운영에 필요한 재료(react, icon)
# "devDependencies":개발할 때만 옆에서 도와주는 도구(Vite)
```

## 5. 서버 및 앱 실행 확인
❗각 파트 폴더로 이동하여 실행하세요.

1) Backend (FastAPI)
가상환경이 활성화된 상태에서 실행하세요.
```bash
# backend 폴더 내부에서
uvicorn main:app --reload
```
브라우저에서 다음 주소로 접속
```bash
http://127.0.0.1:8000/docs
```
main:app: main.py 파일의 app 객체를 실행한다는 뜻입니다.

--reload: 코드를 수정하면 서버가 자동으로 재시작됩니다 (개발용).

⭐ 브라우저 접속 시 Swagger API 문서가 뜨면 성공!

2) Frontend (React Native / Expo)
```bash
# frontend 폴더 내부에서
npx expo start
```
## 6. 깃 커밋 메시지 템플릿
프로젝트의 일관된 커밋 메시지를 위해 '.gitmessage.txt' 템플릿을 적용합니다.
각자 터미널에서 실행할 명령어: 
```bash
git config --local commit.template .gitmessage.txt
```