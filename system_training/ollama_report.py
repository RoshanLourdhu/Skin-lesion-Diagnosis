import requests

# -------------------------
# HELPER FUNCTION
# -------------------------
def bool_to_text(value):
    return "Yes" if value else "No"

# -------------------------
# MAIN FUNCTION
# -------------------------
def generate_medical_report(data):

    prompt = f"""
You are an AI dermatology assistant generating a structured clinical report.

----------------------------------------
INPUT DATA
----------------------------------------

Classification: {data['class']}
Confidence Level: {data['confidence']}
Risk Level: {data['risk']}

Morphology:
- Area: {data['area']}
- Perimeter: {data['perimeter']}
- Roughness: {data['roughness']}

Depth:
- Max Depth: {data['max_depth']}
- Mean Depth: {data['mean_depth']}

Patient Symptoms:
- Itching: {bool_to_text(data['symptoms']['itching'])}
- Pain: {bool_to_text(data['symptoms']['pain'])}
- Bleeding: {bool_to_text(data['symptoms']['bleeding'])}
- Oozing: {bool_to_text(data['symptoms']['oozing'])}

Lesion History:
- Duration: {data['history']['duration']}
- Growth: {bool_to_text(data['history']['growth'])}
- Color Change: {bool_to_text(data['history']['color_change'])}
- Border Irregularity: {bool_to_text(data['history']['border_change'])}

Alerts: {data['alerts']}
Recommended Action: {data['action']}

----------------------------------------
OUTPUT FORMAT (STRICT)
----------------------------------------

----------------------------------------
AI DERMATOLOGY REPORT
----------------------------------------

Patient Analysis Summary:
Include:
- primary classification
- alternative diagnosis (ONLY if clearly present)
- confidence level

Morphological Assessment:
- Area
- Perimeter
- Roughness
- Depth (Max and Mean)

Patient Symptoms:
List key symptoms briefly.

Lesion History:
Summarize duration and changes.

Clinical Interpretation:
- Combine morphology + depth + symptoms + history
- Highlight:
  • color change
  • irregular borders
  • growth
  • depth variation
- Explain what increases concern

Risk Assessment:
- State risk level
- Justify using:
  • confidence
  • depth
  • morphology
  • history

Recommendation:
Provide clear action:
- Monitor / Clinical evaluation / Urgent consultation

Disclaimer:
AI-assisted analysis; clinical evaluation advised.

----------------------------------------

IMPORTANT RULES:
- DO NOT include introductory lines like "Here is the report"
- Round all numerical values to 4 decimal places
- If alternative class exists, explicitly name it
- Avoid vague alternatives like "another lesion"
- Summarize symptoms including both present and absent findings
- Clearly explain which features increase clinical concern
- Do NOT add extra text outside format
- Do NOT be conversational
- Do NOT make definitive diagnosis
- Use phrases like:
  "appears consistent with"
  "suggests"
  "may indicate"

- If confidence is LOW:
  → clearly express uncertainty

- If multiple classes exist:
  → include both

- If no strong second class:
  → do NOT invent alternatives

- If risk is MODERATE or HIGH:
  → do NOT bias toward benign interpretation

- High depth (>0.85):
  → treat as significant structural variation

- Use symptoms + history to influence interpretation:
  - color change
  - border irregularity
  - growth
  - duration

- Keep report concise and clinically meaningful
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 300
                }
            }
        )

        if response.status_code == 200:
            return response.json()["response"].strip()
        else:
            return f"⚠️ Ollama API error: {response.status_code}"

    except Exception as e:
        return f"⚠️ Ollama connection error: {str(e)}"