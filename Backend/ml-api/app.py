from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import torch
import os

app = Flask(__name__)

# Paths
base_model = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
adapter_path = os.path.join(os.path.dirname(__file__), "fine-tuned-model")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(base_model)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# Load base model
model = AutoModelForCausalLM.from_pretrained(base_model)

# Load LoRA adapter
model = PeftModel.from_pretrained(model, adapter_path)

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
model.eval()

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    prompt = data["prompt"]

    inputs = tokenizer(prompt, return_tensors="pt").to(device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=60,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
        pad_token_id=tokenizer.pad_token_id,
        eos_token_id=tokenizer.eos_token_id,
    )

    # Primary decode: only newly generated tokens.
    input_len = inputs["input_ids"].shape[1]
    generated_tokens = outputs[0][input_len:]
    response = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()

    # Fallback decode: if model returns empty continuation, decode full output and strip prompt.
    if not response:
        full_text = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
        if full_text.startswith(prompt):
            response = full_text[len(prompt):].strip()
        else:
            response = full_text

    return jsonify({"response": response})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)