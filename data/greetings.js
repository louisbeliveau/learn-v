'use strict';

const _basics = [
  { en: 'Hello',             vi: 'Xin chào',         note: 'universal greeting, any time of day' },
  { en: 'Goodbye',           vi: 'Tạm biệt',         note: 'lit. "temporarily separate"' },
  { en: 'Thank you',         vi: 'Cảm ơn',           note: 'add "bạn" → "cảm ơn bạn" (thank you, you)' },
  { en: "You're welcome",    vi: 'Không có gì',       note: 'lit. "it\'s nothing"' },
  { en: 'Sorry / Excuse me', vi: 'Xin lỗi',          note: 'works for both apology and getting attention' },
  { en: 'Yes',               vi: 'Vâng',             note: 'formal; casual: "ừ"' },
  { en: 'No',                vi: 'Không',            note: 'also means "zero"' },
  { en: 'Please',            vi: 'Làm ơn',           note: 'placed before the request' },
  { en: 'Good morning',      vi: 'Chào buổi sáng',   note: '"sáng" = morning' },
  { en: 'Good night',        vi: 'Chúc ngủ ngon',    note: 'lit. "wish you good sleep"' },
];

const _all = [
  ..._basics,
  { en: 'Good afternoon',          vi: 'Chào buổi chiều',           note: '"chiều" = afternoon/evening' },
  { en: 'How are you?',            vi: 'Bạn khỏe không?',           note: '"khỏe" = healthy / well' },
  { en: "I'm fine, thanks",        vi: 'Tôi khỏe, cảm ơn',         note: '"tôi" = I / me' },
  { en: "What's your name?",       vi: 'Bạn tên là gì?',            note: '"tên" = name' },
  { en: 'My name is…',             vi: 'Tôi tên là…',               note: 'replace "…" with your name' },
  { en: 'Nice to meet you',        vi: 'Rất vui được gặp bạn',      note: 'lit. "very happy to meet you"' },
  { en: "I don't understand",      vi: 'Tôi không hiểu',            note: '"hiểu" = understand' },
  { en: 'Do you speak English?',   vi: 'Bạn có nói tiếng Anh không?', note: '"tiếng" = language' },
  { en: 'How much does it cost?',  vi: 'Bao nhiêu tiền?',           note: '"tiền" = money' },
  { en: 'Where is…?',              vi: '… ở đâu?',                  note: '"đâu" = where' },
];

const GREETINGS_MODULE = {
  id: 'greetings',
  name: 'Phrases',
  defaultSet: 0,
  sets: [
    { label: 'Basics', items: _basics },
    { label: 'All',    items: _all },
  ],
};
