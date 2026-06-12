import requests
import time
import subprocess
import shutil
import os

# -------------------------
# HELPER FUNCTIONS
# -------------------------
def bool_to_text(value):
    return "Yes" if value else "No"


def check_ollama_running():
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        return r.status_code == 200
    except:
        return False


def start_ollama():
    ollama_path = shutil.which("ollama")
    if not ollama_path:
        default_path = os.path.expandvars(r"%LOCALAPPDATA%\Programs\Ollama\ollama.exe")
        if os.path.exists(default_path):
            ollama_path = default_path
        else:
            ollama_path = "ollama"
            
    try:
        # Launch ollama serve in background
        creation_flags = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        subprocess.Popen(
            [ollama_path, "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags
        )
        return True
    except Exception as e:
        print(f"Error spawning Ollama process: {e}")
        return False


def check_model_available(model_name="llama3"):
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        if r.status_code == 200:
            models = r.json().get("models", [])
            for m in models:
                name = m.get("name", "")
                if model_name in name:
                    return True
        return False
    except:
        return False


def generate_fallback_report(data):
    # Retrieve details
    label = data.get('class', 'N/A')
    confidence = data.get('confidence', 'N/A')
    # If confidence is float, format it
    if isinstance(confidence, float):
        confidence_level = "HIGH" if confidence >= 0.8 else "MODERATE" if confidence >= 0.6 else "LOW"
        confidence_str = f"{confidence * 100:.1f}% ({confidence_level})"
    else:
        confidence_str = str(confidence)

    risk = data.get('risk', 'N/A')
    area = data.get('area', 0.0)
    perimeter = data.get('perimeter', 0.0)
    roughness = data.get('roughness', 0.0)
    max_depth = data.get('max_depth', 0.0)
    mean_depth = data.get('mean_depth', 0.0)
    
    itching = "Yes" if data.get('symptoms', {}).get('itching') else "No"
    pain = "Yes" if data.get('symptoms', {}).get('pain') else "No"
    bleeding = "Yes" if data.get('symptoms', {}).get('bleeding') else "No"
    oozing = "Yes" if data.get('symptoms', {}).get('oozing') else "No"
    
    duration = data.get('history', {}).get('duration', 'unknown')
    growth = "Yes" if data.get('history', {}).get('growth') else "No"
    color_change = "Yes" if data.get('history', {}).get('color_change') else "No"
    border_change = "Yes" if data.get('history', {}).get('border_change') else "No"
    
    alerts = ", ".join(data.get('alerts', [])) if data.get('alerts') else "None"
    action = data.get('action', 'Clinical evaluation recommended')

    report = f"""----------------------------------------
AI DERMATOLOGY CLINICAL REPORT (FALLBACK)
----------------------------------------

Patient Analysis Summary:
- Primary Classification: {label}
- Confidence Level: {confidence_str}
- Clinical Risk Assessment: {risk}

Morphological Assessment:
- Calculated Area: {area:.4f} pixels
- Boundary Perimeter: {perimeter:.4f} pixels
- Surface Roughness Index: {roughness:.4f}
- Maximum Calculated Lesion Depth: {max_depth:.4f} mm equivalent
- Mean Calculated Lesion Depth: {mean_depth:.4f} mm equivalent

Patient Symptoms:
- Itching reported: {itching}
- Pain reported: {pain}
- Bleeding reported: {bleeding}
- Oozing reported: {oozing}

Lesion History:
- Estimated Duration: {duration}
- Observed growth or expansion: {growth}
- Documented color changes: {color_change}
- Documented border irregularity: {border_change}

Clinical Interpretation:
The morphometric profile reveals a lesion with an area of {area:.4f} pixels and surface roughness of {roughness:.4f}. A maximum depth of {max_depth:.4f} mm indicates {"significant" if max_depth > 0.85 else "moderate"} structural thickness. Border irregularity is {"present" if border_change == 'Yes' else "absent"}, and recent changes in growth are {"present" if growth == 'Yes' else "absent"}. 
Clinical concern is {"increased" if (risk in ["MODERATE", "HIGH"] or growth == 'Yes' or color_change == 'Yes') else "low to moderate"} based on the combined morphometric metrics, patient symptoms, and history.

Risk Assessment:
- Categorized Risk: {risk}
The lesion presents a {risk} risk profile. This is supported by a classification confidence level of {confidence_str} and a structural thickness/depth assessment of {mean_depth:.4f} mm. Immediate clinical correlation is advised for validation.

Recommendation:
- Action Plan: {action}
- Suggested follow-up: periodic photographic monitoring and dermatologist consultation.

Disclaimer:
This report is generated via an automated fallback analysis pipeline. It is intended solely for decision support and does not constitute a formal medical diagnosis. A professional clinical biopsy and evaluation remain the gold standard.
----------------------------------------"""
    return report


# -------------------------
# MAIN FUNCTION
# -------------------------
def generate_medical_report(data):
    model_name = "llama3"
    
    # 1. Check if Ollama is running
    is_running = check_ollama_running()
    if is_running:
        print("Ollama running")
    else:
        print("Ollama not running. Starting Ollama...")
        started = start_ollama()
        if started:
            # Poll port 11434 until available or timed out (15 seconds)
            start_time = time.time()
            port_ready = False
            while time.time() - start_time < 15:
                if check_ollama_running():
                    port_ready = True
                    break
                time.sleep(1)
            
            if port_ready:
                print("Ollama started")
            else:
                print("[ERROR] Ollama failed to start after 15 seconds")
                return generate_fallback_report(data)
        else:
            print("[ERROR] Failed to launch Ollama executable")
            return generate_fallback_report(data)

    # 2. Verify model availability
    model_ok = check_model_available(model_name)
    if model_ok:
        print("Model loaded")
    else:
        print(f"[ERROR] Required model '{model_name}' is missing from Ollama")
        return generate_fallback_report(data)

    # 3. Generate report
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

    print("Report generation started")
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 300
                }
            },
            timeout=30
        )

        if response.status_code == 200:
            print("Report generation completed")
            return response.json()["response"].strip()
        else:
            print(f"[ERROR] Ollama API returned status code {response.status_code}")
            return generate_fallback_report(data)

    except Exception as e:
        print(f"[ERROR] Connection to Ollama failed or timed out: {e}")
        return generate_fallback_report(data)