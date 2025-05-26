---
applyTo: "**/*.tsx, **/*.ts"
---

## TypeScript Guidelines
- Use TypeScript for all new code
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators
- Always names export over default exports for react components

## React Guidelines
- Use functional components with hooks
- Follow the React hooks rules (no conditional hooks)
- Keep components small and focused
- Use CSS modules for component styling
- Never use tailwindCSS

# React Component Structure
- Use the following as eg how to define react component

interface Prop {
    name: string;
    type: string;
}

export function ComponentName(props: Prop) {
    const { name, type } = props;
    // Destructure props for better readability
    return (
        <div>
            <h1>Component Name</h1>
            <p>{prop1.name}</p>
            <p>{prop2.name}</p>
        </div>
    );
}

- Any action that requires a side effect (like API calls) should be handled using tanstack query