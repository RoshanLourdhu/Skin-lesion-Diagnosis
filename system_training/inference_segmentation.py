import sys
sys.stdout.reconfigure(encoding='utf-8')

# rest of imports
import torch.nn.functional as F
from ollama_report import generate_medical_report
import os
import numpy as np
import torch
import cv2
import matplotlib.pyplot as plt
from PIL import Image
from torchvision import transforms
import plotly.graph_objects as go
from database import save_patient
from datetime import datetime

from train_unet import UNet
os.makedirs("outputs", exist_ok=True)
def run_pipeline():

    # -------------------------
    # CLASSIFICATION IMPORTS
    # -------------------------
    import torch.nn as nn
    from torchvision import models
    def yes_no_input(question):
        while True:
            ans = input(question + " (y/n): ").strip().lower()
            if ans in ['y', 'yes']:
                return True
            elif ans in ['n', 'no']:
                return False
            else:
                print("Please enter 'y' or 'n'")
    # -------------------------
    # DEVICE
    # -------------------------
    device = torch.device("cpu")

    # -------------------------
    # LOAD MODEL
    # -------------------------
    model = UNet().to(device)
    model.load_state_dict(torch.load("models/unet_model.pth", map_location=device), strict=False)
    model.eval()

    print(" Model loaded successfully")

    # -------------------------
    # LOAD CLASSIFICATION MODEL
    # -------------------------
    classifier = models.mobilenet_v2(weights=None)
    classifier.classifier[1] = nn.Linear(classifier.last_channel, 7)

    classifier.load_state_dict(torch.load("models/mobilenet_final.pth", map_location=device), strict=False)
    classifier.to(device)
    classifier.eval()
    # -------------------------
    # GRAD-CAM IMPLEMENTATION
    # -------------------------
    def generate_gradcam(model, input_tensor, target_class):
        gradients = []
        activations = []

        def backward_hook(module, grad_in, grad_out):
            gradients.append(grad_out[0])

        def forward_hook(module, input, output):
            activations.append(output)

        #  Correct layer (last conv layer)
        target_layer = model.features[-1]

        handle_f = target_layer.register_forward_hook(forward_hook)
        handle_b = target_layer.register_full_backward_hook(backward_hook)

        output = model(input_tensor)
        target_class = int(target_class)
        loss = output[0, target_class]

        model.zero_grad()
        loss.backward()

        #  Safe handling
        if not gradients or not activations:
            return np.zeros((input_tensor.shape[2], input_tensor.shape[3]))
    
        grads = gradients[0].detach()
        acts = activations[0].detach()

        weights = torch.mean(grads, dim=(2, 3), keepdim=True)
        cam = torch.sum(weights * acts, dim=1).squeeze()

        cam = F.relu(cam)

        # ✅ Safe normalization
        if cam.max() != cam.min():
            cam = (cam - cam.min()) / (cam.max() - cam.min())
        else:
            cam = np.zeros_like(cam)

        handle_f.remove()
        handle_b.remove()

        return cam.cpu().numpy()
    print(" Classification model loaded")
    # -------------------------
    # PREPROCESSING
    # -------------------------
    def preprocess_image(image):
        h, w = image.shape[:2]
        margin = int(min(h, w) * 0.1)
        image = image[margin:h-margin, margin:w-margin]

        image = cv2.resize(image, (256,256), interpolation=cv2.INTER_LINEAR)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l,a,b = cv2.split(lab)
        l = cv2.equalizeHist(l)
        image = cv2.merge((l,a,b))
        image = cv2.cvtColor(image, cv2.COLOR_LAB2BGR)

        image = cv2.GaussianBlur(image, (3,3), 0)

        return image

    # -------------------------
    # FALLBACK SEGMENTATION
    # -------------------------
    def fallback_segmentation(image_np):
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)

        # Otsu threshold
        _, thresh = cv2.threshold(
                gray, 0, 255,
            cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )

        kernel = np.ones((7,7), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        # remove noise
        thresh = cv2.medianBlur(thresh, 5)

        contours, _ = cv2.findContours(
            thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        mask = np.zeros_like(gray)

        if len(contours) > 0:
            largest = max(contours, key=cv2.contourArea)
            cv2.drawContours(mask, [largest], -1, 255, -1)

        return (mask > 0).astype(np.uint8)
    # -------------------------
    # PATIENT DETAILS INPUT
    # -------------------------
    patient_id = None
    name = None
    age = None
    if __name__ == "__main__":
        patient_id = input("Enter Patient ID: ")
        name = input("Enter Patient Name: ")
        age = int(input("Enter Patient Age: "))

        if age < 1 or age > 120:
            print("Invalid age entered")
            raise Exception("Process stopped")
    # -------------------------
    # CLINICAL SYMPTOMS INPUT
    # -------------------------
    if __name__ == "__main__":

        print("\n===== PATIENT SYMPTOMS =====")

        itching = yes_no_input("Is there itching?")
        pain = yes_no_input("Is there pain?")
        bleeding = yes_no_input("Any bleeding?")
        oozing = yes_no_input("Any fluid discharge (oozing)?")

        print("\n--- Lesion History ---")

        duration = input("How long has the lesion been present? (e.g., 2 weeks / 3 months): ")

        growth = yes_no_input("Has the lesion increased in size?")
        color_change = yes_no_input("Any change in color?")
        border_change = yes_no_input("Do the borders look irregular?")
    if patient_id is None:
        patient_id = "api_user"
        name = "api"
        age = 30

        itching = False
        pain = False
        bleeding = False
        oozing = False

        duration = "unknown"
        growth = False
        color_change = False
        border_change = False
    # -------------------------
    # LOAD IMAGE
    # -------------------------

    IMAGE_DIR = "test_images"

    files = [f for f in os.listdir(IMAGE_DIR)
             if f.lower().endswith((".jpg",".png",".jpeg"))]

    if not files:
        raise Exception(" No images found")

    # 👉 FIRST define image_path
    image_path = os.path.join(IMAGE_DIR, files[0])

    # 👉 THEN extract clean filename
    image_used = os.path.basename(image_path)

    # (optional print)
    print("Image:", image_used)

    # -------------------------
    # LOAD + PREPROCESS IMAGE (CORRECT PLACE)
    # -------------------------
    image_cv = cv2.imread(image_path)

    if image_cv is None:
        raise Exception("Failed to load image. Check file path or format.")

    image_cv = preprocess_image(image_cv)

    image = Image.fromarray(cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB))
    image_np = np.array(image)
    # -------------------------
    # IMAGE QUALITY CHECK
    # -------------------------

    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)

    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < 20:
        print(" Warning: Image may be blurry")

    brightness = np.mean(gray)
    if brightness < 40 or brightness > 220:
        print(" Warning: Poor lighting detected")
    # -------------------------
    # TRANSFORM
    # -------------------------
    transform = transforms.Compose([
        transforms.ToTensor()
    ])

    input_tensor = transform(Image.fromarray(image_np)).unsqueeze(0).to(device)

    # -------------------------
    # MODEL PREDICTION
    # -------------------------
    with torch.no_grad():
        output = model(input_tensor)

    mask = output.squeeze().cpu().numpy()

    # -------------------------
    # THRESHOLD
    # -------------------------
    # DEBUG (add this above threshold)

    # FIXED threshold
    print("Mask stats:", "min:", float(mask.min()), "max:", float(mask.max()), "mean:", float(mask.mean()))
    threshold = np.clip(np.mean(mask), 0.2, 0.6)
    mask = (mask > threshold).astype(np.uint8)

    mask = cv2.medianBlur(mask.astype(np.uint8), 5)
    # -------------------------
    # CLEAN MASK
    # -------------------------
    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    # fill holes
    mask_uint8 = (mask * 255).astype(np.uint8)
    h, w = mask_uint8.shape
    flood = mask_uint8.copy()
    temp = np.zeros((h+2, w+2), np.uint8)
    cv2.floodFill(flood, temp, (0,0), 255)
    flood_inv = cv2.bitwise_not(flood)
    mask = (mask_uint8 | flood_inv) // 255

    # keep largest region
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    
    if num_labels > 1:
        largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        mask = (labels == largest).astype("uint8")

    # -------------------------
    # VALIDATION + FALLBACK
    # -------------------------
    coverage = np.sum(mask) / mask.size
    print(f" Mask Coverage: {coverage:.2f}")
    # Segmentation quality
    if coverage < 0.2:
        seg_quality = "Low (small lesion)"
    elif coverage < 0.6:
        seg_quality = "Good"
    else:
        seg_quality = "Large lesion region"

    print(" Segmentation Quality:", seg_quality)

    if coverage > 0.85 or coverage < 0.01:
        print(" Model failed → Using fallback")

        mask = fallback_segmentation(image_np)

        coverage = np.sum(mask) / mask.size
        print(f" Fallback Coverage: {coverage:.2f}")

        if coverage > 0.85 or coverage < 0.01:
            print(" Segmentation failed completely")
            raise Exception("Segmentation failed completely")

    print(" Segmentation valid")
    # -------------------------
    # PREPARE INPUT FOR CLASSIFICATION
    # -------------------------
    coords = np.column_stack(np.where(mask > 0))

    if len(coords) == 0:
        raise Exception("No lesion found for classification")
    if np.sum(mask) == 0:
        print(" Mask empty → fallback")
        mask = fallback_segmentation(image_np)
    y_min, x_min = coords.min(axis=0)
    y_max, x_max = coords.max(axis=0)
    # Add padding for better context
    pad = 20

    y_min = max(0, y_min - pad)
    y_max = min(image_np.shape[0], y_max + pad)
    x_min = max(0, x_min - pad)
    x_max = min(image_np.shape[1], x_max + pad)
    cropped = image_np[y_min:y_max, x_min:x_max]

    if cropped.size == 0:
        raise Exception("Invalid crop for classification")
    cropped = cv2.resize(cropped, (224,224))

    cls_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3)
    ])
    cls_input = cls_transform(cropped).unsqueeze(0).to(device)
    # -------------------------
    # RUN CLASSIFICATION
    # -------------------------
    DEBUG = False
    with torch.no_grad():
        cls_output = classifier(cls_input)

    probs = torch.softmax(cls_output, dim=1)
    confidence, pred = torch.max(probs, 1)
    class_names = {
        0: "Actinic Keratoses (akiec)",
        1: "Basal Cell Carcinoma (bcc)",
        2: "Benign Keratosis (bkl)",
        3: "Dermatofibroma (df)",
        4: "Melanoma (mel)",
        5: "Melanocytic Nevus (nv)",
        6: "Vascular Lesion (vasc)"
    }
    if DEBUG:
        print("\n===== DEBUG: CLASS PROBABILITIES =====")
        for i, p in enumerate(probs[0]):
            print(f"{class_names[i]} : {float(p):.4f}")

    confidence_score = confidence.item()

    # Get top 2 predictions
    k = min(2, probs.shape[1])
    top2 = torch.topk(probs, k)
    idx1 = pred.item()

    top1_idx = top2.indices[0][0].item()
    top2_idx = top2.indices[0][1].item() if k > 1 else top1_idx

    top1_score = top2.values[0][0].item()
    top2_score = top2.values[0][1].item() if k > 1 else top1_score

    top1_label = class_names[top1_idx]
    top2_label = class_names[top2_idx]

    print("\n===== CLASSIFICATION =====")

    # Primary prediction
    primary = top1_label
    secondary = top2_label

    if abs(top1_score - top2_score) < 0.1:
        predicted_label = f"{primary} / {secondary}"
    else:
        predicted_label = primary
        confidence_score = top1_score

    print("Primary Diagnosis:", primary)

    # Show alternative ONLY if close
    if abs(top1_score - top2_score) < 0.2:
        print("Alternative Diagnosis:", secondary)
    # Confidence level (NOT raw %)
    if top1_score < 0.6:
        confidence_level = "LOW"
    elif top1_score < 0.8:
        confidence_level = "MODERATE"
    else:
        confidence_level = "HIGH"

    print("Model Confidence:", confidence_level)

    # -------------------------
    # GENERATE GRAD-CAM
    # -------------------------
    cam = generate_gradcam(classifier, cls_input, pred.item())

    # -------------------------
    # OVERLAY
    # -------------------------
    # -------------------------
    # CREATE COLORED MASK
    # -------------------------
    colored_mask = np.zeros_like(image_np)
    colored_mask[mask == 1] = [255, 0, 0]  # red mask
    overlay = cv2.addWeighted(image_np, 0.7, colored_mask, 0.3, 0)


    # SAVE
    cv2.imwrite("outputs/overlay.png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    # -------------------------
    # DISPLAY SEGMENTATION
    #-------------------------
    plt.figure(figsize=(12,4))
                    
    plt.subplot(1,3,1)
    plt.imshow(image_np)
    plt.title("Original Image")
    plt.axis("off")

    plt.subplot(1,3,2)
    plt.imshow(mask, cmap='gray')
    plt.title("Mask")
    plt.axis("off")

    plt.subplot(1,3,3)
    plt.imshow(overlay)
    plt.title("Overlay")
    plt.axis("off")


    plt.savefig("outputs/segmentation.png", bbox_inches='tight')
    plt.close()
    # -------------------------
    # GRAD-CAM VISUALIZATION
    # -------------------------
    cam_resized = cv2.resize(cam, (image_np.shape[1], image_np.shape[0]))
    heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)

    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    overlay_cam = cv2.addWeighted(image_np, 0.6, heatmap, 0.4, 0)
    cv2.imwrite("outputs/gradcam_overlay.png", cv2.cvtColor(overlay_cam, cv2.COLOR_RGB2BGR))
    plt.figure(figsize=(12,4))

    plt.subplot(1,3,1)
    plt.imshow(image_np)
    plt.title("Original Image")
    plt.axis("off")

    plt.subplot(1,3,2)
    plt.imshow(cam_resized, cmap='jet')
    plt.title("Grad-CAM Heatmap")
    plt.axis("off")

    plt.subplot(1,3,3)
    plt.imshow(overlay_cam)
    plt.title("Attention Overlay")
    plt.axis("off")

    plt.savefig("outputs/gradcam.png", bbox_inches='tight')
    plt.close()

    print(" Grad-CAM visualization generated")
    # -------------------------
    #DEPTH MAP
    # -------------------------
    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)

    if dist.max() == 0:
        raise Exception("Depth computation failed")

        # Normalize
        depth_raw = dist / dist.max()
    if dist.max() == 0:
        depth_raw = np.zeros_like(dist)
    else:
        depth_raw = dist / dist.max()

    depth = depth_raw.copy()
    depth = depth_raw.copy()
    # Save RAW grayscale (important)
    depth_raw_img = (depth_raw * 255).astype("uint8")
    cv2.imwrite("outputs/depth_raw.png", depth_raw_img)

    # -------------------------
    # ENHANCED DEPTH (for visualization)
        # -------------------------
    depth_vis = depth_raw.copy()

    # enhance visualization
    depth_vis = depth_vis ** 1.3
    depth_vis = cv2.GaussianBlur(depth_vis, (15, 15), 0)

    # convert to colormap
    depth_colored = cv2.applyColorMap(
        (depth_vis * 255).astype("uint8"),
        cv2.COLORMAP_INFERNO
    )

    cv2.imwrite("outputs/depth.png", depth_colored)

    print(" Depth estimation completed")
    # -------------------------
    # 3D STATIC (MATPLOTLIB)
    # -------------------------
    from mpl_toolkits.mplot3d import Axes3D

    h, w = depth.shape
    X, Y = np.meshgrid(np.arange(w), np.arange(h))

    fig = plt.figure(figsize=(8,6))
    ax = fig.add_subplot(111, projection='3d')

    surf = ax.plot_surface(X, Y, depth, cmap='inferno')

    ax.set_title("3D Lesion Surface (Static)")
    ax.set_xlabel("Width (pixels)")
    ax.set_ylabel("Height (pixels)")
    ax.set_zlabel("Depth")

    fig.colorbar(surf, ax=ax, shrink=0.5, label="Depth")

    plt.savefig("outputs/3d_surface.png", bbox_inches='tight')
    plt.close()

    print(" Static 3D visualization done")

    # -------------------------
    # 3D INTERACTIVE PLOT (FIXED)
    # -------------------------
    h, w = depth.shape

    fig = go.Figure(data=[go.Surface(
        z=depth,
        x=np.arange(w),
        y=np.arange(h),
        colorscale='Inferno',
        colorbar=dict(title="Depth"),

        # ✅ FIXED HOVER TEXT
        hovertemplate=
        "Width: %{x}<br>" +
        "Height: %{y}<br>" +
        "Depth: %{z:.3f}<extra></extra>"
    )])

    # -------------------------
    # LAYOUT FIX (AXIS + SIZE)
    # -------------------------
    fig.update_layout(
        title="3D Lesion Surface (Interactive)",

        scene=dict(
            xaxis=dict(
                title="Width (pixels)",
                showgrid=True,
                zeroline=False,
            ),
            yaxis=dict(
                title="Height (pixels)",
                showgrid=True,
                zeroline=False,
            ),
            zaxis=dict(
                title="Depth",
                showgrid=True,
            ),
        ),

        # ✅     IMPORTANT: SIZE FIX
        width=900,
        height=600,

        margin=dict(l=0, r=0, b=0, t=40)
    )

    # -------------------------
    # SAVE
    # -------------------------
    fig.write_html("outputs/3d_interactive.html")

    print("3D interactive visualization saved")
    #-------------------------
        # CROSS-SECTION GRAPH
    # -------------------------
    mid_row = depth.shape[0] // 2
    profile = depth[mid_row, :]

    plt.figure(figsize=(6,4))
    plt.plot(profile, linewidth=2)
    plt.title("Depth Profile (Center Cross-section)")
    plt.xlabel("Width (pixels)")
    plt.ylabel("Depth")
    plt.grid(True)
    plt.savefig("outputs/profile.png", bbox_inches='tight')
    plt.close()
    volume = np.sum(depth)
    # -------------------------
    # METRICS
    # -------------------------
    area = np.sum(mask)
    relative_area = (area / (256 * 256)) * 100
    edges= cv2.Canny(mask.astype(np.uint8)*255, 100, 200)
    perimeter = np.sum(edges > 0)

    lesion_pixels = depth[mask == 1]

    if lesion_pixels.size == 0:
        roughness = 0.0
        mean_depth = 0.0
    else:
        roughness = float(np.std(lesion_pixels))
        mean_depth = float(np.mean(lesion_pixels))

    max_depth = np.max(depth)

    # Depth interpretation
    if max_depth > 0.8:
        depth_note = "Deep lesion structure"
    elif max_depth > 0.5:
        depth_note = "Moderate depth variation"
    else:
        depth_note = "Superficial lesion"
    mean_depth = np.mean(depth[mask == 1])


    # -------------------------
    # METRICS (STRUCTURED)
        # -------------------------
    metrics = {
        "area_px": int(area),
        "relative_area_pct": float(relative_area),
        "perimeter_px": int(perimeter),
        "roughness": float(roughness),
    "volume": float(volume),
        "max_depth": float(max_depth),
        "mean_depth": float(mean_depth),
        "depth_note": str(depth_note)
    }
    # -------------------------
    # RISK LEVEL (CORRECT PLACE)
    # -------------------------
    risk_score = 0

    if confidence_score < 0.75:
        risk_score += 1

    if roughness > 0.25:
        risk_score += 1

    if max_depth > 0.85:
        risk_score += 1

    if perimeter / (area + 1) > 0.05:
        risk_score += 1

    if risk_score >= 3:
        risk = "HIGH"
    elif risk_score == 2:
        risk = "MODERATE"
    else:
        risk = "LOW"
    # -------------------------
    # ACTION RECOMMENDATION
    # -------------------------
    if risk == "HIGH":
        action = "Urgent dermatological consultation required"
    elif risk == "MODERATE":
        action = "Clinical evaluation recommended"
    else:
        action = "Monitor lesion for changes"

    print("Risk Level:", risk)
    # -------------------------
    # CLINICAL ALERTS
    # -------------------------
    alerts = []
    alerts = [str(a) for a in alerts]

    if roughness > 0.3:
        alerts.append("Irregular surface detected")

    if perimeter / (area + 1) > 0.06:
        alerts.append("Irregular boundary")

    if max_depth > 0.9:
        alerts.append("High depth variation")

    required_files = [
        "outputs/segmentation.png",
        "outputs/gradcam.png",
        "outputs/depth.png",
    "outputs/3d_interactive.html"
    ]

    for f in required_files:
        if not os.path.exists(f):
            print(f"WARNING: Missing file -> {f}")
    # -------------------------
    # FINAL OUTPUT
    #-------------------------
    result = {
        "Area": int(area),
        "Perimeter": int(perimeter),
        "Roughness": round(float(roughness),4),
        "Volume": round(float(volume),2),
        "Max_Depth": round(float(max_depth),4),
        "Mean_Depth": round(float(mean_depth),4),
        "Class": predicted_label,
        "Confidence": round(float(confidence_score),4),
        "Confidence_Level": confidence_level,
        "Risk": risk,
        "Action": action
    }
    ("\n===== FINAL OUTPUT =====")
    ("Area:", area)
    print("Relative Area (%):", round(relative_area, 2))
    print("Perimeter:", perimeter)
    print("Roughness:", round(float(roughness), 4))
    print("Volume:", round(float(volume), 2))
    print("Max Depth:", round(float(max_depth), 4))
    print("Mean Depth:", round(float(mean_depth), 4))
    print("Depth Interpretation:", depth_note)
    print("Class:", predicted_label)
    print("Confidence Score:", round(confidence_score, 4))
    # Confidence calibration

    print("Confidence Level:", confidence_level)
    print("Risk:", risk)
    print("\n===== CLINICAL SUMMARY =====")

    print(f"Diagnosis: {predicted_label}")
    print(f"Confidence Level: {confidence_level}")
    print(f"Risk Level: {risk}")
    print(f"Recommended Action: {action}")

    if alerts:
        print(" Alerts:", ", ".join(alerts))
    # -------------------------
    # OLLAMA REPORT
    # -------------------------
    print("\n===== AI MEDICAL REPORT =====")
    # -------------------------
    # PREPARE STRUCTURED INPUT FOR AI REPORT
    # -------------------------
    report_input = {
        "class": predicted_label,
        "confidence": confidence_level,
        "risk": risk,
        "area": area,
        "perimeter": perimeter,
        "roughness": float(roughness),
        "max_depth": float(max_depth),
            "mean_depth": float(mean_depth),
        "alerts": alerts,
        "action": action,

        # 👇 NEW BLOCK
        "symptoms": {
               "itching": itching,
            "pain": pain,
            "bleeding": bleeding,
            "oozing": oozing
        },
        "history": {
            "duration": duration,
               "growth": growth,
            "color_change": color_change,
            "border_change": border_change
        }
    }
    # -------------------------
    # STRUCTURED OUTPUT FOR API (FAST RESPONSE)
        # -------------------------
    import json

    # -------------------------
    # GENERATE REPORT (CAN BE SLOW)
    # -------------------------
    try:
        report = generate_medical_report(report_input)
    except Exception as e:
        report = f"Report generation failed: {str(e)}"

    #-------------------------
    # FINAL OUTPUT (ONLY JSON)
    # -------------------------
    def convert_numpy(obj):
        import numpy as np
        if isinstance(obj, (np.integer)):
            return int(obj)
        elif isinstance(obj, (np.floating)):
            return float(obj)
        elif isinstance(obj, (np.ndarray)):
            return obj.tolist()
        return obj


    final_output = {
        "metrics": {
            "area_px": int(area),
            "relative_area_pct": float(relative_area),
            "perimeter_px": int(perimeter),
            "roughness": float(roughness),
            "volume": float(volume),
            "max_depth": float(max_depth),
            "mean_depth": float(mean_depth)
        },
        "classification": {
            "label": str(predicted_label),
            "confidence": float(confidence_score),
            "risk": str(risk)
        },
        "alerts": [str(a) for a in alerts],

        # 🔥 REQUIRED FOR REPORT
        "report_input": {
            "patient_id": patient_id,
            "class": predicted_label,
            "confidence": float(confidence_score),
            "risk": risk,
            "area": float(area),
            "perimeter": float(perimeter),
            "roughness": float(roughness),
            "max_depth": float(max_depth),
            "mean_depth": float(mean_depth),
            "alerts": [str(a) for a in alerts],
            "action": action
        }
    }

    # 🔥 ONLY THIS PRINT MUST BE LAST STRUCTURED OUTPUT
    print(json.dumps(final_output, default=convert_numpy))
    sys.stdout.flush()  

if __name__ == "__main__":
    run_pipeline()  