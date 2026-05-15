import tkinter as tk
from tkinter import filedialog, messagebox
from tkinter.scrolledtext import ScrolledText
import subprocess
import shutil
import os

# =========================
# SAFE INSERT FUNCTION
# =========================
def safe_insert(text):
    if text is None:
        text = ""
    try:
        output_box.insert(tk.END, str(text))
    except:
        output_box.insert(tk.END, "[Output error]\n")

# =========================
# SELECT IMAGE
# =========================
def select_image():
    path = filedialog.askopenfilename(
        filetypes=[("Image Files", "*.jpg *.png *.jpeg")]
    )
    if path:
        image_path.set(path)

# =========================
# RUN MODEL
# =========================
def run_model():

    if not image_path.get():
        messagebox.showerror("Error", "Please select an image")
        return

    try:
        output_box.delete(1.0, tk.END)
        output_box.insert(tk.END, "Running model...\n")

        # Ensure folder exists
        os.makedirs("test_images", exist_ok=True)

        # Clear old images
        for f in os.listdir("test_images"):
            os.remove(os.path.join("test_images", f))

        # Copy image
        dest_path = os.path.join("test_images", "input.jpg")
        shutil.copy(image_path.get(), dest_path)

        # Prepare inputs
        inputs = "\n".join([
            patient_id.get(),
            name.get(),
            age.get(),

            # Symptoms
            "y" if itching.get() else "n",
            "y" if pain.get() else "n",
            "y" if bleeding.get() else "n",
            "y" if oozing.get() else "n",

            # History
            duration.get(),
            "y" if growth.get() else "n",
            "y" if color_change.get() else "n",
            "y" if border_change.get() else "n",

            "n"
        ]) + "\n"

        # Run model
        result = subprocess.run(
            ["python", os.path.abspath("inference_segmentation.py")],
            input=inputs,
            text=True,
            capture_output=True,
            timeout=180
        )

        # Output display
        output_box.insert(tk.END, "\n===== OUTPUT =====\n")
        safe_insert(result.stdout)

        if result.stderr:
            output_box.insert(tk.END, "\n===== ERRORS =====\n")
            safe_insert(result.stderr)

        output_box.insert(tk.END, "\nDone.\n")

    except Exception as e:
        output_box.insert(tk.END, f"\nERROR: {str(e)}\n")

# =========================
# CLEAR OUTPUT
# =========================
def clear_output():
    output_box.delete(1.0, tk.END)

# =========================
# MAIN WINDOW
# =========================
root = tk.Tk()
root.title("AI Dermatology System")
root.geometry("1100x650")
root.configure(bg="#1e1e1e")

# =========================
# VARIABLES
# =========================
patient_id = tk.StringVar()
name = tk.StringVar()
age = tk.StringVar()
image_path = tk.StringVar()

itching = tk.BooleanVar()
pain = tk.BooleanVar()
bleeding = tk.BooleanVar()
oozing = tk.BooleanVar()

duration = tk.StringVar()
growth = tk.BooleanVar()
color_change = tk.BooleanVar()
border_change = tk.BooleanVar()

# =========================
# LEFT PANEL
# =========================
left = tk.Frame(root, bg="#2b2b2b", width=260)
left.pack(side=tk.LEFT, fill=tk.Y)

def lbl(text):
    return tk.Label(left, text=text, fg="white", bg="#2b2b2b", font=("Arial", 10, "bold"))

def ent(var):
    return tk.Entry(left, textvariable=var, width=25)

lbl("Patient ID").pack(pady=3)
ent(patient_id).pack()

lbl("Name").pack(pady=3)
ent(name).pack()

lbl("Age").pack(pady=3)
ent(age).pack()

# IMAGE
lbl("Select Image").pack(pady=5)
tk.Entry(left, textvariable=image_path, width=25).pack()
tk.Button(left, text="Browse", command=select_image).pack(pady=5)

# CHECKBOX FIX
def chk(text, var):
    return tk.Checkbutton(
        left,
        text=text,
        variable=var,
        bg="#2b2b2b",
        fg="white",
        selectcolor="#555555",
        activebackground="#2b2b2b"
    )

# SYMPTOMS
lbl("Symptoms").pack(pady=5)
chk("Itching", itching).pack(anchor="w")
chk("Pain", pain).pack(anchor="w")
chk("Bleeding", bleeding).pack(anchor="w")
chk("Oozing", oozing).pack(anchor="w")

# HISTORY
lbl("History").pack(pady=5)
ent(duration).pack()

chk("Growth", growth).pack(anchor="w")
chk("Color Change", color_change).pack(anchor="w")
chk("Border Change", border_change).pack(anchor="w")

# BUTTONS
tk.Button(left, text="Run Analysis", bg="#4CAF50", fg="white", command=run_model).pack(pady=10)
tk.Button(left, text="Clear Output", bg="#f44336", fg="white", command=clear_output).pack()

# =========================
# RIGHT PANEL
# =========================
right = tk.Frame(root, bg="#1e1e1e")
right.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

output_box = ScrolledText(
    right,
    bg="black",
    fg="lime",
    font=("Consolas", 10)
)
output_box.pack(fill=tk.BOTH, expand=True)

# =========================
# START UI
# =========================
root.mainloop()