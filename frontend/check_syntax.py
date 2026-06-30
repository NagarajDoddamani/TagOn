import ast
import sys

def check_file_syntax(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        # Try to parse the file as Python
        ast.parse(content)
        print(f"✅ Syntax is valid for {filepath}")
        return True
    except SyntaxError as e:
        print(f"❌ Syntax error in {filepath}: {e}")
        return False

if __name__ == "__main__":
    filepath = sys.argv[1] if len(sys.argv) > 1 else "frontend/src/pages/public/LandingPage.jsx"
    check_file_syntax(filepath)