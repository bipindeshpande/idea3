# Website Fonts, Sizes, and Colors Report

## FONTS

### Primary Font Families

1. **Inter** (Google Fonts)
   - Weights: 400, 500, 600
   - Used as: `--font-sans` CSS variable
   - Fallback: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
   - Primary font for body text and UI elements

2. **JetBrains Mono** (Google Fonts)
   - Weight: 500
   - Used as: `--font-mono` CSS variable
   - Used for monospace text (e.g., numbers in dashboard stats)

3. **Helvetica**
   - Used in PDF generation component only
   - Not used in web UI

4. **Plus Jakarta Sans**
   - Defined in Tailwind config but NOT actually loaded/used
   - Tailwind config has it, but CSS variables use Inter instead

### Font Family Stack (as defined in CSS)
```
Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

---

## FONT SIZES

### CSS-Defined Sizes (in pixels)

1. **8px** - Footer text in PDF
2. **10px** - PDF subtitle, paragraph, bullet items, input labels/values
3. **11px** - PDF base font size, parameter names
4. **12px** - UI badges, stepper rows, PDF parameter scores
5. **13px** - PDF group titles
6. **14px** - UI controls (inputs, selects, textareas), buttons, base form elements
7. **16px** - UI heading h3, PDF section titles
8. **18px** - UI heading h2
9. **24px** - UI heading h1, PDF titles
10. **32px** - PDF overall score display

### CSS-Defined Sizes (in rem)

1. **0.9rem** (≈14.4px) - Tag chips

### Tailwind CSS Classes Used (with equivalent sizes)

1. **text-xs** = 0.75rem (12px) - Extra small text, labels, secondary info
2. **text-sm** = 0.875rem (14px) - Small text, buttons, descriptions
3. **text-base** = 1rem (16px) - Base body text
4. **text-lg** = 1.125rem (18px) - Large text, headings
5. **text-xl** = 1.25rem (20px) - Extra large text, icons
6. **text-2xl** = 1.5rem (24px) - Dashboard stats, large headings
7. **text-3xl** = 1.875rem (30px) - Page titles
8. **text-4xl** = 2.25rem (36px) - Large page titles (responsive)
9. **text-5xl** = 3rem (48px) - Emoji/icon sizes

---

## FONT COLORS

### Light Mode Colors

#### Primary Text Colors
- **--text**: `#1A1A1A` - Primary text color
- **--text-secondary**: `#6B7280` - Secondary/muted text
- **--text-light**: `#6B7280` (alias of text-secondary)

#### Accent Colors
- **--accent**: `#2563EB` - Primary accent (blue)
- **--accent-hover**: `#1D4ED8` - Accent hover state
- **--on-accent**: `#FFFFFF` - Text on accent backgrounds

#### Semantic Colors
- **--success**: `#16A34A` - Success state (green)
- **--warning**: `#D97706` - Warning state (amber)
- **--danger**: `#DC2626` - Error/danger state (red)

#### Prose/Rich Text Colors
- **--prose-heading**: `#1A1A1A` - Heading text in prose
- **--prose-body**: `#1A1A1A` - Body text in prose
- **--prose-marker**: `#2563EB` - List markers
- **--prose-table-border**: `rgba(21, 50, 116, 0.08)` - Table borders

#### Chip/Badge Colors
- **--chip-text**: `#0f2456` - Chip text color
- **--chip-bg**: `rgba(255, 255, 255, 0.75)` - Chip background

#### Semantic Badge Colors (Light Mode)
- **Success Badge**:
  - Background: `#DCFCE7`
  - Text: `#15803D`
  - Border: `#86EFAC`
- **Info Badge**:
  - Background: `#E0E7FF`
  - Text: `#4338CA`
  - Border: `#A5B4FC`
- **Warning Badge**:
  - Background: `#FFE4E6`
  - Text: `#9F1239`
  - Border: `#FDA4AF`
- **Danger Badge**:
  - Background: `#FEE2E2`
  - Text: `#B91C1C`
  - Border: `#FCA5A5`

### Dark Mode Colors

#### Primary Text Colors
- **--text**: `#F8FAFC` - Primary text color
- **--text-secondary**: `#CBD5E1` - Secondary/muted text
- **--text-light**: `#CBD5E1` (alias of text-secondary)

