#!/usr/bin/env python3

import subprocess
import sys
from PIL import Image
from Xlib import display
import pyperclip
import tempfile
import os
import re

def create_rect_image(width=32, height=32, color=(0, 0, 0, 255)):
    # Create a solid-color rectangle
    img = Image.new("RGBA", (width, height), color)

    # Save to a temporary file
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    img.save(tmp.name, "PNG")
    return tmp.name

def send_notification(image_path, title="Notification", text="Here is your image"):
    subprocess.run([
        "notify-send",
        "-i", image_path,
        "-a", "Color Picker",
        "-n", "color-select-symbolic",
        title,
        text
    ])


def get_color(x, y):
    try:
        command = ["gdbus", "call", "--session", "--dest", "org.gnome.Shell.Screenshot", "--object-path", "/org/gnome/Shell/Screenshot", "--method", "org.gnome.Shell.Screenshot.PickColor"]
        process = subprocess.run(command, capture_output=True, check=True)
        matches = re.findall(rb"0\.[0-9]+", process.stdout)
        r, g, b = [round(float(val) * 255) for val in matches]
        return (r, g, b)

    except subprocess.CalledProcessError:
        print("Selection failed or was cancelled.", file=sys.stderr)
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        return None


def main():
    disp = display.Display()
    root = disp.screen().root
    pointer = root.query_pointer()
    rgb_color = get_color(pointer.root_x - 5, pointer.root_y - 5)

    if rgb_color:
        hex_color = '#{:02x}{:02x}{:02x}'.format(*rgb_color)
        pyperclip.copy(hex_color)

        img_path = create_rect_image(
            width=32,
            height=32,
            color=(rgb_color[0], rgb_color[1], rgb_color[2], 255)  # blue-ish
        )

        send_notification(img_path, hex_color, f"rgb{rgb_color}")
        os.remove(img_path)


if __name__ == "__main__":
    main()
