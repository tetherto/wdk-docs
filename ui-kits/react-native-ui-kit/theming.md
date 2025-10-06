---
title: Theming
description: Complete guide to theming the WDK React Native UI Kit
icon: palette
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
  metadata:
    visible: false
---

# Theming

Complete guide to customizing the appearance of your WDK React Native UI Kit components. Create beautiful, branded wallet interfaces that match your design system.

***

## About Theming

The WDK React Native UI Kit provides a comprehensive theming system that allows you to:

- **Use built-in themes** for quick setup with light and dark modes
- **Create brand themes** from your brand colors and fonts
- **Customize individual components** with fine-grained control
- **Access theme values** anywhere in your application
- **Switch themes dynamically** based on user preferences

***

## Basic Setup

### ThemeProvider

Wrap your app with the `ThemeProvider` to enable theming:

{% code title="Basic Theme Setup" lineNumbers="true" %}
```tsx
import { ThemeProvider, lightTheme } from '@tetherto/wdk-uikit-react-native'

function App() {
  return (
    <ThemeProvider initialTheme={lightTheme}>
      {/* Your app content */}
    </ThemeProvider>
  )
}
```
{% endcode %}

### Built-in Themes

The UI Kit comes with two built-in themes:

{% code title="Built-in Themes" lineNumbers="true" %}
```tsx
import { ThemeProvider, lightTheme, darkTheme } from '@tetherto/wdk-uikit-react-native'

// Light theme
<ThemeProvider initialTheme={lightTheme}>
  {/* Your app */}
</ThemeProvider>

// Dark theme
<ThemeProvider initialTheme={darkTheme}>
  {/* Your app */}
</ThemeProvider>
```
{% endcode %}

***

## Automatic Dark/Light Mode

The theme automatically switches based on system preferences:

{% code title="Auto Theme Mode" lineNumbers="true" %}
```tsx
<ThemeProvider defaultMode="auto" initialTheme={lightTheme}>
  {/* Will use system theme */}
</ThemeProvider>
```

### Manual Theme Control

{% code title="Manual Theme Toggle" lineNumbers="true" %}
```tsx
import { useTheme } from '@tetherto/wdk-uikit-react-native'

function ThemeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <Button onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </Button>
  )
}
```
{% endcode %}

***

## Brand Integration

### Creating Brand Themes

Apply your brand colors and fonts using `createThemeFromBrand`:

{% code title="Brand Theme Creation" lineNumbers="true" %}
```tsx
import { ThemeProvider, createThemeFromBrand } from '@tetherto/wdk-uikit-react-native'

const brandTheme = createThemeFromBrand({
  primaryColor: '#007AFF',
  secondaryColor: '#FF3B30',
  fontFamily: {
    regular: 'Inter-Regular',
    bold: 'Inter-Bold',
  },
}, 'light')

<ThemeProvider initialTheme={brandTheme}>
  {/* Your branded app */}
</ThemeProvider>
```
{% endcode %}

### BrandConfig Interface

{% code title="BrandConfig Type" lineNumbers="true" %}
```typescript
type BrandConfig = {
  primaryColor: string
  secondaryColor?: string
  fontFamily?: {
    regular?: string
    medium?: string
    semiBold?: string
    bold?: string
  }
}
```
{% endcode %}

***

## Custom Themes

### Complete Custom Theme

Create a completely custom theme with full control over all design tokens:

{% code title="Custom Theme" lineNumbers="true" %}
```tsx
import { ThemeProvider } from '@tetherto/wdk-uikit-react-native'

const myLightTheme = {
  mode: 'light' as const,
  colors: {
    primary: '#007AFF',
    primaryLight: '#4DA6FF',
    primaryDark: '#0056CC',
    onPrimary: '#FFFFFF',
    secondary: '#FF3B30',
    secondaryLight: '#FF6B60',
    secondaryDark: '#CC2F26',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceVariant: '#F3F4F6',
    surfaceElevated: '#E5E7EB',
    text: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
  },
  typography: {
    fontFamily: { 
      regular: 'System', 
      medium: 'System', 
      semiBold: 'System', 
      bold: 'System' 
    },
    fontSize: { 
      xs: 10, sm: 12, base: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 30 
    },
    fontWeight: { 
      regular: '400', medium: '500', semiBold: '600', bold: '700' 
    },
  },
  spacing: { 
    xs: 4, sm: 8, base: 12, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 
  },
  borderRadius: { 
    none: 0, sm: 4, md: 8, lg: 16, xl: 24, xxl: 32, full: 9999 
  },
}

<ThemeProvider customLightTheme={myLightTheme}>
  {/* Your app */}
</ThemeProvider>
```
{% endcode %}