#### Accent Colors
- **--accent**: `#3B82F6` - Primary accent (lighter blue)
- **--accent-hover**: `#2563EB` - Accent hover state
- **--on-accent**: `#FFFFFF` - Text on accent backgrounds

#### Semantic Colors
- **--success**: `#4ADE80` - Success state (lighter green)
- **--warning**: `#FBBF24` - Warning state (lighter amber)
- **--danger**: `#F87171` - Error/danger state (lighter red)

#### Prose/Rich Text Colors
- **--prose-heading**: `#E2E8F0` - Heading text in prose
- **--prose-body**: `#CBD5E1` - Body text in prose
- **--prose-marker**: `#60A5FA` - List markers
- **--prose-table-border**: `rgba(148, 163, 184, 0.2)` - Table borders

#### Chip/Badge Colors
- **--chip-text**: `#E2E8F0` - Chip text color
- **--chip-bg**: `rgba(15, 23, 42, 0.6)` - Chip background

#### Semantic Badge Colors (Dark Mode)
- **Success Badge**:
  - Background: `rgba(34, 197, 94, 0.18)`
  - Text: `#4ADE80`
  - Border: `rgba(34, 197, 94, 0.35)`
- **Info Badge**:
  - Background: `rgba(99, 102, 241, 0.20)`
  - Text: `#C7D2FE`
  - Border: `rgba(99, 102, 241, 0.35)`
- **Warning Badge**:
  - Background: `rgba(244, 63, 94, 0.18)`
  - Text: `#FDA4AF`
  - Border: `rgba(244, 63, 94, 0.35)`
- **Danger Badge**:
  - Background: `rgba(239, 68, 68, 0.18)`
  - Text: `#FCA5A5`
  - Border: `rgba(239, 68, 68, 0.35)`

### PDF-Specific Colors

1. **#0f172a** - PDF title and headings
2. **#1e293b** - PDF section titles, parameter names
3. **#475569** - PDF subtitles, score labels
4. **#334155** - PDF paragraph text
5. **#94a3b8** - PDF footer text
6. **#cbd5e1** - PDF table borders
7. **#e2e8f0** - PDF footer border
8. **#f8fafc** - PDF background for score badges and parameter rows

#### PDF Score Colors (Dynamic)
- **Score ≥ 7**: `#059669` (emerald/green)
- **Score 4-6**: `#d97706` (amber/orange)
- **Score < 4**: `#f97316` (coral/red)

### Component-Specific Colors

#### Profile Report Component (Dynamic based on theme)
- **Light Mode**:
  - Background: `rgba(236, 253, 245, 0.8)`
  - Border: `#10b981`
  - Text: `#065f46`
  - Text Light: `#047857`
  - Link Hover: `#059669`
- **Dark Mode**:
  - Background: `#0B3A37`
  - Border: `#1ABC9C`
  - Text: `#1ABC9C`
  - Text Light: `#4FD1B5`
  - Link Hover: `#5FE5C8`

---

## SUMMARY

### Fonts Used
- **Inter** (primary, weights: 400, 500, 600)
- **JetBrains Mono** (monospace, weight: 500)
- **Helvetica** (PDF only)

### Font Sizes Used
- **8px, 10px, 11px, 12px, 13px, 14px, 16px, 18px, 24px, 32px** (absolute)
- **0.9rem** (relative)
- **Tailwind classes**: text-xs (12px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px), text-3xl (30px), text-4xl (36px), text-5xl (48px)

### Color Palette
- **Primary**: Blue (`#2563EB` light / `#3B82F6` dark)
- **Text**: Dark gray (`#1A1A1A` light) / Light gray (`#F8FAFC` dark)
- **Secondary Text**: Medium gray (`#6B7280` light / `#CBD5E1` dark)
- **Semantic**: Green (success), Amber (warning), Red (danger)
- **Full color system**: Supports both light and dark modes with CSS variables

---

*Report generated from analysis of:*
- `frontend/src/styles.css`
- `frontend/src/styles/theme.css`
- `frontend/tailwind.config.js`
- `frontend/index.html`
- `frontend/src/components/pdf/ValidationReportPDF.jsx`
- All JSX component files using Tailwind classes

