import { useState } from 'react'
import { CustomerDetails } from '../types'

interface Props {
  onSubmit: (details: CustomerDetails) => void
  loading: boolean
}

type FormErrors = Partial<Record<keyof CustomerDetails, string>>

const EMPTY: CustomerDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zipCode: '',
}

function validate(data: CustomerDetails): FormErrors {
  const errors: FormErrors = {}
  if (!data.firstName.trim()) errors.firstName = 'First name is required'
  if (!data.lastName.trim()) errors.lastName = 'Last name is required'
  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!/^\+?[\d\s\-()]{7,15}$/.test(data.phone)) {
    errors.phone = 'Enter a valid phone number'
  }
  if (!data.address.trim()) errors.address = 'Address is required'
  if (!data.city.trim()) errors.city = 'City is required'
  if (!data.zipCode.trim()) {
    errors.zipCode = 'ZIP code is required'
  } else if (!/^\d{4,10}$/.test(data.zipCode.replace(/\s/g, ''))) {
    errors.zipCode = 'Enter a valid ZIP code'
  }
  return errors
}

export default function CheckoutForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<CustomerDetails>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerDetails, boolean>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (touched[name as keyof CustomerDetails]) {
      setErrors((prev) => ({ ...prev, [name]: validate({ ...form, [name]: value })[name as keyof CustomerDetails] }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validate(form)[name as keyof CustomerDetails] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched = Object.keys(EMPTY).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof CustomerDetails, boolean>
    )
    setTouched(allTouched)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length === 0) onSubmit(form)
  }

  const field = (
    name: keyof CustomerDetails,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={name}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        data-testid={`field-${name}`}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
          errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      />
      {errors[name] && (
        <p data-testid={`error-${name}`} className="text-xs text-red-600 mt-1">
          {errors[name]}
        </p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="checkout-form">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('firstName', 'First Name', 'text', 'John')}
        {field('lastName', 'Last Name', 'text', 'Doe')}
        {field('email', 'Email Address', 'email', 'john@example.com')}
        {field('phone', 'Phone Number', 'tel', '+1 555 000 0000')}
      </div>
      <div className="mt-4 space-y-4">
        {field('address', 'Street Address', 'text', '123 Main St')}
        <div className="grid grid-cols-2 gap-4">
          {field('city', 'City', 'text', 'New York')}
          {field('zipCode', 'ZIP Code', 'text', '10001')}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
      >
        {loading ? 'Placing Order…' : 'Place Order'}
      </button>
    </form>
  )
}
