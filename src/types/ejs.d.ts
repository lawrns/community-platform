/**
 * Type declarations for ejs module
 */

declare module 'ejs' {
  export function renderFile(
    path: string,
    data: Record<string, any>,
    options?: Record<string, any>
  ): Promise<string>;
  
  export function render(
    template: string,
    data: Record<string, any>,
    options?: Record<string, any>
  ): string;
}