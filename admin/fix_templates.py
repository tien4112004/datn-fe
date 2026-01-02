#!/usr/bin/env python3
import re

def fix_template_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    output_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Check if this is a "config: {" line
        config_match = re.match(r'^(\s+)config:\s*\{\s*$', line)

        if config_match:
            config_indent = config_match.group(1)
            indent_len = len(config_indent)

            # Skip this line (don't add it to output)
            i += 1

            # Now process lines until we find the matching closing brace
            brace_depth = 1  # We've seen one opening brace

            while i < len(lines) and brace_depth > 0:
                line = lines[i]

                # Count braces in this line
                for char in line:
                    if char == '{':
                        brace_depth += 1
                    elif char == '}':
                        brace_depth -= 1

                        # If we've closed the config block
                        if brace_depth == 0:
                            # Check if this closing brace is on its own line at the config indent level
                            close_match = re.match(r'^(\s+)\},?\s*$', line)
                            if close_match and len(close_match.group(1)) == indent_len:
                                # Skip this closing brace line
                                i += 1
                                break

                # If we haven't hit the closing brace yet, dedent and add this line
                if brace_depth > 0:
                    # Dedent by removing the extra 2 spaces (the config block indentation)
                    if line.startswith(config_indent + '  '):
                        line = config_indent + line[indent_len + 2:]
                    output_lines.append(line)
                    i += 1
        else:
            # Normal line, just add it
            output_lines.append(line)
            i += 1

    # Write the fixed content
    with open(filepath, 'w') as f:
        f.writelines(output_lines)

    print(f"Fixed {filepath}")

fix_template_file('src/utils/defaultTemplates.ts')
