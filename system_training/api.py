from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import init_db, save_patient, update_report
from datetime import datetime
import os
import shutil
import subprocess
import json
import re
import threading

from ollama_report import generate_medical_report

# -------------------------
# INIT
# -------------------------
init_db()
app = FastAPI()

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# PATHS
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "test_images")
OUT_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=OUT_DIR), name="static")

REPORT_FILE = os.path.join(OUT_DIR, "report.txt")

# -------------------------
# CLEAN
# -------------------------
def clear_dir(folder):
    for f in os.listdir(folder):
        try:
            os.remove(os.path.join(folder, f))
        except:
            pass

# -------------------------
# JSON PARSER
# -------------------------
def extract_json(stdout):
    try:
        matches = re.findall(r"\{.*?\}", stdout, re.DOTALL)
        for m in reversed(matches):
            try:
                return json.loads(m)
            except:
                continue
    except Exception as e:
        print("JSON parse error:", e)
    return {}

# -------------------------
# BACKGROUND REPORT
# -------------------------
def generate_report_async(report_input):
    try:
        report = generate_medical_report(report_input)

        with open(REPORT_FILE, "w", encoding="utf-8") as f:
            f.write(report)

        update_report(report_input.get("patient_id"), report)

    except Exception as e:
        error_msg = f"LLM Error: {str(e)}"

        with open(REPORT_FILE, "w", encoding="utf-8") as f:
            f.write(error_msg)

        update_report(report_input.get("patient_id"), error_msg)

# -------------------------
# MAIN API
# -------------------------
@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    patient_id: str = Form("1"),
    name: str = Form("test"),
    age: str = Form("25"),
    itching: str = Form("n"),
    pain: str = Form("n"),
    bleeding: str = Form("n"),
    oozing: str = Form("n"),
    duration: str = Form("1 month"),
    growth: str = Form("n"),
    color_change: str = Form("n"),
    border_change: str = Form("n"),
):
    try:
        clear_dir(IMG_DIR)

        if os.path.exists(REPORT_FILE):
            os.remove(REPORT_FILE)

        # Save input image
        img_path = os.path.join(IMG_DIR, "input.jpg")
        with open(img_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # CLI input
        cli_input = "\n".join([
            patient_id, name, age,
            itching, pain, bleeding, oozing,
            duration, growth, color_change, border_change,
            "n"
        ]) + "\n"

        print("Running inference...")

        # Run inference
        proc = subprocess.Popen(
            ["python", os.path.join(BASE_DIR, "inference_segmentation.py")],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        stdout, stderr = proc.communicate(input=cli_input)

        print("RAW STDOUT:\n", stdout)

        if stderr:
            print("INFERENCE ERROR:", stderr)

        parsed = extract_json(stdout)

        print("PARSED JSON:", parsed)

        # Fail-safe
        if not parsed:
            return {
                "error": "Inference JSON parsing failed",
                "raw": stdout[-500:]
            }

        classification = parsed.get("classification", {})
        metrics = parsed.get("metrics", {})
        alerts = parsed.get("alerts", [])
        report_input = parsed.get("report_input", {})

        # Save patient
        save_patient({
            "patient_id": patient_id,
            "name": name,
            "age": age,
            "image_path": img_path,
            "area": metrics.get("area_px"),
            "perimeter": metrics.get("perimeter_px"),
            "roughness": metrics.get("roughness"),
            "volume": metrics.get("volume"),
            "max_depth": metrics.get("max_depth"),
            "mean_depth": metrics.get("mean_depth"),
            "classification": classification.get("label"),
            "confidence": classification.get("confidence"),
            "risk": classification.get("risk"),
            "report": "PENDING",
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

        # Start report thread
        if report_input:
            threading.Thread(
                target=generate_report_async,
                args=(report_input,),
                daemon=True
            ).start()

        return {
            "classification": {
                "label": classification.get("label", "N/A"),
                "confidence": classification.get("confidence", 0),
                "risk": classification.get("risk", "N/A"),
            },
            "metrics": metrics,
            "alerts": alerts,
            "report_status": "processing",
            "images": {
                "segmentation": "/static/segmentation.png",
                "gradcam": "/static/gradcam.png",
                "attention": "/static/attention.png",
                "depth": "/static/depth.png",
                "depth_gray": "/static/depth_raw.png",
                "profile": "/static/profile.png",
                "three_d": "/static/3d_interactive.html"
            }
        }

    except Exception as e:
        print("API ERROR:", e)
        return {"error": str(e)}

# -------------------------
# REPORT FETCH
# -------------------------
@app.get("/report")
def get_report():
    try:
        if not os.path.exists(REPORT_FILE):
            return {"status": "processing", "report": ""}

        with open(REPORT_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        if content.strip() == "":
            return {"status": "processing", "report": ""}

        if "LLM Error" in content:
            return {"status": "error", "report": content}

        return {"status": "ready", "report": content}

    except Exception as e:
        return {"status": "error", "report": str(e)}

# -------------------------
# HISTORY
# -------------------------
@app.get("/history/{patient_id}")
def get_history(patient_id: str):
    from database import get_patient_history
    data = get_patient_history(patient_id)
    return {"history": data}