#!/usr/bin/env python3
import ast
import sys

def check_jsx_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Try to parse as JavaScript-like syntax (for React/JSX)
        # We'll use ast.parse and ignore import errors
        try:
            parsed = ast.parse(content, filename=filepath)
            print(f"✅ File {filepath} has valid syntax")
            
            # Check for specific function definitions
            functions = [node for node in ast.walk(parsed) if isinstance(node, ast.FunctionDef)]
            print(f"Found {len(functions)} function definitions")
            
            # Check for the LandingPage component
            landing_page_funcs = [f for f in functions if f.name == 'LandingPage']
            if landing_page_funcs:
                print(f"✅ LandingPage component found")
            else:
                print("❌ LandingPage component not found")
                
            return True
        except SyntaxError as e:
            print(f"❌ Syntax error in {filepath}: {e}")
            print(f"   Line {e.lineno}: {e.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error reading {filepath}: {e}")
        return False

if __name__ == "__main__":
    filepath = sys.argv[1] if len(sys.argv) > 1 else "frontend/src/pages/public/LandingPage.jsx"
    print(f"Checking {filepath}...")
    if check_jsx_file(filepath):
        print("\n✅ File syntax is valid")
    else:
        print("\n❌ File has syntax errors")