### Theme Interface

{% code title="Theme Type" lineNumbers="true" %}
```typescript
type Theme = {
  mode: 'light' | 'dark' | 'auto'
  colors: ColorPalette
  typography: Typography
  spacing: Spacing
  borderRadius: BorderRadius
  componentVariants?: ComponentVariant
  componentOverrides?: ComponentOverrides
}
```
{% endcode %}

***

## Component Customization

### Component Overrides

Customize individual components with fine-grained control:

{% code title="Component Overrides" lineNumbers="true" %}
```tsx
<ThemeProvider
  initialTheme={lightTheme}
  componentOverrides={{
    TransactionItem: {
      container: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    TransactionList: {
      emptyStateText: {
        color: '#999999',
      },
    },
  }}
>
  {/* Your app */}
</ThemeProvider>
```
{% endcode %}

### Component Variants

Set default visual variants per component:

{% code title="Component Variants" lineNumbers="true" %}
```tsx
const customTheme = {
  ...lightTheme,
  componentVariants: {
    'AmountInput.default': { /* variant styles */ },
    'TransactionItem.compact': { /* variant styles */ }
  }
}
```
{% endcode %}

### ComponentOverrides Usage

Fine-grained style overrides for specific component parts:

{% code title="ComponentOverrides Usage" lineNumbers="true" %}
```tsx
const customTheme = {
  ...lightTheme,
  componentOverrides: {
    'AmountInput.container': { padding: 20 },
    'TransactionItem.amount': { fontSize: 18 }
  }
}
```
{% endcode %}

***

## Using Theme in Components

### useTheme Hook

Access theme values anywhere in your components:

{% code title="useTheme Hook" lineNumbers="true" %}
```tsx
import { useTheme } from '@tetherto/wdk-uikit-react-native'

function MyComponent() {
  const { theme } = useTheme()

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
      }}
    >
      <Text style={{ color: theme.colors.text }}>Hello World</Text>
    </View>
  )
}
```
{% endcode %}

### Alternative Theme Access

{% code title="Direct Theme Access" lineNumbers="true" %}
```tsx
import { useTheme } from '@tetherto/wdk-uikit-react-native'

function CustomComponent() {
  const theme = useTheme()
  
  return (
    <View style={{ 
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md 
    }}>
      <Text style={{ color: theme.colors.text }}>
        Themed content
      </Text>
    </View>
  )
}
```
{% endcode %}

***

## Theme Structure

### Color Palette

The theming system uses semantic naming for colors:

| Token | Purpose |
| --- | --- |
| `colors.primary` | Primary brand color |
| `colors.primaryLight` | Light variant of primary |
| `colors.primaryDark` | Dark variant of primary |
| `colors.onPrimary` | Text color on primary background |
| `colors.secondary` | Secondary brand color |
| `colors.secondaryLight` | Light variant of secondary |
| `colors.secondaryDark` | Dark variant of secondary |
| `colors.background` | Main background color |
| `colors.surface` | Card/container background |
| `colors.surfaceVariant` | Alternative surface color |
| `colors.surfaceElevated` | Elevated surface color |
| `colors.text` | Primary text color |
| `colors.textSecondary` | Secondary text color |
| `colors.textDisabled` | Disabled text color |
| `colors.border` | Border color |
| `colors.borderLight` | Light border color |
| `colors.error` | Error state color |
| `colors.warning` | Warning state color |
| `colors.success` | Success state color |
| `colors.info` | Info state color |

### Typography

| Token | Purpose |
| --- | --- |
| `typography.fontFamily.regular` | Regular font family |
| `typography.fontFamily.medium` | Medium font family |
| `typography.fontFamily.semiBold` | Semi-bold font family |
| `typography.fontFamily.bold` | Bold font family |
| `typography.fontSize.xs` | Extra small font size (10px) |
| `typography.fontSize.sm` | Small font size (12px) |
| `typography.fontSize.base` | Base font size (14px) |
| `typography.fontSize.md` | Medium font size (16px) |
| `typography.fontSize.lg` | Large font size (18px) |
| `typography.fontSize.xl` | Extra large font size (20px) |
| `typography.fontSize.xxl` | 2X large font size (24px) |
| `typography.fontSize.xxxl` | 3X large font size (30px) |
| `typography.fontWeight.regular` | Regular font weight ('400') |
| `typography.fontWeight.medium` | Medium font weight ('500') |
| `typography.fontWeight.semiBold` | Semi-bold font weight ('600') |
| `typography.fontWeight.bold` | Bold font weight ('700') |

### Spacing

