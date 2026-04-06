import { CustomerDetails } from '../pages/CheckoutPage'

export const VALID_USER: CustomerDetails = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 555 123 4567',
  address: '123 Main Street',
  city: 'New York',
  zipCode: '10001',
}

export const INVALID_USERS = {
  emptyForm: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  } as CustomerDetails,

  badEmail: {
    ...VALID_USER,
    email: 'not-an-email',
  } as CustomerDetails,

  badPhone: {
    ...VALID_USER,
    phone: 'abc',
  } as CustomerDetails,

  badZip: {
    ...VALID_USER,
    zipCode: 'abc',
  } as CustomerDetails,
}
