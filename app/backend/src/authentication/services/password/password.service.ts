import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  public checkPasswordSecurity(password: string): boolean {
    // Initialize flags for different criteria
    let hasDigit: boolean = false;
    let hasSymbol: boolean = false;
    let hasUnknownChar: boolean = false;
    const hasUppercase: boolean = password !== password.toLowerCase();
    const hasLowercase: boolean = password !== password.toUpperCase();

    // Allowed symbols
    const allowedSymbols: string = '~`! @#$%^&*()_-+={[}]|:;<,>.?/';

    // Check each character in the password
    for (const c of password) {
      if (/[a-zA-Z]/.test(c)) continue; // Check for letters

      // Check for digits
      if (/\d/.test(c)) {
        hasDigit = true;
      } else {
        // Check for symbols
        if (allowedSymbols.includes(c)) hasSymbol = true;
        else hasUnknownChar = true;
      }
    }

    // Return true if all criteria are met
    return (
      hasDigit && hasUppercase && hasLowercase && hasSymbol && !hasUnknownChar
    );
  }
}
