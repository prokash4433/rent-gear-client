import type {
  EquipmentFormValues,
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
    errors.photo = "Profile photo is required"
  } else if (!/^https?:\/\/\S+$/.test(values.photo)) {
    errors.photo = "Upload a valid profile photo"
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

/** Returns the error messages for the Add Equipment form (empty object = valid). */
export function validateEquipment(
  values: EquipmentFormValues
): FormErrors<EquipmentFormValues> {
  const errors: FormErrors<EquipmentFormValues> = {}

  if (!values.name.trim()) {
    errors.name = "Equipment name is required"
  }

  if (!values.category) {
    errors.category = "Category is required"
  }

  if (!values.description.trim()) {
    errors.description = "Description is required"
  }

  if (!values.rentalPrice.trim()) {
    errors.rentalPrice = "Rental price is required"
  } else if (Number.isNaN(Number(values.rentalPrice)) || Number(values.rentalPrice) <= 0) {
    errors.rentalPrice = "Enter a price greater than 0"
  }

  if (!values.rentalType) {
    errors.rentalType = "Rental type is required"
  }

  if (!values.quantity.trim()) {
    errors.quantity = "Quantity is required"
  } else if (Number.isNaN(Number(values.quantity)) || Number(values.quantity) < 1) {
    errors.quantity = "Enter at least 1"
  }

  if (!values.location.trim()) {
    errors.location = "Location is required"
  }

  return errors
}
