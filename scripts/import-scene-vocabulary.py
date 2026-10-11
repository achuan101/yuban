"""Read the supplied workbook without changing it; generate the primary graph."""
import json, hashlib, re, sys
from collections import Counter
from pathlib import Path
import openpyxl

source = Path(sys.argv[1])
root = Path(__file__).resolve().parents[1]
corrections = json.loads((root / 'scripts/glossary-overrides.json').read_text())
book = openpyxl.load_workbook(source, read_only=True, data_only=True)
rows = []
for cells in book['850词总表'].iter_rows(min_row=2, values_only=True):
    if not cells[2]:
        continue
    number, module, word, meaning, pos, frequency, chunk, example, translation = cells[:9]
    key = str(word).strip().lower()
    rows.append({
        'item_id': f'scene850-{int(number):03d}', 'rank': int(number), 'curriculum_rank': int(number),
        'word': key, 'lookup': key, 'meaning': corrections.get(key, str(meaning).strip()),
        'raw_meaning': str(meaning).strip(), 'gloss_source': '人工基础释义校订' if key in corrections else '原表', 'pos': str(pos or ''),
        'source_category': module, 'scene': module, 'source_row': int(number) + 1,
        'source_sheet': '850词总表', 'source_frequency_count': frequency,
        'chunk': str(chunk or ''), 'example': '' if '例句待补' in str(cells[13]) else str(example or ''),
        'example_translation': '' if str(translation).startswith('请') else str(translation or ''),
        'example_pending': '例句待补' in str(cells[13]), 'phonetic': '',
        'band': min(9, (int(number)-1)//100 + 1), 'difficulty': int(number),
        'difficulty_status': '教学顺序初值，尚未实测校准', 'discrimination': 1, 'guessing': .25,
    })
assert len(rows) == 850 and len({r['lookup'] for r in rows}) == 850
assert [r['rank'] for r in rows] == list(range(1,851))
result = {'meta': {
    'count': 850, 'library_id': 'scene850-workbook-v1', 'source': source.name,
    'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'source_structure': dict(Counter(r['source_category'] for r in rows)),
    'assessment_scope': '用户提供的850条词形，不代表词族数、总词汇量或完整CEFR等级',
    'ranking_note': '保留原表教学顺序与模块。参考频次不当作口语频率名次或已校准难度。',
    'pending_examples': sum(r['example_pending'] for r in rows),
}, 'rows': rows}
(root / 'src/data/scene850.json').write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps(result['meta'], ensure_ascii=False))
