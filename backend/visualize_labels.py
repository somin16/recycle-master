import os  # 폴더 경로와 시스템 파일들을 제어하기 위해 가져옵니다.
import cv2  # 이미지 위에 박스와 글씨를 그리기 위해 OpenCV를 가져옵니다.

# [상대 경로 세팅] 파일 주소를 완전히 비워두고, 현재 visualize_labels.py 파일이 있는 위치(backend)를 기준으로 잡습니다.
# 팀원들이 코드를 받았을 때 각자의 컴퓨터 주소로 수정할 필요가 전혀 없습니다.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset")

# 결과 사진들을 저장할 메인 폴더명입니다. (backend/detection_results)
SAVE_MAIN_FOLDER = os.path.join(BASE_DIR, "detection_results")

# 로보플로우 정석 구조인 train, valid, test 3개 폴더명을 리스트로 선언합니다.
split_folders = ["train", "valid", "test"]

# 3개의 폴더를 순서대로 하나씩 꺼내어 전처리 검증 작업을 반복 실행합니다.
for split in split_folders:
    # 각 폴더(예: backend/dataset/train)의 실제 이미지와 라벨 경로를 만듭니다.
    img_dir = os.path.join(DATASET_PATH, split, "images")
    lbl_dir = os.path.join(DATASET_PATH, split, "labels")

    # 만약 해당 폴더가 내부에 존재하지 않는다면 에러를 내지 않고 다음 폴더로 넘어가 처리합니다.
    if not os.path.exists(img_dir):
        continue

    # 결과물을 저장할 폴더 안에 세부 분할 폴더를 만듭니다. (예: detection_results/train)
    save_split_folder = os.path.join(SAVE_MAIN_FOLDER, split)
    if not os.path.exists(save_split_folder):
        os.makedirs(save_split_folder)

    # 이미지 폴더 내부에서 확장자가 '.jpg'로 끝나는 파일 목록만 싹 긁어모읍니다.
    images = [f for f in os.listdir(img_dir) if f.endswith('.jpg')]
    print(f"🚀 [{split}] 데이터 검증 작업을 시작합니다... 총 {len(images)}장")

    # 수집한 사진 목록에서 한 장씩 꺼내어 본격적인 반복 작업을 시작합니다.
    for name in images:
        # 현재 처리 중인 사진 파일과 정답 텍스트(.txt) 파일의 정확한 경로를 연결합니다.
        img_path = os.path.join(img_dir, name)
        txt_path = os.path.join(lbl_dir, name.replace('.jpg', '.txt'))

        # 사진과 짝을 이루는 정답 텍스트 파일이 실제로 존재할 때만 내부 로직을 수행합니다.
        if os.path.exists(txt_path):
            # OpenCV를 활용해 원본 사진을 컴퓨터 메모리 위로 로드합니다.
            img = cv2.imread(img_path)
            if img is None:  # 사진 파일이 깨졌거나 읽지 못했다면 무시하고 다음 사진으로 넘어갑니다.
                continue
            
            # 읽어온 이미지의 세로 해상도(h)와 가로 해상도(w) 정보를 가져옵니다.
            h, w, _ = img.shape
            
            # 정답 텍스트 파일을 읽기 모드('r')로 열어 파일 내부를 검사합니다.
            with open(txt_path, 'r') as f:
                # 라벨 파일 안의 정답 데이터를 한 줄씩 끝까지 읽어옵니다.
                for line in f.readlines():
                    parts = line.split()  # 공백 문자를 기준으로 숫자들을 분리하여 리스트로 만듭니다.
                    if len(parts) < 3:   # 불완전하거나 비어있는 줄은 오류 방지를 위해 건너뜁니다.
                        continue
                    
                    cls = int(float(parts[0]))          # 맨 앞 숫자는 쓰레기 카테고리 번호(정수)입니다.
                    coords = list(map(float, parts[1:])) # 두 번째 숫자부터는 소수점 좌표 형태의 리스트로 묶습니다.
                    
                    # [케이스 1] 일반적인 YOLO 사각형 바운딩 박스 포맷일 때 (좌표 데이터가 정확히 4개)
                    if len(coords) == 4:
                        x, y, nw, nh = coords
                        x1 = int((x - nw/2) * w)  # 이미지 크기를 곱해 픽셀 기준 좌측 상단 X 좌표를 복원합니다.
                        y1 = int((y - nh/2) * h)  # 이미지 크기를 곱해 픽셀 기준 좌측 상단 Y 좌표를 복원합니다.
                        x2 = int((x + nw/2) * w)  # 이미지 크기를 곱해 픽셀 기준 우측 하단 X 좌표를 복원합니다.
                        y2 = int((y + nh/2) * h)  # 이미지 크기를 곱해 픽셀 기준 우측 하단 Y 좌표를 복원합니다.
                    
                    # [케이스 2] 다각형 외곽선(Segmentation) 포맷일 때 (좌표가 6개 이상 짝수)
                    elif len(coords) >= 6 and len(coords) % 2 == 0:
                        x_coords = [coords[i] * w for i in range(0, len(coords), 2)]  # 픽셀 기준 전체 X 좌표 리스트
                        y_coords = [coords[i] * h for i in range(1, len(coords), 2)]  # 픽셀 기준 전체 Y 좌표 리스트
                        x1, x2 = int(min(x_coords)), int(max(x_coords))  # 점들 중 최소/최대 X를 뽑아 사각형 테두리를 잡습니다.
                        y1, y2 = int(min(y_coords)), int(max(y_coords))  # 점들 중 최소/최대 Y를 뽑아 사각형 테두리를 잡습니다.
                    else:
                        continue  # 규격에 맞지 않는 예외 데이터 구조는 안전하게 패스합니다.
                    
                    # 연산된 최종 좌표(x1, y1, x2, y2) 위치에 두께 2짜리 초록색 사각형 선을 렌더링합니다.
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
                    # 데이터셋 카테고리에 정의된 쓰레기 클래스 이름 리스트를 명시합니다.
                    classes = ['battery', 'can', 'glass', 'metal', 'paper', 'plastic', 'vinyl']
                    if cls < len(classes):
                        class_name = classes[cls]  # 클래스 번호와 일치하는 쓰레기 영문명을 매핑합니다.
                        # 사각형 박스 머리맡(x1, y1 - 10)에 초록색 글씨로 쓰레기 이름을 선명하게 인쇄합니다.
                        cv2.putText(img, class_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # 박스 처리와 글씨 쓰기가 모두 완료된 이미지를 각 분할 폴더(예: detection_results/train)에 저장합니다.
            cv2.imwrite(os.path.join(save_split_folder, name), img)

print("🎉 모든 train, valid, test 사진이 'detection_results' 폴더 내부에 분할 저장되었습니다!")