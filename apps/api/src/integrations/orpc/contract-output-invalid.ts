export function throwContractOutputInvalid(issues: string[]): never {
  throw new Error(`Contract output validation failed: ${issues.join('; ')}`);
}
