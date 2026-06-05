import { compile } from 'mathjs';
import type { ParsedFunction, ParamConfig } from '../../types/index';

export class FunctionParser {
  // 预定义模板
  static templates: Record<string, { expr: string; defaults: Record<string, number> }> = {
    sine: { expr: 'a * sin(b * x + c)', defaults: { a: 1, b: 1, c: 0 } },
    cosine: { expr: 'a * cos(b * x + c)', defaults: { a: 1, b: 1, c: 0 } },
    tangent: { expr: 'a * tan(b * x + c)', defaults: { a: 1, b: 1, c: 0 } },
    exponential: { expr: 'a * exp(b * x)', defaults: { a: 1, b: 1 } },
    logarithmic: { expr: 'a * log(b * x)', defaults: { a: 1, b: 1 } },
    linear: { expr: 'a * x + b', defaults: { a: 1, b: 0 } },
    quadratic: { expr: 'a * x^2 + b * x + c', defaults: { a: 1, b: 0, c: 0 } },
    cubic: { expr: 'a * x^3 + b * x^2 + c * x + d', defaults: { a: 1, b: 0, c: 0, d: 0 } },
  };

  // 解析表达式
  parse(expression: string): ParsedFunction {
    try {
      // 替换 ^ 为 ** 以兼容 mathjs
      const normalizedExpr = expression.replace(/\^/g, '**');
      
      // 编译表达式
      const compiled = compile(normalizedExpr);
      
      // 提取参数（除了 x）
      const params = this.extractParams(normalizedExpr);
      
      // 生成默认参数值
      const defaults: Record<string, number> = {};
      params.forEach(param => {
        defaults[param] = 1;
      });
      
      return {
        expression,
        compiled: (scope: Record<string, number>) => {
          try {
            return compiled.evaluate(scope);
          } catch {
            return NaN;
          }
        },
        params,
        defaults,
      };
    } catch (error) {
      throw new Error(`Failed to parse expression: ${error}`);
    }
  }

  // 从模板创建
  fromTemplate(templateName: string): ParsedFunction {
    const template = FunctionParser.templates[templateName];
    if (!template) {
      throw new Error(`Unknown template: ${templateName}`);
    }
    
    const parsed = this.parse(template.expr);
    parsed.defaults = { ...template.defaults };
    return parsed;
  }

  // 提取参数名
  private extractParams(expression: string): string[] {
    // 匹配所有标识符，排除数字、数学常量和函数名
    const identifierRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const matches = expression.match(identifierRegex) || [];
    
    const mathConstants = ['e', 'pi', 'PI'];
    const mathFunctions = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'exp', 'log', 'ln', 'sqrt', 'abs', 'floor', 'ceil', 'round',
      'max', 'min', 'pow'
    ];
    
    const params = matches
      .filter(id => id !== 'x')  // x 是自变量，不是参数
      .filter(id => !mathConstants.includes(id))
      .filter(id => !mathFunctions.includes(id));
    
    // 去重
    return [...new Set(params)];
  }

  // 生成默认参数配置
  static getDefaultParamConfig(): ParamConfig {
    return {
      default: 1,
      min: -5,
      max: 5,
      step: 0.1,
    };
  }
}

// 创建求值函数
export function createEvaluator(
  parsed: ParsedFunction
): (x: number, params: Record<string, number>) => number {
  return (x: number, params: Record<string, number>) => {
    const scope = { x, ...params };
    return parsed.compiled(scope);
  };
}
