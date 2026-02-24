const CATEGORY_DICT: Array<{ category: string; words: string[] }> = [
  { category: '기계', words: ['모터', '감속기', '컨베이어', '유압', '윈치', '기계'] },
  { category: '전기', words: ['인버터', '차단기', '분전', '배선', '케이블', '전기', 'mcc'] },
  { category: '건축', words: ['시멘트', '철골', '패널', '건축', '단열', '방수'] },
  { category: '공구', words: ['드릴', '렌치', '절단기', '그라인더', '공구', '임팩'] },
  { category: '계장', words: ['센서', '트랜스미터', 'plc', '유량계', '계장', '계측'] },
  { category: '기타', words: ['소모품', '안전', '작업등', '기타'] },
];

const STOP_WORDS = ['업체', '찾아줘', '추천', '보여줘', '원해', '필요', '좀', '해줘'];

const splitTokens = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^0-9a-zA-Z가-힣\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

export type NLQResult = {
  keywords: string[];
  categories: string[];
};

export const parseNaturalQuery = (text: string): NLQResult => {
  const rawTokens = splitTokens(text).filter((token) => !STOP_WORDS.includes(token));
  const powerTokens = text.toLowerCase().match(/\d+\s?(kw|kva|v|a|mm|kg|ton)/g) ?? [];

  const keywordSet = new Set<string>([...rawTokens, ...powerTokens.map((s) => s.replace(/\s+/g, ''))]);
  const categories = new Set<string>();

  CATEGORY_DICT.forEach(({ category, words }) => {
    if ([...keywordSet].some((token) => words.some((word) => token.includes(word)))) {
      categories.add(category);
    }
  });

  return {
    keywords: [...keywordSet],
    categories: [...categories],
  };
};
