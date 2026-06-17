# DermaVision AI: Explainable Skin Lesion Diagnosis and Risk Assessment Platform

## Overview

DermaVision AI is an advanced AI-powered dermatology platform designed to assist in early skin lesion assessment through explainable artificial intelligence, lesion segmentation, classification, depth estimation, 3D visualization, and automated clinical reporting.

The platform combines computer vision, deep learning, explainable AI, mathematical risk assessment, and interactive visualization to provide clinicians and researchers with comprehensive lesion analysis.

---

## Live Demo

### Frontend (Vercel)

https://skin-lesion-diagnosis-eight.vercel.app/

### Backend (Google Cloud Run)

https://dermavision-backend-530379106718.us-central1.run.app

---

## Key Features

* Automated skin lesion segmentation using U-Net
* Skin lesion classification using MobileNet
* Grad-CAM explainability visualization
* Lesion depth estimation
* 3D lesion surface reconstruction
* Morphological feature extraction
* Risk assessment and severity scoring
* Wolfram Clinical Intelligence integration
* Automated clinical report generation
* Patient history management
* Interactive web dashboard

---

## System Architecture

![Architecture](README_Assets/architecture.png)

---

## Workflow

1. Patient uploads a dermoscopic image.
2. Image preprocessing is performed.
3. U-Net extracts the lesion region.
4. Morphological lesion metrics are calculated.
5. MobileNet predicts lesion class.
6. Grad-CAM highlights important diagnostic regions.
7. Depth estimation generates lesion thickness information.
8. 3D reconstruction visualizes lesion topology.
9. Risk assessment engine computes severity indicators.
10. Wolfram Clinical Intelligence performs mathematical analysis.
11. Clinical report is generated automatically.
12. Results are displayed in the dashboard.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* FastAPI
* Python

### Deep Learning

* PyTorch
* MobileNet
* U-Net

### Computer Vision

* OpenCV
* Scikit-Image
* NumPy
* SciPy

### Visualization

* Plotly
* Matplotlib

### Deployment

* Vercel
* Google Cloud Run

---

## Dataset

The project utilizes publicly available dermatology datasets:

* HAM10000 Dataset
* ISIC 2018 Skin Lesion Dataset

---

## Results

### Dashboard

![Dashboard](README_Assets/dashboard.png)

### Analysis Interface

![Analysis](README_Assets/analysis.png)

### Segmentation Result

![Segmentation](README_Assets/segmentation.png)

### Grad-CAM Explainability

![GradCAM](README_Assets/gradcam.png)

### Depth Estimation

![DepthMap](README_Assets/depthmap.png)

### 3D Lesion Reconstruction

![3D Surface](README_Assets/surface3d.png)

### Wolfram Clinical Intelligence

![Wolfram](README_Assets/wolfram.png)

### Automated Clinical Report

![Report](README_Assets/report.png)

---

## Clinical Metrics Generated

* Lesion Area
* Relative Area Percentage
* Perimeter
* Border Roughness
* Volume Estimation
* Mean Depth
* Maximum Depth
* Risk Index
* Severity Score
* Mathematical Lesion Analysis

---

## Explainable AI Components

The platform incorporates multiple explainability modules:

* Grad-CAM heatmap visualization
* Lesion boundary extraction
* Morphological analysis
* Risk scoring transparency
* Clinical interpretation support

---

## Team

* Roshan L
* Navya S
* Sanjay
* Sam Roshan

---

## Future Enhancements

* Multi-class clinical decision support
* Temporal lesion progression tracking
* Mobile application deployment
* Integration with Electronic Health Records (EHR)
* Dermatologist feedback loop learning
  

---

## License

MIT License
