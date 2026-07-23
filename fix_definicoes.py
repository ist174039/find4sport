import re

with open("app/admin/(dashboard)/definicoes/page.tsx", "r") as f:
    content = f.read()

# Layout
content = content.replace('<div className="space-y-6">', '<div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">', 1)
content = content.replace('<div className="mb-8">', '<div className="flex justify-between items-end mb-10 pb-6 border-b border-border">', 1)
content = content.replace('<div className="w-48 shrink-0">', '<div className="w-full md:w-64 shrink-0 space-y-1">')
content = content.replace('<nav className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">', '<nav className="flex flex-col gap-1">')
content = content.replace("'bg-teal-600 text-white'", "'bg-primary text-primary-foreground shadow-sm'")
content = content.replace("'text-gray-600 hover:bg-gray-50 hover:text-gray-900'", "'hover:bg-muted text-muted-foreground hover:text-foreground'")

# Colors
content = content.replace('text-gray-900', 'text-foreground')
content = content.replace('text-gray-500', 'text-muted-foreground')
content = content.replace('text-gray-600', 'text-muted-foreground')
content = content.replace('text-gray-400', 'text-muted-foreground/50')
content = content.replace('bg-white', 'bg-card')
content = content.replace('bg-gray-50', 'bg-muted')
content = content.replace('bg-gray-100', 'bg-muted/50')
content = content.replace('border-gray-100', 'border-border')
content = content.replace('border-gray-200', 'border-border')
content = content.replace('bg-teal-600', 'bg-primary')
content = content.replace('hover:bg-teal-700', 'hover:bg-primary/90')
content = content.replace('text-teal-600', 'text-primary')
content = content.replace('border-teal-100', 'border-primary/20')

# Specific adjustments
content = content.replace('rounded-lg border border-border bg-card p-4 shadow-sm', 'bg-card border border-border rounded-xl p-6 shadow-sm')

with open("app/admin/(dashboard)/definicoes/page.tsx", "w") as f:
    f.write(content)
