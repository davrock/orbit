# 🛸 ORBIT Interactive Documentation

This directory contains the interactive documentation website for ORBIT.

## Files

- **index.html** - Main website with all sections
- **styles.css** - Responsive styling and animations
- **script.js** - Interactive features and command playground

## Features

### 🎯 Interactive Sections

1. **Hero** - Animated introduction with orbital visualization
2. **Quick Start** - Installation instructions with copy buttons
3. **Features** - Six key capabilities highlighted
4. **Mission Types** - Interactive mission selector with 6 mission types
5. **Examples** - Four real-world scenarios with simulated terminal output
6. **Playground** - Interactive command executor
7. **Documentation** - Organized links to all docs
8. **Footer** - Additional resources and links

### ⚡ Interactive Features

- **Copy to Clipboard** - One-click code copying
- **Command Playground** - Try ORBIT commands and see expected output
- **Mission Selector** - Switch between different mission types
- **Example Tabs** - View different usage scenarios
- **Smooth Animations** - Professional transitions and effects
- **Responsive Design** - Works on all screen sizes

## How to Use

### Option 1: Open Locally

Simply open `index.html` in your web browser:

```bash
# From project root
open docs/index.html

# Or navigate in browser to:
# file:///path/to/orbit/docs/index.html
```

### Option 2: Serve with HTTP Server

For best experience, serve with a local HTTP server:

```bash
# Using Python
cd docs
python -m http.server 8000

# Using Node.js
npx http-server docs -p 8000

# Using PHP
php -S localhost:8000 -t docs
```

Then visit: http://localhost:8000

### Option 3: Deploy

Deploy to any static hosting service:

- **GitHub Pages**: Push to `gh-pages` branch
- **Netlify**: Drag and drop the `docs` folder
- **Vercel**: Connect repository and set build directory to `docs`
- **Cloudflare Pages**: Similar to above

## Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4a90e2;
    --secondary-color: #7b68ee;
    --accent-color: #ff6b6b;
    /* ... more colors ... */
}
```

### Mission Data

Add or modify missions in `script.js`:

```javascript
const missions = {
    'your-mission': {
        phases: 'phase1 → phase2',
        description: 'Your description',
        output: [
            'Line 1',
            'Line 2'
        ]
    }
};
```

### Content

Edit `index.html` directly - all sections are clearly marked with HTML comments.

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Performance

- No external dependencies
- Minimal JavaScript (~11KB)
- CSS optimized with animations
- Total page size: ~52KB (uncompressed)
- Fast load times on all connections

## Accessibility

- Semantic HTML5 structure
- ARIA labels where needed
- Keyboard navigation support
- High contrast color scheme
- Focus indicators on interactive elements

## Future Enhancements

Potential additions:

- [ ] Dark mode toggle
- [ ] Search functionality
- [ ] Live API integration
- [ ] Video tutorials
- [ ] Code syntax highlighting
- [ ] Multi-language support
- [ ] Analytics integration

## Contributing

To improve the documentation:

1. Edit the HTML/CSS/JS files
2. Test locally
3. Ensure responsive design works
4. Check all interactive features
5. Commit with descriptive message

## License

MIT - Same as ORBIT project
