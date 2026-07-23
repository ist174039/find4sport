import os
import re

ICON_MAP = {
    'account_circle': 'User',
    'add': 'Plus',
    'add_business': 'Building',
    'add_circle': 'PlusCircle',
    'admin_panel_settings': 'Shield',
    'analytics': 'BarChart',
    'apartment': 'Building',
    'arrow_drop_down': 'ChevronDown',
    'arrow_forward': 'ArrowRight',
    'assignment_late': 'AlertCircle',
    'auto_awesome': 'Sparkles',
    'block': 'Ban',
    'calendar_month': 'Calendar',
    'calendar_today': 'Calendar',
    'call': 'Phone',
    'cancel': 'XCircle',
    'category': 'Tag',
    'chat': 'MessageSquare',
    'check': 'Check',
    'check_circle': 'CheckCircle',
    'chevron_left': 'ChevronLeft',
    'chevron_right': 'ChevronRight',
    'close': 'X',
    'cloud_upload': 'Upload',
    'coffee': 'Coffee',
    'comment': 'MessageSquare',
    'cookie': 'Cookie',
    'database': 'Database',
    'delete': 'Trash2',
    'description': 'FileText',
    'directions': 'Navigation',
    'directions_car': 'Car',
    'distance': 'MapPin',
    'domain': 'Building2',
    'download': 'Download',
    'edit': 'Edit',
    'event': 'Calendar',
    'event_available': 'CalendarCheck',
    'event_busy': 'CalendarX',
    'exercise': 'Dumbbell',
    'expand_more': 'ChevronDown',
    'favorite': 'Heart',
    'favorite_border': 'Heart',
    'fiber_new': 'Sparkles',
    'filter_alt': 'Filter',
    'filter_list': 'Filter',
    'fitness_center': 'Dumbbell',
    'flag': 'Flag',
    'forum': 'MessageSquare',
    'gavel': 'Gavel',
    'generating_tokens': 'Key',
    'google': 'Globe',
    'group': 'Users',
    'group_add': 'UserPlus',
    'groups': 'Users',
    'help': 'HelpCircle',
    'history': 'History',
    'image': 'Image',
    'info': 'Info',
    'insights': 'LineChart',
    'kayaking': 'Activity',
    'language': 'Globe',
    'local_activity': 'Ticket',
    'location_city': 'Building',
    'location_on': 'MapPin',
    'lock': 'Lock',
    'lock_reset': 'Key',
    'logout': 'LogOut',
    'mail': 'Mail',
    'map': 'Map',
    'monitoring': 'Activity',
    'more_vert': 'MoreVertical',
    'near_me': 'Navigation',
    'notification_important': 'BellRing',
    'notifications': 'Bell',
    'open_in_new': 'ExternalLink',
    'palette': 'Palette',
    'payments': 'CreditCard',
    'pending_actions': 'Clock',
    'person': 'User',
    'person_add': 'UserPlus',
    'person_celebrate': 'UserCheck',
    'photo_camera': 'Camera',
    'photo_library': 'Images',
    'picture_as_pdf': 'FileText',
    'play_circle': 'Play',
    'post_add': 'FilePlus',
    'public': 'Globe',
    'refresh': 'RotateCw',
    'reply': 'Reply',
    'report': 'Flag',
    'rule': 'CheckSquare',
    'schedule': 'Clock',
    'schema': 'Database',
    'search': 'Search',
    'search_off': 'Search',
    'security': 'Shield',
    'settings': 'Settings',
    'share': 'Share2',
    'share_location': 'MapPin',
    'shield': 'Shield',
    'shopping_bag': 'ShoppingBag',
    'shower': 'ShowerHead',
    'sports': 'Activity',
    'sports_handball': 'Activity',
    'sports_tennis': 'Activity',
    'stadium': 'Building2',
    'star': 'Star',
    'store': 'Store',
    'support_agent': 'Headphones',
    'sync_alt': 'Repeat',
    'thumb_down': 'ThumbsDown',
    'thumb_up': 'ThumbsUp',
    'upload_file': 'Upload',
    'verified': 'BadgeCheck',
    'verified_user': 'ShieldCheck',
    'view_list': 'List',
    'visibility': 'Eye',
    'warning': 'AlertTriangle',
    'waving_hand': 'Smile',
    'wifi': 'Wifi'
}

