import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// 16 카테고리 (이미지 기준)
const CATEGORIES = [
  { id: '1',  title: '종이류',    icon: 'file-document-outline',  color: '#F3F0DF', emoji: '📄',
    desc: '신문, 책, 종이 박스 등', tags: ['신문지', '책', '노트', '종이 박스', '우유팩'],
    steps: ['비닐 코팅된 부분 제거', '테이프·스프링 등 이물질 제거', '물기 제거 후 배출'],
    warnings: ['비닐 코팅지는 일반쓰레기', '물에 젖은 종이는 일반쓰레기'] },
  { id: '2',  title: '플라스틱',  icon: 'bottle-soda-outline',    color: '#D0E0E3', emoji: '♻️',
    desc: 'PET, PE, PP 등 플라스틱 용기', tags: ['페트병', '플라스틱 용기', '비닐봉지', '스티로폼'],
    steps: ['내용물 비우기', '물로 헹구기', '라벨 제거', '압축하여 배출'],
    warnings: ['음식물이 묻은 경우 세척 필수', '여러 재질이 섞인 제품은 분리'] },
  { id: '3',  title: '유리병',    icon: 'glass-wine',             color: '#FADBD8', emoji: '🍾',
    desc: '음료·식품 유리병 등', tags: ['소주병', '맥주병', '음료수병', '잼 병'],
    steps: ['내용물 완전히 비우기', '라벨 제거', '뚜껑 분리 배출'],
    warnings: ['깨진 유리는 신문지로 감싸 일반쓰레기', '도자기·내열유리 제외'] },
  { id: '4',  title: '캔류',      icon: 'can',                   color: '#D6EAF8', emoji: '🥫',
    desc: '알루미늄·철 캔 등', tags: ['음료 캔', '식품 캔', '분무 캔'],
    steps: ['내용물 비우기', '물로 헹구기', '압축하여 배출'],
    warnings: ['부탄가스 캔은 구멍 뚫어 배출', '페인트 캔은 일반쓰레기'] },
  { id: '5',  title: '비닐류',    icon: 'archive-outline',       color: '#E8DAEF', emoji: '🛍️',
    desc: '각종 비닐·포장재', tags: ['과자 봉지', '비닐봉투', '랩', '지퍼백'],
    steps: ['내용물 완전히 비우기', '이물질 제거', '묶어서 배출'],
    warnings: ['음식물 묻은 비닐은 일반쓰레기', '코팅된 비닐은 분리 불가'] },
  { id: '6',  title: '스티로폼',  icon: 'box-variant',           color: '#FCF3CF', emoji: '📦',
    desc: '스티로폼 박스·완충재 등', tags: ['스티로폼 박스', '컵라면 용기', '완충재'],
    steps: ['테이프·이물질 제거', '내용물 비우기', '묶어서 배출'],
    warnings: ['색깔 있는 스티로폼은 일반쓰레기', '음식물 묻은 경우 일반쓰레기'] },
  { id: '7',  title: '의류',      icon: 'tshirt-crew-outline',   color: '#D5F5E3', emoji: '👕',
    desc: '헌 옷·신발·가방 등', tags: ['티셔츠', '바지', '신발', '가방'],
    steps: ['세탁 후 배출', '의류 수거함 이용', '재사용 가능 상태 유지'],
    warnings: ['속옷·양말은 일반쓰레기', '심하게 훼손된 의류는 일반쓰레기'] },
  { id: '8',  title: '전지류',    icon: 'battery-outline',       color: '#FDEBD0', emoji: '🔋',
    desc: '각종 배터리·건전지 등', tags: ['AA 건전지', '충전지', '버튼형 배터리'],
    steps: ['전용 수거함에 배출', '단말기와 함께 구청 반납'],
    warnings: ['일반 쓰레기통 투기 금지', '파손된 배터리는 별도 처리'] },
  { id: '9',  title: '전자제품',  icon: 'television-outline',    color: '#D6EAF8', emoji: '📺',
    desc: '소형 가전·전자기기 등', tags: ['핸드폰', '충전기', '이어폰', '소형 가전'],
    steps: ['개인정보 삭제 후 배출', '전용 수거함·대리점 반납'],
    warnings: ['일반 쓰레기통 투기 금지', '대형 가전은 별도 신청 필요'] },
  { id: '10', title: '음식물',    icon: 'food-apple-outline',    color: '#FADBD8', emoji: '🍎',
    desc: '음식물 쓰레기·식품 부산물', tags: ['채소', '과일 껍질', '먹다 남은 음식'],
    steps: ['물기 완전히 제거', '음식물 전용 봉투 또는 수거함 이용'],
    warnings: ['뼈·조개껍데기는 일반쓰레기', '과일씨는 일반쓰레기'] },
  { id: '11', title: '대형폐기물', icon: 'sofa-outline',         color: '#E8DAEF', emoji: '🛋️',
    desc: '가구·대형 생활용품 등', tags: ['소파', '책상', '침대', '냉장고'],
    steps: ['관할 주민센터에 신고', '스티커 구매 후 지정 장소 배출'],
    warnings: ['무단 투기 시 과태료 부과', '방문 수거 서비스 이용 가능'] },
  { id: '12', title: '형광등',    icon: 'lightbulb-outline',     color: '#FCF3CF', emoji: '💡',
    desc: '형광등·형광·LED 전구 등', tags: ['형광등', 'LED 전구', '할로겐 전구'],
    steps: ['깨지지 않게 포장', '아파트 전용 수거함 또는 구청 반납'],
    warnings: ['일반 쓰레기통 투기 금지', '깨진 형광등은 밀봉 후 별도 처리'] },
  { id: '13', title: '의약품',    icon: 'pill',                  color: '#FDEBD0', emoji: '💊',
    desc: '유통기한 지난 약·의약품 등', tags: ['알약', '시럽', '연고', '주사기'],
    steps: ['약봉투째 약국·보건소에 반납', '전용 수거함 이용'],
    warnings: ['일반 쓰레기통 투기 금지', '하수구 투기 절대 금지'] },
  { id: '14', title: '화장품',    icon: 'bottle-tonic-outline',  color: '#E8DAEF', emoji: '💄',
    desc: '공병·화장품 용기 등', tags: ['화장품 공병', '립스틱', '향수병'],
    steps: ['내용물 완전히 비우기', '재질별 분리 배출', '공병 수거 캠페인 이용'],
    warnings: ['내용물이 남은 경우 일반쓰레기', '혼합 재질은 분리 후 배출'] },
  { id: '15', title: '폐식용유',  icon: 'water-outline',         color: '#D5F5E3', emoji: '🫙',
    desc: '사용한 식용유·조리 기름', tags: ['튀김 기름', '참기름', '올리브유'],
    steps: ['식힌 후 페트병에 담기', '아파트 수거함 또는 주민센터 반납'],
    warnings: ['하수구 투기 절대 금지', '음식물 쓰레기와 혼합 금지'] },
  { id: '16', title: '일반쓰레기', icon: 'delete-outline',       color: '#F2F3F4', emoji: '🗑️',
    desc: '재활용 불가 생활쓰레기', tags: ['오염된 용기', '복합재질', '1회용품'],
    steps: ['종량제 봉투에 담아 배출', '지정 장소·시간에 배출'],
    warnings: ['재활용 가능 물품은 분리배출', '음식물 혼합 금지'] },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.categoryItem, { backgroundColor: item.color }]}
      onPress={() => setSelectedCategory(item)}
      activeOpacity={0.75}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffcf5" />

      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Scan Guide</Text>
          <Text style={styles.subTitle}>분리수거 방법</Text>
        </View>
      </View>

      {/* 카테고리 그리드 */}
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />

      {/* 카메라 FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="scan" size={28} color="white" />
      </TouchableOpacity>

      {/* 상세 가이드 모달 */}
      <Modal
        visible={!!selectedCategory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCategory(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismiss}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            {/* 드래그 핸들 */}
            <View style={styles.dragHandle} />

            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalEmoji}>{selectedCategory?.emoji}</Text>
                <Text style={styles.modalTitle}>{selectedCategory?.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={styles.descText}>{selectedCategory?.desc}</Text>

              {/* 해당 품목 */}
              <Text style={styles.sectionTitle}>해당 품목</Text>
              <View style={styles.tagContainer}>
                {selectedCategory?.tags?.map((tag: string) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* 배출 방법 */}
              <Text style={styles.sectionTitle}>배출 방법</Text>
              {selectedCategory?.steps?.map((step: string, i: number) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}

              {/* 주의사항 */}
              <Text style={[styles.sectionTitle, { color: '#C0392B' }]}>주의사항</Text>
              {selectedCategory?.warnings?.map((w: string, i: number) => (
                <View key={i} style={styles.warningRow}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>{w}</Text>
                </View>
              ))}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffcf5' },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#2C2416', letterSpacing: -0.5 },
  subTitle: { fontSize: 15, fontWeight: '600', marginTop: 2, color: '#6B5E45' },

  // 그리드
  grid: { paddingHorizontal: 12, paddingBottom: 100 },
  categoryItem: {
    flex: 1,
    margin: 5,
    height: 88,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryEmoji: { fontSize: 28, marginBottom: 4 },
  categoryTitle: { fontSize: 11, fontWeight: '700', color: '#40392b', textAlign: 'center' },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#7DB55A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7DB55A',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  // 모달
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalDismiss: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 0,
    maxHeight: '78%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0DDD8',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalEmoji: { fontSize: 28 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#2C2416' },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F0EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: { marginTop: 8 },

  // 모달 내용
  descText: { fontSize: 14, color: '#888', marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C2416',
    marginTop: 20,
    marginBottom: 10,
  },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#F3F1EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { fontSize: 13, color: '#5A5040', fontWeight: '500' },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#7DB55A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  stepNumText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  stepText: { fontSize: 15, color: '#444', flex: 1, lineHeight: 22 },

  warningRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  warningIcon: { fontSize: 15, marginRight: 8, marginTop: 1 },
  warningText: { fontSize: 14, color: '#C0392B', flex: 1, lineHeight: 20 },
});