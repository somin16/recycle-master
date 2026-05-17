import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FAQ_DATA = [
  {
    q: '페트병 라벨은 꼭 떼야 하나요?',
    a: '네, 라벨(비닐)과 페트병(플라스틱)은 재질이 달라서 반드시 분리해야 합니다. 라벨을 제거하지 않으면 재활용이 불가능합니다.',
  },
  {
    q: '배달 음식 용기는 어떻게 버리나요?',
    a: '음식물을 깨끗이 씻어낸 후 플라스틱·알루미늄 등 재질에 따라 분리배출합니다. 오염이 심하면 일반쓰레기로 처리하세요.',
  },
  {
    q: '종이컵도 재활용이 되나요?',
    a: '종이컵은 내부에 PE 코팅이 되어 있어 일반 종이와 다른 수거함에 배출해야 합니다. 전용 수거함이 없다면 일반쓰레기로 처리하세요.',
  },
  {
    q: '피자 상자는 재활용 가능한가요?',
    a: '기름이 묻지 않은 부분은 종이류로 배출 가능하지만, 기름이 많이 묻었다면 일반쓰레기로 처리하세요.',
  },
  {
    q: '영수증은 어떻게 버리나요?',
    a: '영수증(감열지)은 특수 코팅이 되어 있어 재활용이 불가합니다. 일반쓰레기로 버리세요.',
  },
];

const PRINCIPLES = [
  { icon: '🫙', label: '비우기',   desc: '내용물을 완전히 비웁니다' },
  { icon: '💧', label: '헹구기',   desc: '이물질을 깨끗이 씻어냅니다' },
  { icon: '🔀', label: '분리하기', desc: '재질별로 분류합니다' },
  { icon: '📦', label: '압착하기', desc: '부피를 줄여서 배출합니다' },
];

export default function GuideScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffcf5" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan Guide</Text>
          <Text style={styles.subTitle}>분리수거 가이드</Text>
        </View>

        {/* 검색바 */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#AAA" />
          <TextInput
            placeholder="품목 검색 (예: 페트병, 종이)"
            placeholderTextColor="#BBB"
            style={styles.input}
          />
        </View>

        <View style={styles.content}>
          {/* 기본 원칙 카드 */}
          <View style={styles.principleCard}>
            <Text style={styles.cardTitle}>분리수거 기본 원칙</Text>
            <View style={styles.principleGrid}>
              {PRINCIPLES.map((p) => (
                <View key={p.label} style={styles.principleItem}>
                  <Text style={styles.principleEmoji}>{p.icon}</Text>
                  <Text style={styles.principleLabel}>{p.label}</Text>
                  <Text style={styles.principleDesc}>{p.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 자주 묻는 질문 */}
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
          {FAQ_DATA.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.faqItem, openIndex === i && styles.faqItemOpen]}
              onPress={() => toggle(i)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqBullet}>
                  <Text style={styles.faqBulletText}>Q</Text>
                </View>
                <Text style={styles.faqQuestion}>{item.q}</Text>
                <Ionicons
                  name={openIndex === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#AAA"
                />
              </View>
              {openIndex === i && (
                <View style={styles.faqAnswerBox}>
                  <Text style={styles.faqAnswer}>{item.a}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* 배출 요일 안내 배너 */}
          <View style={styles.banner}>
            <Ionicons name="calendar-outline" size={22} color="#7DB55A" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.bannerTitle}>우리 동네 배출 요일 확인</Text>
              <Text style={styles.bannerDesc}>지역마다 배출 요일이 달라요</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7DB55A" />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffcf5' },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6 },
  title: { fontSize: 26, fontWeight: '800', color: '#2C2416', letterSpacing: -0.5 },
  subTitle: { fontSize: 15, fontWeight: '600', marginTop: 2, color: '#6B5E45' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDE6',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },

  content: { padding: 20 },

  // 기본 원칙 카드
  principleCard: {
    backgroundColor: '#F8F5EC',
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#EAE5D8',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#2C2416', marginBottom: 14 },
  principleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  principleItem: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  principleEmoji: { fontSize: 22, marginBottom: 6 },
  principleLabel: { fontSize: 13, fontWeight: '700', color: '#2C2416', marginBottom: 2 },
  principleDesc: { fontSize: 12, color: '#888', lineHeight: 16 },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C2416',
    marginBottom: 12,
  },

  // FAQ
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  faqItemOpen: {
    borderWidth: 1,
    borderColor: '#D4ECC0',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  faqBullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EDF7E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqBulletText: { fontSize: 12, fontWeight: '800', color: '#7DB55A' },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: '#333', lineHeight: 20 },
  faqAnswerBox: {
    backgroundColor: '#F8FCF5',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswer: { fontSize: 14, color: '#666', lineHeight: 22 },

  // 배너
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF7E4',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D4ECC0',
  },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#2C7A3A' },
  bannerDesc: { fontSize: 12, color: '#6BAA7A', marginTop: 2 },
});