def replace_material_symbols_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern for <span ...material-symbols-outlined...>icon_name</span>
    span_pattern = re.compile(
        r'<span\s+([^>]*class(?:Name)?=["\'][^"\']*material-symbols-outlined[^"\']*["\'][^>]*)>([\s\n]*[a-z_]+[\s\n]*)</span>',
        re.DOTALL
    )

    matches = span_pattern.findall(content)
    if not matches:
        return False

    used_lucide_icons = set()

    def replacer(match):
        attrs = match.group(1)
        icon_name = match.group(2).strip()

        lucide_name = ICON_MAP.get(icon_name, 'HelpCircle')
        used_lucide_icons.add(lucide_name)

        # Extract className if present
        class_match = re.search(r'className=["\']([^"\']*)["\']', attrs)
        if class_match:
            classes = class_match.group(1)
            # Remove material-symbols-outlined from classes
            classes = re.sub(r'\bmaterial-symbols-outlined\b', '', classes).strip()
            # Clean up text-[24px], etc if needed or keep size
            # Ensure default size if no size class
            if not re.search(r'\b(h-|w-|size-|text-\[)', classes):
                classes = (classes + ' h-5 w-5').strip()
            classes = re.sub(r'\s+', ' ', classes)
            return f'<{lucide_name} className="{classes}" />'
        else:
            return f'<{lucide_name} className="h-5 w-5" />'

    new_content = span_pattern.sub(replacer, content)

    # Check for data-icon pattern as well
    data_icon_pattern = re.compile(
        r'<span\s+([^>]*data-icon=["\']([a-z_]+)["\'][^>]*)>.*?</span>',
        re.DOTALL
    )

    def data_icon_replacer(match):
        attrs = match.group(1)
        icon_name = match.group(2).strip()
        lucide_name = ICON_MAP.get(icon_name, 'HelpCircle')
        used_lucide_icons.add(lucide_name)

        class_match = re.search(r'className=["\']([^"\']*)["\']', attrs)
        if class_match:
            classes = class_match.group(1)
            classes = re.sub(r'\bmaterial-symbols-outlined\b', '', classes).strip()
            if not re.search(r'\b(h-|w-|size-|text-\[)', classes):
                classes = (classes + ' h-5 w-5').strip()
            classes = re.sub(r'\s+', ' ', classes)
            return f'<{lucide_name} className="{classes}" />'
        else:
            return f'<{lucide_name} className="h-5 w-5" />'

    new_content = data_icon_pattern.sub(data_icon_replacer, new_content)

    if used_lucide_icons:
        # Add Lucide imports to file
        import_stmt = f"import {{ {', '.join(sorted(list(used_lucide_icons)))} }} from 'lucide-react'\n"
        
        # Check if lucide-react is already imported
        if "from 'lucide-react'" in new_content:
            # Add to existing lucide import
            existing_import = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"]", new_content)
            if existing_import:
                existing_icons = set(x.strip() for x in existing_import.group(1).split(','))
                all_icons = sorted(list(existing_icons.union(used_lucide_icons)))
                new_import_str = f"import {{ {', '.join(all_icons)} }} from 'lucide-react'"
                new_content = new_content.replace(existing_import.group(0), new_import_str)
        else:
            # Add at top after 'use client' or first import
            if "'use client'" in new_content or '"use client"' in new_content:
                new_content = re.sub(r"('use client'|\"use client\");?\n", r"\1;\n" + import_stmt, new_content, count=1)
            else:
                new_content = import_stmt + new_content

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

dirs_to_process = ['app', 'components']
modified_files = []

for d in dirs_to_process:
    dir_path = os.path.join('/home/cg/GIT/Personal/find4sport', d)
    for root, _, files in os.walk(dir_path):
        for f in files:
            if f.endswith('.tsx'):
                fp = os.path.join(root, f)
                if replace_material_symbols_in_file(fp):
                    modified_files.append(fp)

print(f"Replaced Material Symbols in {len(modified_files)} files.")
