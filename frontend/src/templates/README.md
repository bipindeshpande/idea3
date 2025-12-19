# Templates Directory

This directory contains all downloadable templates as separate markdown files. Templates are organized into two categories:

1. **Validation Frameworks** - Structured frameworks for validating startup ideas
2. **Traditional Templates** - Business planning and communication templates

## Structure

Each template is stored as a separate `.md` file:

**Validation Frameworks:**
- `problem-validation-checklist.md`
- `customer-interview-script.md`
- `landing-page-test-framework.md`
- `pricing-validation-method.md`
- `mvp-prioritization-matrix.md`
- `competitive-analysis-template.md`

**Traditional Templates:**
- `business-plan-template.md`
- `pitch-deck-template.md`
- `customer-outreach-email-template.md`

## Configuration

### `frameworksConfig.js`
- Imports all validation framework template content using Vite's `?raw` import
- Defines metadata (title, description, category, icon) for each framework
- Exports a `frameworks` array used by `Frameworks.jsx` and `Resources.jsx`

### `templatesConfig.js`
- Imports all traditional template content using Vite's `?raw` import
- Defines metadata (title, description, category, icon, downloadName) for each template
- Exports a `templates` array used by `Resources.jsx`

## Editing Templates

To edit a template:
1. Open the corresponding `.md` file in this directory
2. Make your changes
3. Save the file
4. The changes will be reflected immediately (no need to update the component)

## Adding New Templates

### Adding a Validation Framework

1. Create a new `.md` file in this directory
2. Add the template content
3. Update `frameworksConfig.js`:
   - Import the new template: `import newTemplate from "./new-template.md?raw";`
   - Add a new object to the `frameworks` array with:
     - `id`: Next sequential number
     - `title`: Display title
     - `description`: Short description
     - `category`: Category name
     - `icon`: Emoji icon
     - `download`: `true`
     - `content`: The imported template content

### Adding a Traditional Template

1. Create a new `.md` file in this directory
2. Add the template content
3. Update `templatesConfig.js`:
   - Import the new template: `import newTemplate from "./new-template.md?raw";`
   - Add a new object to the `templates` array with:
     - `id`: Unique identifier (kebab-case)
     - `title`: Display title
     - `description`: Short description
     - `icon`: Emoji icon
     - `category`: Category name
     - `download`: `true`
     - `content`: The imported template content
     - `downloadName`: Filename for download (e.g., "new-template.docx")

## Usage

**Validation Frameworks** are used in:
- `frontend/src/pages/resources/Frameworks.jsx` - Dedicated frameworks page
- `frontend/src/pages/resources/Resources.jsx` - Resources page (displays frameworks inline)

Both pages import from `frameworksConfig.js`.

**Traditional Templates** are used in:
- `frontend/src/pages/resources/Resources.jsx` - Resources page (Startup Templates section)

The page imports from `templatesConfig.js`.

## Technical Details

All templates are bundled at build time using Vite's `?raw` import feature. This means:
- Templates are included in the JavaScript bundle (no runtime fetches needed)
- Better performance (no network requests)
- All templates are available immediately
- Consistent loading mechanism across all templates

