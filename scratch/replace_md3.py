import os
import re

MD3_REPLACEMENTS = [
    (r'\bbg-surface-container-lowest\b', 'bg-card'),
    (r'\bbg-surface-container-low\b', 'bg-muted/50'),
    (r'\bbg-surface-container-high\b', 'bg-muted'),
    (r'\bbg-surface-container-highest\b', 'bg-accent'),
    (r'\bbg-surface-container\b', 'bg-muted'),
    (r'\bbg-surface\b', 'bg-background'),
    (r'\bbg-primary-container\b', 'bg-primary/10'),
    (r'\bbg-secondary-container\b', 'bg-secondary'),
    (r'\bbg-error-container\b', 'bg-destructive/10'),
    (r'\bbg-error\b', 'bg-destructive'),
    (r'\bbg-success-mint\b', 'bg-emerald-500/10'),
    (r'\bbg-inverse-surface\b', 'bg-foreground'),
    (r'\bbg-outline-variant\b', 'bg-border'),

    (r'\btext-text-primary\b', 'text-foreground'),
    (r'\btext-text-secondary\b', 'text-muted-foreground'),
    (r'\btext-on-surface-variant\b', 'text-muted-foreground'),
    (r'\btext-on-surface\b', 'text-foreground'),
    (r'\btext-on-primary-container\b', 'text-primary'),
    (r'\btext-on-primary\b', 'text-primary-foreground'),
    (r'\btext-on-error-container\b', 'text-destructive'),
    (r'\btext-trust-gold\b', 'text-amber-500'),
    (r'\btext-error\b', 'text-destructive'),
    (r'\btext-outline\b', 'text-muted-foreground'),
    (r'\btext-outline-variant\b', 'text-muted-foreground'),

    (r'\bborder-border-subtle\b', 'border-border'),
    (r'\bborder-outline-variant\b', 'border-border'),
    (r'\bborder-outline\b', 'border-border'),

    (r'\bfont-headline-lg\b', 'font-bold text-2xl'),
    (r'\bfont-headline-md\b', 'font-semibold text-xl'),
    (r'\bfont-headline-sm\b', 'font-semibold text-lg'),
    (r'\bfont-body-lg\b', 'text-base'),
    (r'\bfont-body-md\b', 'text-sm'),
    (r'\bfont-label-lg\b', 'font-medium text-base'),
    (r'\bfont-label-md\b', 'font-medium text-sm'),
    (r'\bfont-label-sm\b', 'font-medium text-xs'),
    (r'\bfont-display-lg\b', 'font-bold text-3xl'),
    (r'\bfont-display-md\b', 'font-bold text-2xl'),
    (r'\bfont-stat-display\b', 'font-bold text-3xl'),

    (r'\btext-headline-lg\b', 'text-2xl'),
    (r'\btext-headline-md\b', 'text-xl'),
    (r'\btext-headline-sm\b', 'text-lg'),
    (r'\btext-body-lg\b', 'text-base'),
    (r'\btext-body-md\b', 'text-sm'),
    (r'\btext-label-lg\b', 'text-base'),
    (r'\btext-label-md\b', 'text-sm'),
    (r'\btext-label-sm\b', 'text-xs'),
]

dirs_to_process = ['app', 'components']

processed_count = 0
modified_count = 0

for d in dirs_to_process:
    dir_path = os.path.join('/home/cg/GIT/Personal/find4sport', d)
    for root, _, files in os.walk(dir_path):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                file_path = os.path.join(root, f)
                processed_count += 1
                with open(file_path, 'r', encoding='utf-8') as fp:
                    content = fp.read()
                
                new_content = content
                for pattern, replacement in MD3_REPLACEMENTS:
                    new_content = re.sub(pattern, replacement, new_content)
                
                if new_content != content:
                    modified_count += 1
                    with open(file_path, 'w', encoding='utf-8') as fp:
                        fp.write(new_content)
                    print(f"Updated: {file_path}")

print(f"Done processing {processed_count} files. Modified {modified_count} files.")
