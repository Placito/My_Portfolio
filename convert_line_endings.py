import os

def convert_line_endings(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    content = content.replace('\r\n', '\n')
    with open(file_path, 'w') as file:
        file.write(content)

if __name__ == "__main__":
    file_path = "venv/bin/activate"
    convert_line_endings(file_path)
    print(f"Converted line endings in {file_path}")
