/*! API 실습실 — 에듀넷 주제별 학습자료 (연습용으로 담아 둔 자료)
 * © 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요.
 *
 * ⚠ 이 파일은 손으로 고치지 말 것. tools/fetch_edunet.mjs 가 만든다.
 *
 * ★ 자료의 출처는 한국교육학술정보원(KERIS) 에듀넷이다. 우리 것이 아니다.
 *   콘텐츠 본문(<expln>, 한 건에 1만 자 HTML)은 담지 않고 제목·키워드·링크만 남겼다.
 *
 * ⚠⚠ 이 API 는 브라우저에서 직접 못 부른다 (2026-08-30 확인)
 *   ① Access-Control-Allow-Origin 헤더가 오지 않아 브라우저가 요청을 막는다
 *   ② 파일이 1.1~6.0MB 라 한 반이 동시에 받으면 학교망이 버티지 못한다
 *   그래서 화면은 담아 둔 자료로 돌리고, 「진짜로 불러 보기」 단추로
 *   막히는 것을 직접 보여 주며 그 까닭을 가르친다.
 */

/** 요청 변수는 clss_id 하나뿐이다 (매뉴얼 v1.3 「2) 요청 변수」 표) */
export const 주소틀 = 'https://kr.object.gov-ncloudstorage.com/edunet-data'
  + '/KEDNCM/OPENAPI/CNEDU/WKSTCONT/cnedu_wkst_cont_{clss_id}.xml';

/** clss_id 값 일곱 가지 — 매뉴얼에 적힌 그대로 */
export const 과목들 = [
  { clss_id: '362', 이름: '사회', 전체건수: 590 },
  { clss_id: '363', 이름: '과학', 전체건수: 468 },
  { clss_id: '75541', 이름: '음악', 전체건수: 89 },
  { clss_id: '75542', 이름: '미술', 전체건수: 92 },
  { clss_id: '75543', 이름: '체육', 전체건수: 87 },
  { clss_id: '75544', 이름: '기술·가정·실과', 전체건수: 94 },
  { clss_id: '89162', 이름: '범교과 학습 주제', 전체건수: 250 },
]

