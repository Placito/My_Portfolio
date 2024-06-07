import os
from css_html_js_minify import css_minify

def minify_css(input_path, output_path):
    with open(input_path, 'r') as file:
        css_content = file.read()
    
    minified_css = css_minify(css_content)
    
    with open(output_path, 'w') as file:
        file.write(minified_css)

if __name__ == "__main__":
    input_css_path = os.path.join('static', 'style.css')
    output_css_path = os.path.join('static', 'style.min.css')
    minify_css(input_css_path, output_css_path)
