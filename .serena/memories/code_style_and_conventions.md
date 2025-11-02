# Code Style & Conventions

## Clean Code Principles

1. **DRY (Don't Repeat Yourself)**
   - Extract reusable logic
   - "Three Strikes Rule": duplicate once OK, third time refactor

2. **Single Responsibility**
   - Each function/class/module has ONE reason to change

3. **Intention-Revealing Names**
   - Variables are nouns, functions are verbs
   - Names answer "why, what, how"

4. **Small & Focused Functions**
   - Max 50 lines
   - One responsibility
   - Extract helpers when needed

5. **Loose Coupling, High Cohesion**
   - Modules independent with minimal dependencies
   - Related functionality grouped together

## Formatting
- **Auto-formatters run on save**: ESLint → Organize Imports → Prettier → Trim Whitespace → Final Newline
- **Python**: Black, Flake8, isort (auto-format on save)
- **Do NOT manually format** - formatters handle it

## Security Rules
1. Never commit secrets (use `.env` outside repos)
2. Validate all inputs
3. Handle errors without exposing sensitive data
4. Threat model before implementing
5. Write security tests (XSS, injection, auth bypass)