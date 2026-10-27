/**
 * Safe Engineering Formula Evaluator
 * Evaluates mathematical expressions with given variables.
 * Supports:
 * - standard arithmetic: +, -, *, /, %, ^
 * - parentheses: ( )
 * - math functions: sqrt(), sin(), cos(), tan(), log(), ln(), abs(), round(), min(), max()
 * - constants: pi, e
 */
export function evaluateFormula(formula, variables = {}) {
  if (!formula || typeof formula !== 'string' || !formula.trim()) {
    return { success: false, error: 'Empty formula expression' };
  }

  try {
    let expr = formula.trim();

    // Replace '^' with exponentiation '**'
    expr = expr.replace(/\^/g, '**');

    // Replace common constants
    expr = expr.replace(/\bpi\b/gi, 'Math.PI');
    expr = expr.replace(/\be\b/g, 'Math.E');

    // Replace standard math functions with Math.* equivalents
    const mathFuncs = ['sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log10', 'abs', 'round', 'floor', 'ceil', 'min', 'max'];
    for (const fn of mathFuncs) {
      const reg = new RegExp(`\\b${fn}\\(`, 'gi');
      expr = expr.replace(reg, `Math.${fn}(`);
    }
    // Natural log
    expr = expr.replace(/\bln\(/gi, 'Math.log(');
    // Regular log defaults to Math.log10 if desired, or Math.log
    expr = expr.replace(/\blog\(/gi, 'Math.log10(');

    // Build variable mapping
    const sanitizedVars = {};
    for (const [key, val] of Object.entries(variables)) {
      if (!key) continue;
      const numVal = parseFloat(val);
      if (isNaN(numVal)) {
        return { success: false, error: `Invalid number for variable "${key}": "${val}"` };
      }
      sanitizedVars[key] = numVal;
    }

    // Replace variable names with their numeric values
    // Sort keys by descending length to prevent partial matching (e.g. V_in before V)
    const varKeys = Object.keys(sanitizedVars).sort((a, b) => b.length - a.length);

    for (const key of varKeys) {
      // Look for whole word variable occurrences
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const varRegex = new RegExp(`\\b${escapedKey}\\b`, 'g');
      expr = expr.replace(varRegex, `(${sanitizedVars[key]})`);
    }

    // Safety validation: only allow safe Math operations and numbers
    const validCharacters = /^[0-9+\-*/(). ,%*MathPIEabsroundflorceilminsqrtcoant10]+$/;
    
    // Check if any leftover alphabetical tokens exist (which would be undefined variables)
    const remainingLetters = expr.replace(/Math\.[a-zA-Z0-9]+/g, '').match(/[a-zA-Z_]+/g);
    if (remainingLetters && remainingLetters.length > 0) {
      return {
        success: false,
        error: `Unrecognized variable or function: "${remainingLetters.join(', ')}"`
      };
    }

    // Evaluate safely via new Function with no external scope
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr});`)();

    if (result === undefined || result === null || isNaN(result)) {
      return { success: false, error: 'Result is undefined or NaN' };
    }

    if (!isFinite(result)) {
      return { success: false, error: 'Calculation resulted in infinity (division by zero)' };
    }

    // Format output cleanly (up to 4 decimal places if float)
    let formattedResult = result;
    if (typeof result === 'number') {
      if (Number.isInteger(result)) {
        formattedResult = result.toString();
      } else {
        formattedResult = Number(result.toFixed(4)).toString();
      }
    }

    return {
      success: true,
      result: formattedResult,
      rawResult: result
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Syntax error in calculation formula'
    };
  }
}
