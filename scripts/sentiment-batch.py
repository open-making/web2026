#!/usr/bin/env python3
# Batch sentiment scorer for the dev notes. Same cleaning/chunking/model as the
# dev-notes repo's sentiment.py, but loads the model once and scores a whole
# JSON dict: stdin {key: text} -> stdout {key: score in [-1, 1]}.
import sys
import re
import json

MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest"
MAX_CHUNK_TOKENS = 450


def clean_text(text):
    text = re.sub(r"```[\s\S]*?```", " ", text)
    text = re.sub(r"`[^`]*`", " ", text)
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[#*_\[\](){}]", " ", text)
    text = re.sub(r"[.]{2,}", ".", text)
    text = re.sub(r"[-]{2,}", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def chunk_text(text, tokenizer):
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks = []
    current = ""
    for sentence in sentences:
        candidate = f"{current} {sentence}".strip()
        if current and len(tokenizer.encode(candidate)) > MAX_CHUNK_TOKENS:
            chunks.append(current)
            current = sentence
        else:
            current = candidate
    if current:
        chunks.append(current)
    return chunks


def score(classifier, text):
    cleaned = clean_text(text)
    if len(cleaned) < 30:
        return 0.0
    weighted_sum = 0.0
    total_weight = 0
    for chunk in chunk_text(cleaned, classifier.tokenizer):
        scores = {
            r["label"].lower(): r["score"]
            for r in classifier(chunk, truncation=True, max_length=512)[0]
        }
        chunk_sentiment = scores.get("positive", 0) - scores.get("negative", 0)
        weighted_sum += chunk_sentiment * len(chunk)
        total_weight += len(chunk)
    if total_weight == 0:
        return 0.0
    return max(-1.0, min(1.0, weighted_sum / total_weight))


def main():
    inputs = json.load(sys.stdin)
    from transformers import pipeline

    classifier = pipeline("sentiment-analysis", model=MODEL, top_k=None)
    out = {}
    for i, (key, text) in enumerate(inputs.items()):
        try:
            out[key] = round(score(classifier, text), 4)
        except Exception as e:
            print(f"WARN {key}: {e}", file=sys.stderr)
            out[key] = 0.0
        print(f"{i + 1}/{len(inputs)} {key}: {out[key]}", file=sys.stderr)
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