| Token | Purpose |
| --- | --- |
| `spacing.xs` | Extra small spacing (4px) |
| `spacing.sm` | Small spacing (8px) |
| `spacing.base` | Base spacing (12px) |
| `spacing.md` | Medium spacing (16px) |
| `spacing.lg` | Large spacing (24px) |
| `spacing.xl` | Extra large spacing (32px) |
| `spacing.xxl` | 2X large spacing (48px) |
| `spacing.xxxl` | 3X large spacing (64px) |

### Border Radius

| Token | Purpose |
| --- | --- |
| `borderRadius.none` | No border radius (0px) |
| `borderRadius.sm` | Small border radius (4px) |
| `borderRadius.md` | Medium border radius (8px) |
| `borderRadius.lg` | Large border radius (16px) |
| `borderRadius.xl` | Extra large border radius (24px) |
| `borderRadius.xxl` | 2X large border radius (32px) |
| `borderRadius.full` | Full border radius (9999px) |

***

## Advanced Usage

### Dynamic Theme Updates

Update themes dynamically at runtime:

{% code title="Dynamic Theme Updates" lineNumbers="true" %}
```tsx
function Settings() {
  const { setBrandConfig, setComponentOverrides } = useTheme()

  const updateBrand = () => {
    setBrandConfig({
      primaryColor: '#FF6501',
    })
  }

  const customizeTransactions = () => {
    setComponentOverrides({
      TransactionItem: {
        container: {
          backgroundColor: 'rgba(255, 101, 1, 0.1)',
        },
      },
    })
  }

  return (
    <>
      <Button onPress={updateBrand}>Update Brand</Button>
      <Button onPress={customizeTransactions}>Customize Transactions</Button>
    </>
  )
}
```
{% endcode %}

### Creating Theme from Brand (Advanced)

{% code title="Advanced Brand Theme Creation" lineNumbers="true" %}
```tsx
import { createThemeFromBrand } from '@tetherto/wdk-uikit-react-native'

const myTheme = createThemeFromBrand(
  {
    primaryColor: '#FF6501',
    secondaryColor: '#6B7280',
  },
  'dark' // 'light' or 'dark'
)
```
{% endcode %}

### Theme Persistence

Save and restore user theme preferences:

{% code title="Theme Persistence" lineNumbers="true" %}
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@tetherto/wdk-uikit-react-native'

function useThemePersistence() {
  const { theme, setTheme } = useTheme()

  const saveTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('userTheme', JSON.stringify(newTheme))
      setTheme(newTheme)
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('userTheme')
      if (savedTheme) {
        setTheme(JSON.parse(savedTheme))
      }
    } catch (error) {
      console.error('Failed to load theme:', error)
    }
  }

  return { saveTheme, loadTheme }
}
```
{% endcode %}

***

## Best Practices

### 1. Use Semantic Color Names

Prefer semantic names over specific colors:

{% code title="Good: Semantic Colors" lineNumbers="true" %}
```tsx
// Good
style={{ backgroundColor: theme.colors.background }}
style={{ color: theme.colors.text }}
```
{% endcode %}

{% code title="Avoid: Hard-coded Colors" lineNumbers="true" %}
```tsx
// Avoid
style={{ backgroundColor: '#FFFFFF' }}
style={{ color: '#000000' }}
```
{% endcode %}

### 2. Leverage Spacing Scale

Use the spacing scale for consistent layouts:

{% code title="Good: Spacing Scale" lineNumbers="true" %}
```tsx
// Good
style={{ 
  padding: theme.spacing.md,
  marginBottom: theme.spacing.lg 
}}
```
{% endcode %}

### 3. Use Component Overrides Sparingly

Prefer theme-level changes over component overrides when possible:

{% code title="Prefer Theme Changes" lineNumbers="true" %}
```tsx
// Prefer: Update theme
const customTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#FF6501'
  }
}
```
{% endcode %}

### 4. Test Both Light and Dark Modes

Always test your customizations in both light and dark modes:

{% code title="Theme Testing" lineNumbers="true" %}
```tsx
function ThemeTester() {
  const { theme, setTheme } = useTheme()
  
  return (
    <View>
      <Button onPress={() => setTheme(lightTheme)}>
        Test Light Mode
      </Button>
      <Button onPress={() => setTheme(darkTheme)}>
        Test Dark Mode
      </Button>
    </View>
  )
}
```
{% endcode %}

***

## Next Steps

- [Get Started](get-started.md) - Quick start guide for the UI Kit
- [Components List](api-reference.md) - Complete API reference for all components
- [React Native Starter](https://github.com/tetherto/wdk-starter-react-native) - See theming in action

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}

