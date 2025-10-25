import os
import argparse

def should_ignore(path, ignore_patterns):
    """Check if path should be ignored"""
    for pattern in ignore_patterns:
        if pattern in path:
            return True
    return False

def print_directory_structure(startpath, ignore_patterns, max_depth=None):
    """Print clean directory structure"""
    for root, dirs, files in os.walk(startpath):
        # Remove ignored directories
        dirs[:] = [d for d in dirs if not should_ignore(os.path.join(root, d), ignore_patterns)]

        level = root.replace(startpath, '').count(os.sep)
        if max_depth and level > max_depth:
            continue

        indent = ' ' * 2 * level
        print(f"{indent}{os.path.basename(root)}/")

        subindent = ' ' * 2 * (level + 1)
        for file in files:
            if not should_ignore(os.path.join(root, file), ignore_patterns):
                print(f"{subindent}{file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate clean project structure')
    parser.add_argument('--path', default='.', help='Project path (default: current directory)')
    parser.add_argument('--depth', type=int, help='Maximum depth to display')

    args = parser.parse_args()

    ignore_patterns = [
        '__pycache__',
        'node_modules',
        '.git',
        'dist',
        'build',
        '.pytest_cache',
        '.mypy_cache',
        '.vscode',
        '.idea',
        'venv',
        '.venv',
        'env',
        '.env'
    ]

    print(f"Project Structure: {os.path.abspath(args.path)}")
    print("=" * 50)
    print_directory_structure(args.path, ignore_patterns, args.depth)
