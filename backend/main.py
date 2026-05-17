from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import shutil
import os
import uuid
from ai_module import predict_trash

app = FastAPI()

#모델 나오면 서버에 모델 파일 올리기
#model = YOLO("best.pt")

# 업로드 폴더 생성
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 클래스 매핑
label_map = {
    "scissors": "scissors",
    "metal": "can",
    "plastic": "plastic",
    "glass": "glass",
    "paper": "paper"
}

@app.post("/api/v1/analyze")
async def analyze_image(image: UploadFile = File(None)):

    # 이미지 없을 때(400)
    if not image:
        return JSONResponse(
            status_code=400,
            content={"status": "fail"}
        )

    try:
        # 파일 저장
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        """
        # 모델이 비슷한 결과 찾음
        results = model(filepath)
        # item_name, confidence 추출
        probs = results[0].probs
        # confidence
        confidence = float(probs.top1conf)
        # 예측 클래스 이름
        predicted_class = results[0].names[probs.top1]
        """
        # 가짜 AI 호출
        result = await predict_trash(filepath)

        confidence = result["confidence"]
        predicted_class = result["label"]
        # unknown 처리
        if confidence < 0.5:
            return JSONResponse(
                status_code=200,
                content={
                    "status": "success",
                    "data": {
                        "item_name": "unknown",
                        "confidence": round(confidence, 2)
                    }
                }
            )

        # 정상 결과
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    # 고유 id 생성
                    "item_id": f"{predicted_class}_001",
                    # label_map에서 매칭, 없는 값 들어오면 unknown
                    "item_name": label_map.get(predicted_class, "unknown"),
                    # 소수점 둘째자리까지 반올림
                    "confidence": round(confidence, 2)
                }
            }
        )
    # 서버 에러(500)
    except Exception as e:
        print(f"Error occurred: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error"}
    )