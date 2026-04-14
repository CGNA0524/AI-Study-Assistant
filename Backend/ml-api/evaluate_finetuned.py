import argparse
import json
import statistics
import time
from pathlib import Path
from urllib import error, request


def post_json(url, payload, timeout):
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    start = time.perf_counter()
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            elapsed_ms = (time.perf_counter() - start) * 1000
            return json.loads(body), elapsed_ms, None
    except Exception as exc:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return None, elapsed_ms, str(exc)


def extract_json_array(text):
    if not text:
        return None
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end <= start:
        return None
    candidate = text[start : end + 1]
    try:
        parsed = json.loads(candidate)
        return parsed if isinstance(parsed, list) else None
    except json.JSONDecodeError:
        return None


def is_valid_quiz(items):
    if not isinstance(items, list) or not items:
        return False
    for item in items:
        if not isinstance(item, dict):
            return False
        if "question" not in item or "options" not in item or "correctAnswer" not in item:
            return False
        if not isinstance(item["options"], list) or len(item["options"]) != 4:
            return False
        if not isinstance(item["correctAnswer"], int):
            return False
        if item["correctAnswer"] < 0 or item["correctAnswer"] > 3:
            return False
    return True


def is_valid_flashcards(items):
    if not isinstance(items, list) or not items:
        return False
    for item in items:
        if not isinstance(item, dict):
            return False
        if "question" not in item or "answer" not in item:
            return False
    return True


def evaluate_case(endpoint, timeout_s, case):
    prompt = case["prompt"]
    expected = case["expected_format"]

    response_json, latency_ms, err = post_json(endpoint, {"prompt": prompt}, timeout_s)

    result = {
        "id": case["id"],
        "task": case["task"],
        "expected_format": expected,
        "latency_ms": round(latency_ms, 2),
        "request_ok": err is None,
        "error": err,
        "response_text": "",
        "non_empty": False,
        "echo_detected": False,
        "format_valid": False,
    }

    if err is not None:
        return result

    text = (response_json or {}).get("response", "")
    if not isinstance(text, str):
        text = ""

    result["response_text"] = text
    result["non_empty"] = bool(text.strip())
    result["echo_detected"] = prompt.strip().lower() in text.lower()

    if expected == "text":
        result["format_valid"] = result["non_empty"]
        return result

    items = extract_json_array(text)
    if expected == "json_quiz":
        result["format_valid"] = is_valid_quiz(items)
    elif expected == "json_flashcards":
        result["format_valid"] = is_valid_flashcards(items)

    return result


def summarize(results):
    total = len(results)
    ok = [r for r in results if r["request_ok"]]
    non_empty = [r for r in results if r["non_empty"]]
    format_valid = [r for r in results if r["format_valid"]]
    echo = [r for r in results if r["echo_detected"]]
    latencies = [r["latency_ms"] for r in results]

    return {
        "total": total,
        "request_success_rate": round(len(ok) * 100 / total, 2) if total else 0.0,
        "non_empty_rate": round(len(non_empty) * 100 / total, 2) if total else 0.0,
        "format_valid_rate": round(len(format_valid) * 100 / total, 2) if total else 0.0,
        "echo_rate": round(len(echo) * 100 / total, 2) if total else 0.0,
        "avg_latency_ms": round(statistics.mean(latencies), 2) if latencies else 0.0,
        "p95_latency_ms": round(statistics.quantiles(latencies, n=20)[18], 2) if len(latencies) >= 20 else None,
    }


def main():
    parser = argparse.ArgumentParser(description="Evaluate local fine-tuned model quality.")
    parser.add_argument("--endpoint", default="http://127.0.0.1:5001/generate")
    parser.add_argument("--dataset", default="benchmark_prompts.json")
    parser.add_argument("--timeout", type=float, default=20.0)
    parser.add_argument("--save", default="last_eval_report.json")
    args = parser.parse_args()

    dataset_path = Path(args.dataset)
    if not dataset_path.exists():
        raise SystemExit(f"Dataset not found: {dataset_path}")

    cases = json.loads(dataset_path.read_text(encoding="utf-8"))
    results = [evaluate_case(args.endpoint, args.timeout, case) for case in cases]
    summary = summarize(results)

    report = {
        "endpoint": args.endpoint,
        "dataset": str(dataset_path),
        "summary": summary,
        "results": results,
    }

    Path(args.save).write_text(json.dumps(report, indent=2), encoding="utf-8")

    print("=== Fine-Tuned Model Evaluation ===")
    print(json.dumps(summary, indent=2))
    print(f"Saved detailed report: {args.save}")

    # Print top failures for fast iteration
    failed_format = [r for r in results if not r["format_valid"]]
    if failed_format:
        print("\nTop format failures:")
        for item in failed_format[:5]:
            snippet = (item["response_text"] or "").replace("\n", " ")[:140]
            print(f"- {item['id']} ({item['task']}): {snippet}")


if __name__ == "__main__":
    main()
