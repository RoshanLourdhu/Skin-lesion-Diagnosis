import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from dataset import ISICDataset

# ===============================
# DEVICE CONFIGURATION
# ===============================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# ===============================
# DATASET PATHS (DO NOT CHANGE)
# ===============================
IMAGE_DIR = "../datasets/isic2018/images"
MASK_DIR = "../datasets/isic2018/masks"

# ===============================
# U-NET MODEL DEFINITION
# ===============================
class UNet(nn.Module):
    def __init__(self):
        super(UNet, self).__init__()

        def conv_block(in_c, out_c):
            return nn.Sequential(
                nn.Conv2d(in_c, out_c, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_c, out_c, kernel_size=3, padding=1),
                nn.ReLU(inplace=True)
            )

        self.enc1 = conv_block(3, 64)
        self.enc2 = conv_block(64, 128)
        self.enc3 = conv_block(128, 256)

        self.pool = nn.MaxPool2d(2)

        self.bottleneck = conv_block(256, 512)

        self.up3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.dec3 = conv_block(512, 256)

        self.up2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.dec2 = conv_block(256, 128)

        self.up1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.dec1 = conv_block(128, 64)

        self.final = nn.Conv2d(64, 1, kernel_size=1)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))

        b = self.bottleneck(self.pool(e3))

        d3 = self.up3(b)
        d3 = self.dec3(torch.cat([d3, e3], dim=1))

        d2 = self.up2(d3)
        d2 = self.dec2(torch.cat([d2, e2], dim=1))

        d1 = self.up1(d2)
        d1 = self.dec1(torch.cat([d1, e1], dim=1))

        return torch.sigmoid(self.final(d1))

# ===============================
# LOAD DATASET
# ===============================
dataset = ISICDataset(IMAGE_DIR, MASK_DIR)

# 🔥 IMPORTANT: LIMIT DATASET FOR FAST CPU TRAINING
dataset.images = dataset.images[:50]   # use only 50 images

train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

train_loader = DataLoader(
    train_dataset,
    batch_size=2,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=2,
    shuffle=False,
    num_workers=0
)

# ===============================
# MODEL, LOSS, OPTIMIZER
# ===============================
model = UNet().to(device)
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)

# 🔥 VERY IMPORTANT
epochs = 1

# ===============================
# TRAINING LOOP
# ===============================
print("Starting U-Net training...\n")

for epoch in range(epochs):
    model.train()
    epoch_loss = 0

    for batch_idx, (images, masks) in enumerate(train_loader):
        images = images.to(device)
        masks = masks.to(device)

        outputs = model(images)
        loss = criterion(outputs, masks)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        epoch_loss += loss.item()

        # ✅ SHOW PROGRESS
        print(
            f"Epoch [{epoch+1}/{epochs}] "
            f"Batch [{batch_idx+1}/{len(train_loader)}] "
            f"Loss: {loss.item():.4f}"
        )

    avg_loss = epoch_loss / len(train_loader)
    print(f"\n✅ Epoch {epoch+1} completed | Avg Loss: {avg_loss:.4f}\n")

# ===============================
# SAVE MODEL
# ===============================
os.makedirs("../models", exist_ok=True)
model_path = "../models/unet_model.pth"
torch.save(model.state_dict(), model_path)

print(f"🎉 Training completed successfully!")
print(f"📁 Model saved at: {model_path}")
