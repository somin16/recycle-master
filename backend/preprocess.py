"""
재활용 쓰레기 분류 모델 - 전처리 파이프라인
Kaggle Garbage Classification Dataset (10클래스)
출처: https://www.kaggle.com/datasets/mostafaabla/garbage-classification
※ green-glass / brown-glass / white-glass → glass 통합 후 사용
"""

import os
import torch
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms
import matplotlib.pyplot as plt
import numpy as np
from collections import Counter
# ──────────────────────────────────────────────
# 1. 폴더 구조 (ImageFolder 형식)
# ──────────────────────────────────────────────
# data/
# ├── batteries/
# ├── biological/
# ├── cardboard/
# ├── clothes/
# ├── glass/       ← green-glass + brown-glass + white-glass 통합
# ├── metal/
# ├── paper/
# ├── plastic/
# ├── shoes/
# └── trash/
# 총 10클래스 / 약 15,150장


# ──────────────────────────────────────────────
# 2. 정규화 파라미터 (ImageNet 사전학습 모델 사용 시)
# ──────────────────────────────────────────────
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

IMAGE_SIZE = 224  # ResNet / EfficientNet 표준 입력 크기


# ──────────────────────────────────────────────
# 3. Transform 정의
# ──────────────────────────────────────────────

# 학습용 Transform: Augmentation 포함
train_transform = transforms.Compose([
    transforms.Resize((256, 256)),                      # 약간 크게 리사이즈 후
    transforms.RandomCrop(IMAGE_SIZE),                  # 랜덤 크롭 → 위치 다양성
    transforms.RandomHorizontalFlip(p=0.5),             # 좌우 반전
    transforms.RandomVerticalFlip(p=0.2),               # 상하 반전 (쓰레기는 뒤집혀도 OK)
    transforms.RandomRotation(degrees=10),              # ±10도 회전 (검은 배경 최소화)
    transforms.ColorJitter(
        brightness=0.2,                                 # 밝기 변화 완화 (과변환 방지)
        contrast=0.2,                                   # 대비 변화 완화
        saturation=0.1,                                 # 채도 변화 완화 (색상 과의존 방지)
        hue=0.05                                        # 색조 변화 최소화
    ),
    transforms.RandomGrayscale(p=0.05),                 # 5% 확률로 흑백 (색상 과의존 방지)
    transforms.ToTensor(),                              # PIL → Tensor [0, 1]
    transforms.Normalize(mean=IMAGENET_MEAN,
                         std=IMAGENET_STD),             # ImageNet 정규화
])

# 검증/테스트용 Transform: Augmentation 없이 표준화만
val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),        # 고정 크기 리사이즈
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN,
                         std=IMAGENET_STD),
])


# ──────────────────────────────────────────────
# 4. Dataset & DataLoader 구성
# ──────────────────────────────────────────────

def build_dataloaders(
    data_dir: str,
    batch_size: int = 32,
    val_split: float = 0.15,
    test_split: float = 0.15,
    num_workers: int = 4,
    random_seed: int = 42,
):
    """
    단일 루트 폴더에서 train/val/test를 자동 분할하여 DataLoader 반환.

    Args:
        data_dir:    클래스 폴더들이 있는 루트 경로 (예: './data')
        batch_size:  배치 크기
        val_split:   검증 비율 (0~1)
        test_split:  테스트 비율 (0~1)
        num_workers: 데이터 로딩 병렬 워커 수
        random_seed: 재현성을 위한 시드

    Returns:
        train_loader, val_loader, test_loader, class_names
    """

    # 전체 데이터를 일단 val_transform으로 로드 (나중에 train subset에만 다른 transform 적용)
    full_dataset = datasets.ImageFolder(root=data_dir, transform=val_transform)
    class_names = full_dataset.classes

    print(f"총 이미지 수: {len(full_dataset)}")
    print(f"클래스 목록: {class_names}")

    # 클래스별 이미지 수 확인
    class_counts = Counter([label for _, label in full_dataset.samples])
    for idx, name in enumerate(class_names):
        print(f"  {name}: {class_counts[idx]}장")

    # 분할 크기 계산
    total = len(full_dataset)
    test_size  = int(total * test_split)
    val_size   = int(total * val_split)
    train_size = total - val_size - test_size

    generator = torch.Generator().manual_seed(random_seed)
    train_subset, val_subset, test_subset = random_split(
        full_dataset,
        [train_size, val_size, test_size],
        generator=generator,
    )

    # train subset에만 augmentation transform 적용 (_SubsetWithTransform 래퍼 사용)
    train_dataset = _SubsetWithTransform(full_dataset, train_subset.indices, train_transform)
    val_dataset   = _SubsetWithTransform(full_dataset, val_subset.indices,   val_transform)
    test_dataset  = _SubsetWithTransform(full_dataset, test_subset.indices,  val_transform)

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,                   # 학습 시 반드시 셔플
        num_workers=num_workers,
        pin_memory=True,                # GPU 전송 가속
        drop_last=True,                 # 마지막 불완전 배치 제거
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
    )

    print(f"\n분할 결과:")
    print(f"  Train : {len(train_dataset)}장")
    print(f"  Val   : {len(val_dataset)}장")
    print(f"  Test  : {len(test_dataset)}장")

    return train_loader, val_loader, test_loader, class_names


