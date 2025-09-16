'use server'

// In a real app, this file would contain server-side logic for form submissions and data mutations.
// For this prototype, we'll include mock actions.

import { redirect } from 'next/navigation'

/**
 * Mock login function. In a real application, this would involve
 * validating user credentials against a database.
 * @param _prevState - The previous state, not used here.
 * @param _formData - The form data, not used in this mock.
 */
// Login action for Next.js form (single argument: FormData)

export async function loginAction(formData: FormData): Promise<void> {
  // Example: get username and password from form
  const username = formData.get('username');
  const password = formData.get('password');
  // TODO: Implement your authentication logic here
  // For now, just log to console (replace with real logic)
  console.log('Login attempt:', { username, password });
  // You can throw an error or redirect as needed

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Here you would typically validate credentials
  // e.g., const email = formData.get('email');
  
  // On successful validation, redirect to the dashboard
  redirect('/dashboard');
}

/**
 * Mock transaction submission function. In a real app, this would
 * save the transaction details to a database.
 * @param _prevState - The previous state, not used here.
 * @param _formData - The form data containing transaction details.
 */
export async function submitTransactionAction(_prevState: any, _formData: FormData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    // Here you would save the form data to your database
    // and update the dashboard state (e.g., via websockets or revalidation).
    
    // For this mock, we'll just return a success message.
    return {
        message: 'Transaksi berhasil dikirim! Silakan maju ke loket.',
        success: true,
    }
}
