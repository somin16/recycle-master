import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
// expo-image-picker 설치 필요: npx expo install expo-image-picker
import * as ImagePicker from 'expo-image-picker';

// ─────────────────────────────────────────────
// 타입 정의: AI 스캔 결과 구조
// ─────────────────────────────────────────────
type ScanResult = {
  category: string;   // 분류 카테고리 (예: 플라스틱)
  emoji: string;      // 카테고리 이모지
  confidence: number; // AI 정확도 (0~100)
  tags: string[];     // 해당 품목 태그
  steps: string[];    // 배출 방법 단계
  warnings: string[]; // 주의사항
};

// ─────────────────────────────────────────────
// 더미 데이터: 실제 구현 시 AI API 호출로 교체
// ─────────────────────────────────────────────
const DUMMY_RESULTS: ScanResult[] = [
  {
    category: '플라스틱',
    emoji: '♻️',
    confidence: 94,
    tags: ['페트병', '플라스틱 용기'],
    steps: ['내용물 비우기', '물로 헹구기', '라벨 제거', '압축하여 배출'],
    warnings: ['음식물이 묻은 경우 세척 필수', '여러 재질이 섞인 제품은 분리'],
  },
  {
    category: '종이류',
    emoji: '📄',
    confidence: 89,
    tags: ['종이 박스', '신문지'],
    steps: ['비닐 코팅된 부분 제거', '테이프·이물질 제거', '물기 제거 후 배출'],
    warnings: ['비닐 코팅지는 일반쓰레기', '물에 젖은 종이는 일반쓰레기'],
  },
  {
    category: '캔류',
    emoji: '🥫',
    confidence: 97,
    tags: ['음료 캔', '알루미늄'],
    steps: ['내용물 비우기', '물로 헹구기', '압축하여 배출'],
    warnings: ['부탄가스 캔은 구멍 뚫어 배출', '페인트 캔은 일반쓰레기'],
  },
];

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function CameraScreen() {
  // 선택/촬영된 이미지 URI
  const [image, setImage] = useState<string | null>(null);
  // 스캔 로딩 상태
  const [scanning, setScanning] = useState(false);
  // AI 분석 결과
  const [result, setResult] = useState<ScanResult | null>(null);

  // ─────────────────────────────────────────────
  // runScan: uri를 직접 받아 상태를 한 번에 업데이트
  // (setImage 후 바로 scanning 시작하면 React 비동기 배치로 인해
  //  이미지가 아직 null인 상태에서 스캔이 시작될 수 있어서 이렇게 처리)
  // ─────────────────────────────────────────────
  const runScan = (uri: string) => {
    setImage(uri);      // 이미지 미리보기 세팅
    setResult(null);    // 이전 결과 초기화
    setScanning(true);  // 로딩 시작

    // TODO: 여기를 실제 AI Vision API 호출로 교체
    setTimeout(() => {
      // 더미: DUMMY_RESULTS 중 랜덤으로 결과 반환
      const r = DUMMY_RESULTS[Math.floor(Math.random() * DUMMY_RESULTS.length)];
      setResult(r);
      setScanning(false);
    }, 1800);
  };

  // ─────────────────────────────────────────────
  // pickFromGallery: 갤러리에서 이미지 선택
  // ─────────────────────────────────────────────
  const pickFromGallery = async () => {
    // 갤러리 접근 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8, // 이미지 품질 (0~1)
    });

    // 사용자가 취소하지 않은 경우에만 스캔 시작
    if (!res.canceled) {
      runScan(res.assets[0].uri);
    }
  };

  // ─────────────────────────────────────────────
  // takePhoto: 카메라로 직접 촬영
  // ─────────────────────────────────────────────
  const takePhoto = async () => {
    // 카메라 접근 권한 요청
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });

    // 사용자가 취소하지 않은 경우에만 스캔 시작
    if (!res.canceled) {
      runScan(res.assets[0].uri);
    }
  };

  // ─────────────────────────────────────────────
  // reset: 초기 상태로 되돌리기
  // ─────────────────────────────────────────────
  const reset = () => {
    setImage(null);
    setResult(null);
    setScanning(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── 상단 헤더 ── */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          {/* 닫기 버튼: 이전 화면(홈)으로 돌아감 */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>AI 스캔</Text>

          {/* 우측 여백 (헤더 타이틀 가운데 정렬용) */}
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* ── 스크롤 영역: 이미지 + 결과 카드 ── */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 이미지 프리뷰 영역 */}
        <View style={styles.imageArea}>
          {image ? (
            // 촬영/선택된 이미지 표시
            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            // 아직 이미지 없을 때: 스캔 프레임 가이드 표시
            <View style={styles.placeholder}>
              {/* 코너 가이드라인 (스캔 프레임 효과) */}
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.placeholderText}>쓰레기를 촬영하거나 선택하세요</Text>
            </View>
          )}

          {/* 스캔 중일 때: 로딩 오버레이 표시 */}
          {scanning && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#7DB55A" />
              <Text style={styles.scanningText}>AI가 분석 중이에요...</Text>
            </View>
          )}
        </View>

        {/* 결과 카드: 스캔 완료 후에만 표시 */}
        {result && !scanning && (
          <View style={styles.resultCard}>

            {/* 결과 헤더: 이모지 + 카테고리명 + 정확도 배지 */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultEmoji}>{result.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultCategory}>{result.category}</Text>
                <Text style={styles.resultConfidenceLabel}>정확도 {result.confidence}%</Text>
              </View>
              {/* 정확도 배지 */}
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceBadgeText}>{result.confidence}%</Text>
              </View>
            </View>

            {/* 품목 태그 목록 */}
            <View style={styles.tagContainer}>
              {result.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* 배출 방법 단계 */}
            <Text style={styles.sectionTitle}>배출 방법</Text>
            {result.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                {/* 단계 번호 원형 뱃지 */}
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            {/* 주의사항 */}
            <Text style={[styles.sectionTitle, { color: '#C0392B', marginTop: 16 }]}>주의사항</Text>
            {result.warnings.map((w, i) => (
              <View key={i} style={styles.warningRow}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>{w}</Text>
              </View>
            ))}

            {/* 다시 스캔하기 버튼 */}
            <TouchableOpacity style={styles.rescanBtn} onPress={reset}>
              <Ionicons name="refresh" size={18} color="#7DB55A" />
              <Text style={styles.rescanText}>다시 스캔하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 스크롤 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── 하단 촬영 버튼 바: 결과가 없고 스캔 중이 아닐 때만 표시 ── */}
      {!result && !scanning && (
        <SafeAreaView style={styles.bottomSafe}>
          <View style={styles.bottomBar}>

            {/* 갤러리 버튼 */}
            <TouchableOpacity style={styles.sideBtn} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={26} color="#fff" />
              <Text style={styles.sideBtnText}>갤러리</Text>
            </TouchableOpacity>

            {/* 셔터 버튼 (카메라 촬영) */}
            <TouchableOpacity style={styles.shutterBtn} onPress={takePhoto}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            {/* 도움말 버튼 (추후 기능 연결) */}
            <TouchableOpacity style={styles.sideBtn}>
              <Ionicons name="help-circle-outline" size={26} color="#fff" />
              <Text style={styles.sideBtnText}>도움말</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// 스타일
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  // 루트: 다크 배경
  root: { flex: 1, backgroundColor: '#1A1A1A' },
  scroll: { flex: 1 },

  // 헤더
  headerSafe: { backgroundColor: '#1A1A1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // 이미지 영역
  imageArea: {
    height: 320,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  previewImage: { width: '100%', height: '100%' },

  // 이미지 없을 때 플레이스홀더
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },

  // 스캔 프레임 (코너 가이드)
  scanFrame: { width: 180, height: 180, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#7DB55A' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
  placeholderText: { fontSize: 14, color: '#888', textAlign: 'center' },

  // 스캔 중 오버레이
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  scanningText: { fontSize: 15, color: '#fff', fontWeight: '600' },

  // 결과 카드
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  resultEmoji: { fontSize: 36 },
  resultCategory: { fontSize: 20, fontWeight: '800', color: '#2C2416' },
  resultConfidenceLabel: { fontSize: 13, color: '#AAA', marginTop: 2 },

  // 정확도 배지
  confidenceBadge: {
    backgroundColor: '#EDF7E4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceBadgeText: { fontSize: 14, fontWeight: '700', color: '#7DB55A' },

  // 품목 태그
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  tag: { backgroundColor: '#F3F1EC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 12, color: '#5A5040', fontWeight: '500' },

  // 배출 방법 / 주의사항 섹션 타이틀
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#2C2416', marginTop: 14, marginBottom: 8 },

  // 배출 단계 행
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  stepNum: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#7DB55A',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10, marginTop: 2,
  },
  stepNumText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  stepText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },

  // 주의사항 행
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  warningIcon: { fontSize: 13, marginRight: 6, marginTop: 1 },
  warningText: { fontSize: 13, color: '#C0392B', flex: 1, lineHeight: 18 },

  // 다시 스캔 버튼
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: '#7DB55A',
    borderRadius: 14,
    paddingVertical: 12,
  },
  rescanText: { fontSize: 15, fontWeight: '600', color: '#7DB55A' },

  // 하단 촬영 바
  bottomSafe: { backgroundColor: '#1A1A1A' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
  sideBtn: { alignItems: 'center', gap: 4, width: 60 },
  sideBtnText: { fontSize: 11, color: '#888', fontWeight: '500' },

  // 셔터 버튼 (외부 링 + 내부 원)
  shutterBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#7DB55A' },
});