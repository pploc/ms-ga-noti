import Handlebars from 'handlebars';

export class TemplateEngine {
  render(template: string, variables: Record<string, unknown>): string {
    const compiled = Handlebars.compile(template, { strict: true });
    return compiled(variables);
  }
}
