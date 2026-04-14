# Fine-Tuned Model Improvement Plan

## What is added
- benchmark_prompts.json: 15 mixed prompts for summary, quiz, flashcards.
- benchmark_smoke.json: quick 3-prompt smoke test.
- evaluate_finetuned.py: evaluator for quality, format validity, latency, and prompt-echo.
- smoke_eval_report_v2.json: latest baseline report.

## Current baseline (smoke)
- request_success_rate: 100%
- non_empty_rate: 66.67%
- format_valid_rate: 0%
- avg_latency_ms: 13014.65

## Meaning
- Serving is stable.
- Model is still weak at strict task formatting.
- Structured outputs (quiz/flashcards JSON) are the biggest gap.

## Run commands
1. Start model API
   python app.py

2. Smoke evaluation
   python evaluate_finetuned.py --endpoint http://127.0.0.1:5001/generate --dataset benchmark_smoke.json --timeout 45 --save smoke_eval_report_v2.json

3. Full evaluation
   python evaluate_finetuned.py --endpoint http://127.0.0.1:5001/generate --dataset benchmark_prompts.json --timeout 45 --save full_eval_report.json

## Next training actions
1. Add 300-500 new instruction-response samples focused on strict output schemas.
2. Add at least 100 examples each for:
   - quiz JSON only
   - flashcards JSON only
   - short summary text only
3. Remove examples that produce code fences or markdown wrappers.
4. Add negative examples where prompt asks JSON and response must not include extra prose.

## Acceptance targets
- request_success_rate >= 95%
- non_empty_rate >= 95%
- format_valid_rate >= 85%
- avg_latency_ms <= 12000 on CPU, or <= 5000 on GPU

## Optional runtime hardening
- Keep backend fallback to Groq for invalid format.
- Add a JSON repair pass before fallback for quiz/flashcards.
- Add endpoint-level routing for summarize/quiz/flashcards to fine-tuned model with validation.
