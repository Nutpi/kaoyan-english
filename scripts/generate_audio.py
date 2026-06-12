#!/usr/bin/env python3
# ============================================================
# 从 TypeScript 词库提取 word + example 并生成 TTS 音频
# 自动扫描所有新增词汇，只生成缺失的音频文件
# ============================================================

import os
import re
import sys
import base64
import time
import json
import argparse
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("请先安装 openai: pip install openai")
    sys.exit(1)

# ========== 配置 ==========
MIMO_API_KEY = "tp-cupq9hr38507e2eumh08vafvcwwljkcdr4uzz2zo4bhkzt7k"
MIMO_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1"

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
WORDS_DIR = PROJECT_DIR / "public" / "audio" / "words"
EXAMPLES_DIR = PROJECT_DIR / "public" / "audio" / "examples"
LIB_DIR = PROJECT_DIR / "lib"

VOICE = "冰糖"
FORMAT = "wav"
MAX_RETRIES = 3

client = OpenAI(api_key=MIMO_API_KEY, base_url=MIMO_BASE_URL)


def extract_words_from_ts(filepath: Path) -> list[dict]:
    """从 TypeScript 词库文件中提取 word 和 example"""
    content = filepath.read_text()
    # 匹配 word: 'xxx' 和 example: 'xxx' 模式
    words = []
    # 使用正则提取每个词的 word 和 example 字段
    pattern = r"word:\s*'([^']+)'"
    examples_pattern = r"example:\s*'([^']*)'"

    # 更健壮的方式：按对象分割
    # 匹配 { id: 开头的每个词对象
    obj_pattern = r"\{\s*id:\s*'[^']+',\s*word:\s*'([^']+)',.*?example:\s*'([^']*?)'.*?\}"
    for match in re.finditer(obj_pattern, content, re.DOTALL):
        word = match.group(1)
        example = match.group(2).replace("\\'", "'")
        words.append({"word": word, "example": example})

    return words


def get_all_words() -> list[dict]:
    """从所有词库文件中提取词汇"""
    all_words = []
    seen = set()

    # 扫描 lib 目录下所有词库文件
    word_files = [
        LIB_DIR / "words.ts",
        LIB_DIR / "words_h076_h175.ts",
        LIB_DIR / "words_m021_m120.ts",
        LIB_DIR / "words_l011_l110.ts",
    ]

    # 自动发现其他扩展文件
    for f in LIB_DIR.glob("words_*.ts"):
        if f not in word_files:
            word_files.append(f)

    for filepath in word_files:
        if not filepath.exists():
            continue
        extracted = extract_words_from_ts(filepath)
        for w in extracted:
            if w["word"] not in seen:
                seen.add(w["word"])
                all_words.append(w)

    return all_words


def safe_filename(word: str) -> str:
    return word.lower().replace(" ", "_").replace("'", "")


def generate_tts(text: str, style: str = "清晰标准的英语发音，语速适中。") -> bytes | None:
    for attempt in range(MAX_RETRIES):
        try:
            completion = client.chat.completions.create(
                model="mimo-v2.5-tts",
                messages=[
                    {"role": "user", "content": style},
                    {"role": "assistant", "content": text}
                ],
                audio={"format": FORMAT, "voice": VOICE}
            )
            message = completion.choices[0].message
            if hasattr(message, 'audio') and message.audio is not None:
                return base64.b64decode(message.audio.data)
            return None
        except Exception as e:
            print(f"    ❌ 尝试 {attempt + 1}/{MAX_RETRIES} 失败: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(2 ** (attempt + 1))
    return None


def main():
    parser = argparse.ArgumentParser(description="考研英语词库 TTS 音频生成")
    parser.add_argument("--words-only", action="store_true", help="仅生成单词音频")
    parser.add_argument("--examples-only", action="store_true", help="仅生成例句音频")
    parser.add_argument("--delay", type=float, default=1.0, help="API 调用间隔(秒)")
    parser.add_argument("--skip-existing", action="store_true", default=True, help="跳过已存在文件")
    parser.add_argument("--start-from", type=int, default=0, help="从第N个词开始")
    args = parser.parse_args()

    WORDS_DIR.mkdir(parents=True, exist_ok=True)
    EXAMPLES_DIR.mkdir(parents=True, exist_ok=True)

    all_words = get_all_words()

    print("=" * 60)
    print("📚 考研英语词库 - TTS 音频生成")
    print("=" * 60)
    print(f"总词汇数: {len(all_words)}")
    print(f"API 调用间隔: {args.delay}s")
    print("=" * 60)

    # 统计缺失文件
    missing_words = 0
    missing_examples = 0
    for item in all_words:
        sf = safe_filename(item["word"])
        if not (WORDS_DIR / f"{sf}.wav").exists():
            missing_words += 1
        if not (EXAMPLES_DIR / f"{sf}.wav").exists():
            missing_examples += 1

    print(f"缺失单词音频: {missing_words}")
    print(f"缺失例句音频: {missing_examples}")
    print("=" * 60)

    success = 0
    fail = 0
    skip = 0
    total = len(all_words)

    for idx, item in enumerate(all_words):
        if idx < args.start_from:
            continue

        word = item["word"]
        example = item["example"]
        sf = safe_filename(word)

        print(f"\n[{idx + 1}/{total}] {word}")

        # 生成单词音频
        if not args.examples_only:
            out_path = WORDS_DIR / f"{sf}.wav"
            if args.skip_existing and out_path.exists():
                skip += 1
            else:
                print(f"  🔤 生成单词音频...")
                audio = generate_tts(word, "清晰标准的英语单词发音，语速较慢，每个音节清晰可辨。")
                if audio:
                    out_path.write_bytes(audio)
                    success += 1
                    print(f"    ✅ {len(audio)} bytes")
                else:
                    fail += 1
                    print(f"    ❌ 失败")
                time.sleep(args.delay)

        # 生成例句音频
        if not args.words_only:
            out_path = EXAMPLES_DIR / f"{sf}.wav"
            if args.skip_existing and out_path.exists():
                skip += 1
            else:
                print(f"  📖 生成例句音频...")
                audio = generate_tts(example, "清晰自然的英语朗读，语速适中，适合学习。")
                if audio:
                    out_path.write_bytes(audio)
                    success += 1
                    print(f"    ✅ {len(audio)} bytes")
                else:
                    fail += 1
                    print(f"    ❌ 失败")
                time.sleep(args.delay)

    # 最终统计
    word_files = list(WORDS_DIR.glob("*.wav"))
    example_files = list(EXAMPLES_DIR.glob("*.wav"))
    total_size = sum(f.stat().st_size for f in word_files + example_files)

    print("\n" + "=" * 60)
    print("📊 生成完成！")
    print(f"  ✅ 本次成功: {success}")
    print(f"  ⏭️  跳过: {skip}")
    print(f"  ❌ 失败: {fail}")
    print(f"\n📁 单词音频: {len(word_files)} 文件")
    print(f"📁 例句音频: {len(example_files)} 文件")
    print(f"💾 总大小: {total_size / 1024 / 1024:.1f} MB")
    print("=" * 60)


if __name__ == "__main__":
    main()
