import os
from PIL import Image
import torch
from torch.utils.data import Dataset
import torchvision.transforms as transforms

class ISICDataset(Dataset):
    def __init__(self, image_dir, mask_dir):
        self.image_dir = image_dir
        self.mask_dir = mask_dir
        self.images = os.listdir(image_dir)

        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor()
        ])

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_name = self.images[idx]

        image_path = os.path.join(self.image_dir, img_name)
        mask_name = img_name.replace(".jpg", "_segmentation.png")
        mask_path = os.path.join(self.mask_dir, mask_name)

        image = Image.open(image_path).convert("RGB")
        mask = Image.open(mask_path).convert("L")

        image = self.transform(image)
        mask = self.transform(mask)

        return image, mask
