\# DermaVision AI - Verification Guide



\## Project Name



DermaVision AI: Intelligent Skin Lesion Analysis and Clinical Decision Support System



\---



\## Project Summary



DermaVision AI is an AI-powered dermatology platform developed for automated skin lesion analysis.



The system performs:



\- Skin lesion classification

\- Lesion segmentation

\- Explainable AI visualization (Grad-CAM)

\- 3D lesion surface visualization

\- Clinical metric extraction

\- Automated clinical report generation



The project is designed to assist in the analysis of dermoscopic skin lesion images and provide clinically interpretable outputs.



\---



\## Repository



GitHub Repository:



https://github.com/RoshanLourdhu/Skin-lesion-Diagnosis



\---



\## Deployment



Frontend Application:



https://skin-lesion-diagnosis-934l.vercel.app



Backend API:



https://dermavision-api-6nj9.onrender.com



\---



\## Verification Resources



All verification materials are available in the following folders:



\### Screenshots



Location:



verification/screenshots/



Contents:



\- Homepage

\- Patient Information Entry

\- Image Upload

\- Classification Result

\- Segmentation Output

\- Grad-CAM Visualization

\- 3D Lesion Visualization

\- Clinical Report



\### Demo Video



YouTube Demo:



https://youtu.be/gYZxwlwXAdg



The video demonstrates the complete workflow of the system from image upload to final report generation.



\### Sample Test Images



Location:



verification/sample\_test\_images/



These images can be used for verification and testing purposes.



\---



\## AI Components Implemented



\### 1. Skin Lesion Classification



Model:



\- MobileNet-based Convolutional Neural Network



Supported Classes:



1\. Melanocytic Nevus (nv)

2\. Melanoma (mel)

3\. Basal Cell Carcinoma (bcc)

4\. Benign Keratosis (bkl)

5\. Actinic Keratosis (akiec)

6\. Dermatofibroma (df)

7\. Vascular Lesion (vasc)



Output:



\- Predicted lesion class

\- Confidence score



\---



\### 2. Lesion Segmentation



Model:



\- U-Net



Output:



\- Lesion mask

\- Segmented lesion region



\---



\### 3. Explainable AI



Technique:



\- Grad-CAM



Output:



\- Attention heatmap

\- Visual explanation of model focus regions



\---



\### 4. Clinical Metric Extraction



Generated Metrics:



\- Lesion Area

\- Lesion Perimeter

\- Border Roughness Index

\- Lesion Coverage

\- Volume Estimation

\- Morphological Measurements



\---



\### 5. Clinical Report Generation



Generated Report Sections:



\- Patient Information

\- Primary Classification

\- Lesion Morphology Analysis

\- Segmentation Findings

\- Explainable AI Findings

\- Wolfram Clinical Intelligence

\- Risk Evaluation



\---



\## Recommended Verification Procedure



1\. Open the frontend application.



2\. Enter patient details.



3\. Upload a dermoscopic skin lesion image.



4\. Click "Run AI Analysis".



5\. Verify the generated outputs:



&#x20;  - Classification Result

&#x20;  - Confidence Score

&#x20;  - Segmentation Output

&#x20;  - Grad-CAM Visualization

&#x20;  - Clinical Metrics

&#x20;  - Clinical Report



\---



\## Technology Stack



Frontend:



\- React

\- TypeScript

\- Vite

\- Tailwind CSS



Backend:



\- FastAPI

\- Python



Machine Learning:



\- PyTorch

\- MobileNet

\- U-Net



Database:



\- SQLite



Additional Components:



\- Wolfram Language Integration

\- OpenCV

\- NumPy



\---



\## Note for Evaluators



The repository contains:



\- Complete source code

\- Trained model files

\- Deployment configuration

\- Verification screenshots

\- Sample test images

\- Demonstration video



These resources are provided to enable straightforward evaluation and verification of the project.



\---



\## Team

Shadow Fox