class _SubsetWithTransform(torch.utils.data.Dataset):
    """특정 인덱스 + 별도 transform을 적용하는 Dataset 래퍼."""

    def __init__(self, dataset, indices, transform):
        self.dataset   = dataset
        self.indices   = indices
        self.transform = transform

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        img, label = self.dataset.imgs[self.indices[idx]]
        from PIL import Image
        image = Image.open(img).convert("RGB")
        return self.transform(image), label


# ──────────────────────────────────────────────
# 5. 클래스 불균형 처리 - WeightedRandomSampler
# ──────────────────────────────────────────────

def get_weighted_sampler(dataset: torch.utils.data.Dataset) -> torch.utils.data.WeightedRandomSampler:
    """
    클래스 불균형이 있을 때 소수 클래스를 더 자주 샘플링하는 sampler 반환.
    DataLoader의 sampler 인자에 전달 (이때 shuffle=False로 설정).
    """
    # 각 샘플의 라벨 수집
    if hasattr(dataset, 'indices'):
        labels = [dataset.dataset.targets[i] for i in dataset.indices]
    else:
        labels = [label for _, label in dataset]

    class_counts = Counter(labels)
    num_classes  = len(class_counts)

    # 클래스별 가중치: 희귀 클래스일수록 높은 가중치
    class_weights = {cls: 1.0 / count for cls, count in class_counts.items()}
    sample_weights = [class_weights[label] for label in labels]

    sampler = torch.utils.data.WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True,
    )
    return sampler


# ──────────────────────────────────────────────
# 6. 정규화 역변환 (시각화용)
# ──────────────────────────────────────────────

def denormalize(tensor: torch.Tensor) -> np.ndarray:
    """
    Normalize된 텐서를 [0, 1] 범위 numpy 배열로 복원.
    시각화할 때 사용.
    """
    mean = torch.tensor(IMAGENET_MEAN).view(3, 1, 1)
    std  = torch.tensor(IMAGENET_STD).view(3, 1, 1)
    img  = tensor.clone().cpu() * std + mean
    img  = img.clamp(0, 1)
    return img.permute(1, 2, 0).numpy()  # (H, W, C)


# ──────────────────────────────────────────────
# 7. 샘플 시각화 (전처리 전/후 비교)
# ──────────────────────────────────────────────

def visualize_before_after(dataset: datasets.ImageFolder, class_names: list, n: int = 4):
    """전처리 전(원본) / 후(Augmentation 적용) 이미지를 나란히 비교."""
    from PIL import Image

    # Windows 한글 폰트 설정
    plt.rcParams['font.family'] = 'Malgun Gothic'   # 맑은 고딕
    plt.rcParams['axes.unicode_minus'] = False       # 마이너스 기호 깨짐 방지

    # 랜덤으로 n개 샘플 선택
    indices = torch.randperm(len(dataset))[:n].tolist()

    fig, axes = plt.subplots(n, 2, figsize=(8, n * 3 + 1))  # 높이 +1 추가
    fig.suptitle("전처리 전 vs 전처리 후", fontsize=13, fontweight='bold', y=0.98)

    # 열 제목
    axes[0][0].set_title("전처리 전 (원본)", fontsize=11, color='steelblue', pad=10)
    axes[0][1].set_title("전처리 후 (Augmented)", fontsize=11, color='tomato', pad=10)

    for row, idx in enumerate(indices):
        img_path, label = dataset.imgs[idx]
        label_name = class_names[label]

        # ── 왼쪽: 원본 이미지 ──
        original = Image.open(img_path).convert("RGB")
        axes[row][0].imshow(original)
        axes[row][0].set_ylabel(label_name, fontsize=10, rotation=0,
                                labelpad=55, va='center')
        axes[row][0].set_xticks([])
        axes[row][0].set_yticks([])

        # ── 오른쪽: Augmentation 적용 후 ──
        augmented_tensor = train_transform(original)
        augmented_img = denormalize(augmented_tensor)
        axes[row][1].imshow(augmented_img)
        axes[row][1].set_xticks([])
        axes[row][1].set_yticks([])

    plt.tight_layout()
    plt.savefig("before_after.png", dpi=120, bbox_inches="tight")
    plt.show()
    print("before_after.png 저장 완료")


# ──────────────────────────────────────────────
# 8. 실행 예시
# ──────────────────────────────────────────────

if __name__ == "__main__":
    DATA_DIR    = r"C:\Users\oem\Desktop\recycle-master\backend\data"
    BATCH_SIZE  = 32
    NUM_WORKERS = 0  # Windows면 0으로 설정

    train_loader, val_loader, test_loader, class_names = build_dataloaders(
        data_dir=DATA_DIR,
        batch_size=BATCH_SIZE,
        num_workers=NUM_WORKERS,
    )

    # 배치 shape 확인
    images, labels = next(iter(train_loader))
    print(f"\n배치 shape: {images.shape}")
    print(f"라벨 shape: {labels.shape}")
    print(f"픽셀 범위:  [{images.min():.2f}, {images.max():.2f}]")

    # 전처리 전/후 비교 시각화
    full_dataset = datasets.ImageFolder(root=DATA_DIR)
    visualize_before_after(full_dataset, class_names, n=4)