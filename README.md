DermaVision AI: Explainable Skin Lesion Diagnosis and Risk Assessment Platform

Project Overview



DermaVision AI is an AI-powered skin lesion analysis platform that combines lesion segmentation, lesion classification, explainable AI, depth estimation, and clinical intelligence analytics to assist in the assessment of dermatological images.



The platform provides visual explanations of model decisions through Grad-CAM, quantitative lesion measurements, risk evaluation, and a comprehensive clinical report.



Problem Statement



Early identification of suspicious skin lesions is critical for timely clinical intervention. Traditional screening methods may require specialist expertise and can be difficult to access in certain regions.



DermaVision AI aims to provide an intelligent decision-support platform capable of:



Detecting lesion regions

Classifying skin lesions

Explaining AI decisions

Generating quantitative lesion analytics

Producing clinical assessment reports

Key Features

AI-Powered Lesion Segmentation

U-Net based lesion segmentation

Automatic lesion boundary extraction

Lesion coverage estimation

Skin Lesion Classification

MobileNetV2 classification model

Seven dermoscopic lesion categories

Explainable AI

Grad-CAM heatmap generation

Model attention visualization

Clinical focus validation

Depth Analysis

Relative lesion depth estimation

Morphological analysis

Clinical Intelligence Dashboard

Circularity analysis

Border asymmetry analysis

Fractal dimension analysis

Depth aspect ratio analysis

AI Clinical Report

Automated lesion assessment

Risk evaluation

Clinical insights generation

Dataset



HAM10000 Dataset



Supported Classes:



Melanoma (mel)

Melanocytic Nevus (nv)

Basal Cell Carcinoma (bcc)

Benign Keratosis (bkl)

Actinic Keratosis (akiec)

Dermatofibroma (df)

Vascular Lesions (vasc)

Technology Stack

Frontend

React

TypeScript

Tailwind CSS

Vite

Backend

FastAPI

Python

AI \& Machine Learning

PyTorch

U-Net

MobileNetV2

Grad-CAM

Analytics

Wolfram Language

Mathematical Clinical Intelligence Engine

System Architecture



Input Image

→ Segmentation (U-Net)

→ Classification (MobileNetV2)

→ Grad-CAM Explainability

→ Depth Estimation

→ Wolfram Clinical Intelligence

→ Clinical Report Generation



Installation

Backend

cd system\_training

pip install -r requirements.txt

python -m uvicorn api:app --host 127.0.0.1 --port 8000

Frontend

cd dermatology-ui

npm install

npm run dev

Usage

Upload a dermoscopic skin lesion image.

Enter patient information.

Select symptoms.

Click Run Analysis.

Review segmentation, Grad-CAM, analytics, and report.



Demo Link



To be updated after deployment.



Future Scope

Unknown lesion detection

Cloud-based inference

Mobile application

Dermatologist feedback integration

Clinical validation studies

License



This project is intended for academic, research, and demonstration purposes.