/** 담아 둔 자료 — clss_id 가 열쇠. 과목마다 앞 12건만. */
export const 학습자료 = {
 "362": {
  "이름": "사회",
  "create_date": "2025-02-09",
  "total": 590,
  "rows": [
   {
    "conts_id": "82601",
    "ttl": "셰일가스의 가능성과 한계",
    "kywd": "로마클럽, 한계, 셰일 가스, 에너지원, 셰일혁명",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/82601"
   },
   {
    "conts_id": "93329",
    "ttl": "내가 무의식적으로 쓴 말이 혐오표현이었다고?",
    "kywd": "혐오표현, 차별, 결정 장애, 혐오, 결정",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/93329"
   },
   {
    "conts_id": "21464",
    "ttl": "플라스틱 섬",
    "kywd": "플라스틱, 일회용품, 환경, 쓰레기섬, 섬",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/21464"
   },
   {
    "conts_id": "100587",
    "ttl": "플라스틱 사용을 줄이는 방법",
    "kywd": "플라스틱, 생태계 파괴, 환경 오염, 대체 물질, 생태계",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/100587"
   },
   {
    "conts_id": "1980750",
    "ttl": "해양 생태계와 생물 다양성",
    "kywd": "생물 다양성, 해양, 바다, 생태계, 점박이물범, 독도 강치",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/1980750"
   },
   {
    "conts_id": "1989363",
    "ttl": "해양의 특징",
    "kywd": "바다, 해양, 생태계, 해류, 조석",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/1989363"
   },
   {
    "conts_id": "1998942",
    "ttl": "학생독립운동기념일",
    "kywd": "항일운동, 독립, 항일, 학생독립운동, 광주",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/1998942"
   },
   {
    "conts_id": "58674",
    "ttl": "저출산 고령화가 우리 삶에 어떤 영향을 줄까?",
    "kywd": "인구, 저출산, 고령화, 통계, 부양",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/58674"
   },
   {
    "conts_id": "7410",
    "ttl": "평화의 소녀상",
    "kywd": "소녀상, 위안부, 일본, 수요 집회",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/7410"
   },
   {
    "conts_id": "51031",
    "ttl": "통일 이후 유망 직업을 알아봅시다.",
    "kywd": "직업, 통일, 미래, 재화, 물류",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/51031"
   },
   {
    "conts_id": "2014972",
    "ttl": "토요일이 휴일이 아니었다고?",
    "kywd": "휴일, 주5일, 휴무",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/2014972"
   },
   {
    "conts_id": "61387",
    "ttl": "컴퓨터가 관리하는 농장, 스마트팜",
    "kywd": "농사, 농업, 인공지능, 스마트팜, 자동화",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/153/61387"
   }
  ]
 },
 "363": {
  "이름": "과학",
  "create_date": "2025-02-09",
  "total": 468,
  "rows": [
   {
    "conts_id": "27430",
    "ttl": "직업현장의 안전 장비",
    "kywd": "안전, 안전장비, 직업현장, 장비, 안전대",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/27430"
   },
   {
    "conts_id": "44280",
    "ttl": "직업 안전, 산업안전보건법이 보장해요!",
    "kywd": "안전, 법, 재해, 산업안전보건법, 직업안전",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/44280"
   },
   {
    "conts_id": "3338",
    "ttl": "재난 상황에서 안전을 지키는 방법",
    "kywd": "재난, 대피, 비상구, 안전, 재해",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/3338"
   },
   {
    "conts_id": "13328",
    "ttl": "생명의 소중함",
    "kywd": "생명, 삶, 죽음, 반려동물, 장례",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/13328"
   },
   {
    "conts_id": "74620",
    "ttl": "수업 중 지진이 일어나면 어떻게 해야 할까?",
    "kywd": "지진, 대피, 대피장소, 피해, 공터",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/74620"
   },
   {
    "conts_id": "1977941",
    "ttl": "식물도 소통해요",
    "kywd": "반려 식물, 화학 물질, 소통, 식물",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/1977941"
   },
   {
    "conts_id": "2006763",
    "ttl": "무지개의 모든 것",
    "kywd": "무지개, 반사, 물방울, 프리즘, 빛",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/2006763"
   },
   {
    "conts_id": "35961",
    "ttl": "동물원의 환경 정비",
    "kywd": "동물원, 환경, 동물, 방사장, 정비",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/35961"
   },
   {
    "conts_id": "45077",
    "ttl": "더불어 사는 세상, 동물 복지 상품",
    "kywd": "동물, 복지, 상품, 행복, 소비",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/45077"
   },
   {
    "conts_id": "1981665",
    "ttl": "동물간호복지사가 하는 일",
    "kywd": "동물간호복지사, 수의사, 동물복지, 복지, 동물",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/1981665"
   },
   {
    "conts_id": "1990548",
    "ttl": "동물의 신기한 능력",
    "kywd": "동물, 신기한 능력, 박쥐, 아귀, 펭귄",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/1990548"
   },
   {
    "conts_id": "1999719",
    "ttl": "동물원의 사육사 이야기",
    "kywd": "동물원, 사육사, 동물, 친구, 물범",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/154/1999719"
   }
  ]
 },
 "75541": {
  "이름": "음악",
  "create_date": "2025-02-09",
  "total": 89,
  "rows": [
   {
    "conts_id": "2004903",
    "ttl": "피아노 비르투오소, ‘리스트’",
    "kywd": "비르투오소, 리스트, 서양 음악, 작곡가, 피아노",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/2004903"
   },
   {
    "conts_id": "1977728",
    "ttl": "피타고라스 음계",
    "kywd": "음악사, 음계, 게이름, 화음, 피타고라스, 귀도 다레초",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/1977728"
   },
   {
    "conts_id": "2012730",
    "ttl": "케이팝",
    "kywd": "케이팝, K-pop, 아이돌, 빌보드, 연예인, 가수",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/2012730"
   },
   {
    "conts_id": "79786",
    "ttl": "크롬 뮤직랩 송 메이커를 활용한 작곡 놀이",
    "kywd": "작곡, 작곡 놀이, 리듬 창작, 가락 창작, 크롬 뮤직랩, 송 메이커, 멜로디 메이커",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/79786"
   },
   {
    "conts_id": "87689",
    "ttl": "정간보를 활용한 리듬 말놀이",
    "kywd": "리듬, 정간보, 리듬놀이, 전통 음악, 악보",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/87689"
   },
   {
    "conts_id": "2005495",
    "ttl": "컵으로 연주하는 난타",
    "kywd": "컵타, 난타, 리듬, 연주하기, 타악기, 실습",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/2005495"
   },
   {
    "conts_id": "2015453",
    "ttl": "음악을 눈으로 보다",
    "kywd": "클래식, 음악, 애니메이션, 환타지아, 판타지아, 뒤가, 뒤카 마법사의 제자, 마법사와 도제, 차이코프스키, 호두까기 인형",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/2015453"
   },
   {
    "conts_id": "28668",
    "ttl": "정간보 보고 노래하기",
    "kywd": "정간보, 국악, 악보, 기보법, 전통 음악, 세종대왕",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/28668"
   },
   {
    "conts_id": "2022423",
    "ttl": "음표의 종류와 길이",
    "kywd": "음표, 음표의 종류, 음표의 길이, 셋잇단음표, 마디",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/2022423"
   },
   {
    "conts_id": "88756",
    "ttl": "우리의 음악 유산, 처용무",
    "kywd": "처용무, 국악, 궁중 무용, 삼현육각, 설화",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/88756"
   },
   {
    "conts_id": "1994176",
    "ttl": "우리의 음악 유산, 아리랑·가곡·농악·남사당놀이",
    "kywd": "아리랑, 가곡, 농악, 남사당놀이, 세계인류무형문화유산",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/1994176"
   },
   {
    "conts_id": "2000326",
    "ttl": "음악의 재료, 소리",
    "kywd": "소리, 소리의 3요소, 진동, 진동수, 진폭, 음색",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/155/2000326"
   }
  ]
 },
 "75542": {
  "이름": "미술",
  "create_date": "2025-02-09",
  "total": 92,
  "rows": [
   {
    "conts_id": "1989593",
    "ttl": "휴대폰 속 앱은 누가 디자인할까?",
    "kywd": "UX 디자이너, UX, UI, GUI, 스마트폰",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/1989593"
   },
   {
    "conts_id": "2003908",
    "ttl": "질감의 재발견",
    "kywd": "조형 요소, 조형 원리, 임파스토, 프로타주, 콜라주, 아상블라주, 디지털아트",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/2003908"
   },
   {
    "conts_id": "12787",
    "ttl": "읽을까? 볼까? 타이포그래피",
    "kywd": "타이포그래피, 표현 방법, 조형 요소, 조형 원리, 서체 디자인, 글씨 디자인",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/12787"
   },
   {
    "conts_id": "97348",
    "ttl": "작품 제작 의도 이해하기",
    "kywd": "감상, 소재와 주제, 발상, 조형 요소, 공감각",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/97348"
   },
   {
    "conts_id": "49131",
    "ttl": "재미있는 패키지 디자인",
    "kywd": "패키지 디자인, 포장 디자인, 상품, 상업 디자인, 시각 디자인",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/49131"
   },
   {
    "conts_id": "20225",
    "ttl": "웰컴 투 방구석 미술관",
    "kywd": "구글 아트 앤 컬처, AR, VR, 가상미술관",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/20225"
   },
   {
    "conts_id": "17396",
    "ttl": "재료 실험실",
    "kywd": "재료, 용구, 표현 방법, 조형 요소, 조형 원리",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/17396"
   },
   {
    "conts_id": "92151",
    "ttl": "원근법이 달라? 달라!",
    "kywd": "원근법, 삼원법, 산점 투시, 투시 원근법, 동양 미술, 서양 미술",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/92151"
   },
   {
    "conts_id": "12313",
    "ttl": "자신의 전 재산으로 우리 문화재를 지키다, 간송 전형필",
    "kywd": "간송미술관, 전형필, 최초의 사립 미술관, 문화재, 역사",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/12313"
   },
   {
    "conts_id": "2309",
    "ttl": "유니버설 디자인",
    "kywd": "모두를 위한 디자인, 유니버설 디자인, 일반성, 보편성, 소외 계층",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/2309"
   },
   {
    "conts_id": "20160",
    "ttl": "아름다운 쓸모, 전통 매듭",
    "kywd": "전통 매듭, 전통 공예",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/20160"
   },
   {
    "conts_id": "7131",
    "ttl": "신기한 관찰 도구 이야기",
    "kywd": "카메라 루시다, 카메라 옵스큐라, 사진기, 마르셀 뒤샹, 관찰 도구",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/156/7131"
   }
  ]
 },
 "75543": {
  "이름": "체육",
  "create_date": "2025-02-09",
  "total": 87,
  "rows": [
   {
    "conts_id": "22955",
    "ttl": "피구인 듯, 발야구인 듯 신나는 킥볼!",
    "kywd": "피구, 발야구, 킥볼, 뉴스포츠, 경기",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/22955"
   },
   {
    "conts_id": "19371",
    "ttl": "해수욕장 감염병 예방 수칙",
    "kywd": "해수욕장, 감염병, 예방, 건강, 안전",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/19371"
   },
   {
    "conts_id": "35189",
    "ttl": "핸드볼만큼 재미있는 추크볼",
    "kywd": "스포츠, 추크볼, 핸드볼, 게임, 뉴스포츠",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/35189"
   },
   {
    "conts_id": "54256",
    "ttl": "플라잉디스크로 즐기는 디스크골프",
    "kywd": "플라잉디스크, 뉴스포츠, 디스크골프, 골프, 경기",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/54256"
   },
   {
    "conts_id": "1971931",
    "ttl": "짧지만 강렬하게, 타바타 운동",
    "kywd": "건강, 운동, 홈 트레이닝, 타바타, 버피테스트, 스쿼트, 팔굽혀펴기, 크런치",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/1971931"
   },
   {
    "conts_id": "36751",
    "ttl": "친구와 함께 만드는 티볼 골프 게임",
    "kywd": "간이 골프, 티볼 골프, 표적 게임, 경기, 골프",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/36751"
   },
   {
    "conts_id": "37585",
    "ttl": "팡팡 터지는 소프트발리볼",
    "kywd": "배구, 소프트발리볼, 뉴스포츠, 경기, 스포츠",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/37585"
   },
   {
    "conts_id": "63446",
    "ttl": "총이 없어도 명사수",
    "kywd": "표적놀이, 교실 체육, 다트, 과녁, 경기",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/63446"
   },
   {
    "conts_id": "11903",
    "ttl": "페트병으로 즐기는 볼링 게임",
    "kywd": "페트병, 볼링, 게임, 놀이, 활동",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/11903"
   },
   {
    "conts_id": "2011724",
    "ttl": "탁구와 배드민턴의 만남! 핸들러",
    "kywd": "뉴스포츠, 셔틀콕, 핸들러, 네트형 경쟁, 탁구, 배드민턴",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/2011724"
   },
   {
    "conts_id": "2015803",
    "ttl": "지구만큼 큰 공으로 협동심을 발휘하는 킨볼",
    "kywd": "큰 공, 공, 킨볼, 협동, 뉴스포츠",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/2015803"
   },
   {
    "conts_id": "2392",
    "ttl": "팝콘 브레인을 예방하자!",
    "kywd": "건강, 팝콘브레인, 전자기기, 디지털기기, 휴대폰사용",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/157/2392"
   }
  ]
 },
 "75544": {
  "이름": "기술·가정·실과",
  "create_date": "2025-02-09",
  "total": 94,
  "rows": [
   {
    "conts_id": "28189",
    "ttl": "자동차를 타고 날아볼까?",
    "kywd": "기술, 플라잉카, 미래의 교통수단, 수송 기술, 발전",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/28189"
   },
   {
    "conts_id": "2008179",
    "ttl": "지구를 살리는 인공 태양, 핵융합 발전",
    "kywd": "신재생 에너지, 핵융합, 전기 에너지, 에너지 개발, 핵분열",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/2008179"
   },
   {
    "conts_id": "8412",
    "ttl": "절차적 사고를 알아볼까요",
    "kywd": "절차적 사고, 소프트웨어, 프로그램, 생활, 순서",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/8412"
   },
   {
    "conts_id": "77139",
    "ttl": "토피어리로 실내 조경을 해봐요",
    "kywd": "토피어리, 조경, 인테리어, 실내, 장식",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/77139"
   },
   {
    "conts_id": "13839",
    "ttl": "코로나 바이러스와 PCR",
    "kywd": "바이러스, 코로나19, 검사, PCR, 감염병",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/13839"
   },
   {
    "conts_id": "36272",
    "ttl": "지식재산의 의미와 종류",
    "kywd": "지식재산, 지식재산권, 특허권, 실용신안권, 디자인권, 상표권",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/36272"
   },
   {
    "conts_id": "6871",
    "ttl": "주거 속 유니버설 디자인",
    "kywd": "주거, 유니버설 디자인, 안전, 편리, 평등",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/6871"
   },
   {
    "conts_id": "64465",
    "ttl": "천년고찰 ‘황룡사’를 복원하다.",
    "kywd": "AR, 황룡사, 경주, 증강현실, 복원",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/64465"
   },
   {
    "conts_id": "63650",
    "ttl": "전기 자동차의 종류",
    "kywd": "전기 자동차, 하이브리드 자동차, 플러그인 하이브리드 자동차, 친환경 자동차, 수송 수단",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/63650"
   },
   {
    "conts_id": "2003515",
    "ttl": "크리에이터에 대하여 알고 싶어요",
    "kywd": "유투브, 크리에이터, 직업, 장래희망, 콘텐츠",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/2003515"
   },
   {
    "conts_id": "1967406",
    "ttl": "지진 대비 설계 실험",
    "kywd": "지진, 설계, 실험, 내진, 건설",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/1967406"
   },
   {
    "conts_id": "2001934",
    "ttl": "콘덴서 비행기 만들기",
    "kywd": "수송, 기술, 비행기, 문제해결, 콘덴서",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/158/2001934"
   }
  ]
 },
 "89162": {
  "이름": "범교과 학습 주제",
  "create_date": "2025-02-09",
  "total": 250,
  "rows": [
   {
    "conts_id": "58361",
    "ttl": "자살 예방을 위한 학교의 준비",
    "kywd": "청소년 자살, 자살 예방, 청소년 자살의 원인, 정서 장애, 품행 장애, 섭식 장애, 관심과 사랑",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/58361"
   },
   {
    "conts_id": "72084",
    "ttl": "소중한 생명",
    "kywd": "생명의 소중함, 자살의 위험성, 사회적 경쟁, 물질 중시 풍조, 인간 존중, 자기 사랑, 삶의 귀중함",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/72084"
   },
   {
    "conts_id": "1963519",
    "ttl": "우리는 모두 자살 예방 보안관",
    "kywd": "청소년 자살 위험 신호, 청소년 자살 위험 신호의 유형, 청소년 자살 위험 신호의 대처 방안, 언어적 징후, 행동적 징후",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/1963519"
   },
   {
    "conts_id": "1963776",
    "ttl": "우리는 모두 평등해요",
    "kywd": "인권 평등, 장애인 인권, 다양성 인정, 차별, 차별의 종류, 장애인 인식",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/1963776"
   },
   {
    "conts_id": "1999741",
    "ttl": "자살 위험 신호의 유형과 대처 방안",
    "kywd": "자살 위험 신호의 유형, 자살 위험 대처 방안, 청소년 자살률, 자살 요인, 자살 예방 교육",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/1999741"
   },
   {
    "conts_id": "2000759",
    "ttl": "인권은 어떻게 성장하여 왔을까요?",
    "kywd": "인권의 역사, 인권 발달 과정, 인권의 본질, 인권의 진화, 인권 침해, 공동체",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/2000759"
   },
   {
    "conts_id": "15987",
    "ttl": "먼저 온 미래, 탈북민과 좋은 이웃이 되려면?",
    "kywd": "북한이탈주민, 탈북민, 탈북민의 어려움, 언어의 차이, 문화의 차이, 탈북민 차별, 먼저 온 통일",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/15987"
   },
   {
    "conts_id": "55000",
    "ttl": "통일이 되면 가보고 싶은 북한 여행지는?",
    "kywd": "북한 주요 도시, 북한 관광 명소, 북한에 대한 이해, 남북 통일, 개성, 북한 도시 소개",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/55000"
   },
   {
    "conts_id": "66756",
    "ttl": "함께 떠나는 북한 미식 여행",
    "kywd": "북한 음식, 북한의 지리적 환경, 북한의 사회 상황, 북한 미식 여행",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/66756"
   },
   {
    "conts_id": "91477",
    "ttl": "우리는 어떻게 분단국가가 되었을까?",
    "kywd": "남북 분단의 배경, 남북 분단의 과정, 분단국가 과정, 분단의 역사, 38선 분할, 통일의 필요성",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/91477"
   },
   {
    "conts_id": "1982593",
    "ttl": "생태·문화·평화의 공간 DMZ",
    "kywd": "DMZ, DMZ의 가치, DMZ 평화적 활용 방법, 전쟁의 상처, 생태적 가치, 역사 문화적 가치, 비무장 지대, 역사와 안보, 생태와 문화의 교차로, 임진각, 도라산 평화공원, 통일 동산, 자유의 다리, 제3땅굴",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/1982593"
   },
   {
    "conts_id": "2029",
    "ttl": "디지털 금융과 인공지능",
    "kywd": "인공 지능, 디지털 금융 활용 사례, 디지털 금융의 변화, 인공지능의 진화, 챗봇, 가상비서, 로보어드바이저, 신용평가",
    "unit_nm": "",
    "url": "https://www.edunet.net/contsMvGllry/view/159/2029"
   }
  ]
 }
};
