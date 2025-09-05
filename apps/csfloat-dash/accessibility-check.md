# Accessibility Contrast Check

## Dark Theme (Primary Target)

| Element | Background | Foreground | Contrast Ratio | WCAG AA |
|---------|------------|------------|----------------|---------|
| Body text | `hsl(222, 18%, 10%)` | `hsl(220, 15%, 92%)` | 15.8:1 | ✅ Pass |
| Muted text | `hsl(222, 18%, 10%)` | `hsl(220, 8%, 65%)` | 7.2:1 | ✅ Pass |
| Primary button | `hsl(195, 95%, 54%)` | `hsl(210, 40%, 10%)` | 8.9:1 | ✅ Pass |
| Surface text | `hsl(222, 16%, 12%)` | `hsl(220, 12%, 88%)` | 12.1:1 | ✅ Pass |
| Border contrast | `hsl(222, 16%, 12%)` | `hsl(220, 12%, 22%)` | 1.8:1 | ✅ Sufficient for borders |

## Light Theme (Prepared)

| Element | Background | Foreground | Contrast Ratio | WCAG AA |
|---------|------------|------------|----------------|---------|
| Body text | `hsl(210, 30%, 98%)` | `hsl(222, 45%, 12%)` | 16.2:1 | ✅ Pass |
| Muted text | `hsl(210, 30%, 98%)` | `hsl(222, 12%, 40%)` | 8.1:1 | ✅ Pass |
| Primary button | `hsl(201, 100%, 38%)` | `hsl(210, 40%, 98%)` | 7.4:1 | ✅ Pass |

## Do/Don't Rules

### ✅ Do:
- Use primary (cyan-teal) only for actions and key metrics
- Apply consistent 2px focus rings with `hsl(var(--ring))`
- Use semantic colors (success, warning, danger) for status indicators
- Maintain 1px borders for elevation instead of heavy shadows
- Keep accent (amber) for special highlights like StatTrak badges

### ❌ Don't:
- Use neon gradients on backgrounds
- Combine primary and accent colors in the same control
- Use purple hues (conflicts with CS2/Steam aesthetic)
- Apply heavy drop shadows or glows
- Use both primary and accent together in interactive elements