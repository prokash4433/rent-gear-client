import type {
  FormErrors,
  PasswordCheck,
  SignInFormValues,
  SignUpFormValues,
} from "./types"

/** Simple email check: something, an @, then a domain with a dot. */
function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value)
}

/** Checks the three Sign Up password rules: uppercase, lowercase and 6+ characters. */
export function checkPassword(password: string): PasswordCheck {
  return {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasMinLength: password.length >= 6,
  }
}

/** Returns the error messages for the Sign In form (empty object = valid). */
export function validateSignIn(
  values: SignInFormValues
): FormErrors<SignInFormValues> {
  const errors: FormErrors<SignInFormValues> = {}

  if (!values.email.trim()) {
    errors.email = "Email is required"
  } else if (!isEmail(values.email)) {
    errors.email = "Enter a valid email address"
  }

  if (!values.password) {
    errors.password = "Password is required"
  }

  return errors
}

/** Returns the error messages for the Sign Up form (empty object = valid). */
export function validateSignUp(
  values: SignUpFormValues
): FormErrors<SignUpFormValues> {
  const errors: FormErrors<SignUpFormValues> = {}

  if (!values.name.trim()) {
    errors.name = "Name is required"
  }

  if (!values.email.trim()) {
    errors.email = "Email is required"
  } else if (!isEmail(values.email)) {
    errors.email = "Enter a valid email address"
  }

  if (!values.photo.trim()) {
    errors.photo = "Photo URL is required"
  } else if (!/^https?:\/\/\S+$/.test(values.photo)) {
    errors.photo = "Enter a URL starting with http:// or https://"
  }

  if (!values.password) {
    errors.password = "Password is required"
  } else {
    const rules = checkPassword(values.password)
    if (!rules.hasUppercase || !rules.hasLowercase || !rules.hasMinLength) {
      errors.password =
        "Password needs an uppercase letter, a lowercase letter and at least 6 characters"
    }
  }

  return errors
}
