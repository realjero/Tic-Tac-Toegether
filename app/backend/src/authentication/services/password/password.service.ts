import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * `PasswordService` is a service class dedicated to password-related operations, such as
 * checking password security based on specified criteria, hashing passwords, and comparing
 * hashed passwords for equality. It is designed to enhance security within the application
 * by ensuring strong password policies and secure password storage and comparison.
 *
 * @Injectable Decorator that marks this class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class PasswordService {
    /**
     * Evaluates the security of a given password based on predefined criteria: presence of at least one
     * digit, one uppercase letter, one lowercase letter, and one symbol from an allowed set, without containing
     * any unknown or disallowed characters.
     *
     * @param {string} password - The password string to be evaluated.
     * @returns {boolean} - `true` if the password meets all the security criteria, otherwise `false`.
     */
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
        return hasDigit && hasUppercase && hasLowercase && hasSymbol && !hasUnknownChar;
    }

    /**
     * Hashes a given password asynchronously using bcrypt with a specified number of salt rounds (in this case, 10).
     * This method provides secure password hashing suitable for storing in a database.
     *
     * @param {string} password - The plain text password to be hashed.
     * @returns {Promise<string>} - A promise that resolves to the hashed version of the password.
     */
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    /**
     * Compares a plain text password against a hashed password asynchronously to check if they match.
     * This is typically used for verifying user login attempts.
     *
     * @param {string} password1 - The plain text password to be compared.
     * @param {string} password2 - The hashed password to compare against.
     * @returns {Promise<boolean>} - A promise that resolves to `true` if the passwords match, otherwise `false`.
     */
    async arePasswordsEqual(password1: string, password2: string) {
        return await bcrypt.compare(password1, password2);
    }
}
