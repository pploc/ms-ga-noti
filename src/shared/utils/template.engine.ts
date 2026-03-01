import { injectable } from 'inversify';
import Handlebars from 'handlebars';

@injectable()
export class TemplateEngine {
  render(template: string, variables: Record<string, unknown>): string {
    const compiled = Handlebars.compile(template, { strict: true });
    return compiled(variables);
  }
}
